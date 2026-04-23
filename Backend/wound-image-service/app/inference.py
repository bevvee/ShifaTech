import cv2
import numpy as np
import torch
import os
import json
import tempfile
import uuid
from .model_loader import model

USE_IMAGENET_NORMALIZATION = os.getenv("WOUND_INPUT_NORMALIZATION", "imagenet").lower() == "imagenet"
IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGENET_STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)


def _build_input_tensor(image_bgr):
    # Training used PIL RGB tensors. OpenCV loads BGR, so convert before normalization.
    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    resized = cv2.resize(image_rgb, (256, 256), interpolation=cv2.INTER_LINEAR).astype(np.float32) / 255.0

    if USE_IMAGENET_NORMALIZATION:
        resized = (resized - IMAGENET_MEAN) / IMAGENET_STD

    chw = np.transpose(resized, (2, 0, 1))
    return torch.from_numpy(chw).unsqueeze(0).float().cpu()


def _predict_probability_map(input_tensor):
    with torch.no_grad():
        base_logits = model(input_tensor)

        # Lightweight TTA: horizontal flip keeps geometry but usually stabilizes boundaries.
        flipped_tensor = torch.flip(input_tensor, dims=[3])
        flipped_logits = model(flipped_tensor)
        flipped_logits = torch.flip(flipped_logits, dims=[3])

        logits = 0.5 * (base_logits + flipped_logits)

    probs = torch.sigmoid(logits).squeeze().cpu().numpy()
    return probs, base_logits


def _select_threshold(prob_map, max_prob):
    if max_prob >= 0.5:
        return 0.5
    if max_prob >= 0.35:
        return max(0.22, min(0.45, max_prob * 0.75))
    return max(0.10, min(0.30, max_prob * 0.55))


def _component_around_peak(binary_mask, prob_map):
    if int(binary_mask.sum()) == 0:
        return binary_mask

    peak_y, peak_x = np.unravel_index(np.argmax(prob_map), prob_map.shape)
    num_labels, labels, _stats, _ = cv2.connectedComponentsWithStats(binary_mask.astype(np.uint8), connectivity=8)

    peak_label = int(labels[peak_y, peak_x])
    if peak_label > 0:
        return (labels == peak_label).astype(np.uint8)

    # Fallback: largest component when peak falls outside thresholded region.
    if num_labels <= 1:
        return binary_mask

    areas = [(label, int((labels == label).sum())) for label in range(1, num_labels)]
    best_label = max(areas, key=lambda x: x[1])[0]
    return (labels == best_label).astype(np.uint8)


def _build_mask_256(prob_map):
    max_prob = float(prob_map.max())
    threshold = _select_threshold(prob_map, max_prob)
    mask_256 = (prob_map >= threshold).astype(np.uint8)

    # If the prediction is too sparse, use a percentile-assisted fallback and keep only
    # the component connected to the strongest wound response.
    min_pixels = 48
    if int(mask_256.sum()) < min_pixels:
        percentile_thr = float(np.percentile(prob_map, 97.5))
        fallback_thr = max(0.08, min(threshold, percentile_thr, max_prob * 0.70))
        fallback_mask = (prob_map >= fallback_thr).astype(np.uint8)
        if int(fallback_mask.sum()) > 0:
            threshold = fallback_thr
            mask_256 = fallback_mask

    mask_256 = _component_around_peak(mask_256, prob_map)

    if int(mask_256.sum()) > 0:
        kernel = np.ones((3, 3), np.uint8)
        mask_256 = cv2.morphologyEx(mask_256, cv2.MORPH_CLOSE, kernel)
        mask_256 = cv2.morphologyEx(mask_256, cv2.MORPH_OPEN, kernel)

    # Never allow complete collapse to an empty mask when the model has a signal.
    if int(mask_256.sum()) == 0 and max_prob > 0.08:
        peak_y, peak_x = np.unravel_index(np.argmax(prob_map), prob_map.shape)
        fallback_thr = max(0.08, max_prob * 0.50)
        seed_mask = (prob_map >= fallback_thr).astype(np.uint8)
        seed_mask = _component_around_peak(seed_mask, prob_map)

        if int(seed_mask.sum()) == 0:
            # Final fallback: small patch around the highest-probability point.
            seed_mask = np.zeros_like(prob_map, dtype=np.uint8)
            y0 = max(0, peak_y - 2)
            y1 = min(seed_mask.shape[0], peak_y + 3)
            x0 = max(0, peak_x - 2)
            x1 = min(seed_mask.shape[1], peak_x + 3)
            seed_mask[y0:y1, x0:x1] = 1

        mask_256 = seed_mask.astype(np.uint8)
        threshold = min(threshold, fallback_thr)

    return mask_256.astype(np.uint8), float(threshold), max_prob


def _refine_fullres_mask(mask_fullres):
    if int(mask_fullres.sum()) == 0:
        return mask_fullres

    num_labels, labels, _stats, _ = cv2.connectedComponentsWithStats(mask_fullres.astype(np.uint8), connectivity=8)
    if num_labels > 1:
        areas = [(label, int((labels == label).sum())) for label in range(1, num_labels)]
        best_label = max(areas, key=lambda x: x[1])[0]
        mask_fullres = (labels == best_label).astype(np.uint8)

    # For weak predictions, opening can delete the only valid region.
    area_before_morph = int(mask_fullres.sum())
    if area_before_morph < 120:
        return mask_fullres

    kernel = np.ones((3, 3), np.uint8)
    mask_fullres = cv2.morphologyEx(mask_fullres, cv2.MORPH_CLOSE, kernel)
    mask_fullres = cv2.morphologyEx(mask_fullres, cv2.MORPH_OPEN, kernel)
    return mask_fullres


def _classify_severity(wound_percentage):
    if wound_percentage >= 12:
        return "extensive"
    if wound_percentage >= 5:
        return "moderate"
    if wound_percentage >= 1:
        return "limited"
    return "minimal"


def _confidence_label(max_probability, low_confidence):
    if low_confidence:
        return "low"
    if max_probability >= 0.7:
        return "high"
    if max_probability >= 0.5:
        return "moderate"
    return "guarded"


def _build_report(wound_pixels, wound_percentage, confidence):
    severity = _classify_severity(wound_percentage)
    confidence_label = _confidence_label(
        float(confidence.get("max_probability", 0.0)),
        bool(confidence.get("low_confidence", False)),
    )

    if severity == "extensive":
        recommendation = "Urgent specialist review is recommended because the wound covers a large portion of the image."
    elif severity == "moderate":
        recommendation = "Non-urgent specialist review is recommended and the wound should be monitored closely."
    elif severity == "limited":
        recommendation = "Continue current treatment with routine follow-up unless clinical signs worsen."
    else:
        recommendation = "Minimal wound area detected; continue current care and monitor for changes."

    if confidence_label == "low":
        recommendation = (
            recommendation
            + " Interpretation confidence is limited, so a clinician should review the image before acting."
        )

    summary = (
        f"The segmentation model detected approximately {wound_percentage:.2f}% wound area "
        f"({wound_pixels} pixels) with {confidence_label} confidence."
    )

    key_findings = [
        f"Estimated wound area: {wound_percentage:.2f}% of the image.",
        f"Detected wound pixels: {wound_pixels}.",
        f"Confidence status: {confidence_label}.",
        f"Suggested severity: {severity}.",
    ]

    return {
        "title": "Wound Segmentation Report",
        "severity": severity,
        "summary": summary,
        "key_findings": key_findings,
        "recommendation": recommendation,
        "disclaimer": "This report is an automated decision-support summary and does not replace clinical judgment.",
    }

def analyze_wound(image_path):
    try:
        print(f"Analyzing wound image: {image_path}")
        
        # 1. Load image
        original_bgr = cv2.imread(image_path)
        
        if original_bgr is None:
            raise ValueError(f"Failed to load image from {image_path}")
        
        original_h, original_w = original_bgr.shape[:2]
        print(f"Original image size: {original_w}x{original_h}")

        # 2. Match training preprocessing (RGB + resize + optional ImageNet normalization).
        tensor = _build_input_tensor(original_bgr)
        
        print(f"Tensor shape: {tensor.shape}")

        # 4. Inference
        sigmoid_output, output_for_log = _predict_probability_map(tensor)
        
        print(f"Model output shape: {output_for_log.shape}")
        print(f"Model output range: [{output_for_log.min():.4f}, {output_for_log.max():.4f}]")
        
        print(f"After sigmoid - range: [{sigmoid_output.min():.4f}, {sigmoid_output.max():.4f}]")

        # 6. Convert to mask using the same 256x256 grid the model predicts on.
        mask_256, threshold, max_prob = _build_mask_256(sigmoid_output)

        # Resize back to the original dimensions.
        mask = cv2.resize(mask_256, (original_w, original_h), interpolation=cv2.INTER_NEAREST)
        mask = _refine_fullres_mask(mask)
        print(f"Threshold used: {threshold:.4f}, max_prob: {max_prob:.4f}")
        print(f"Mask pixels detected (256x256): {int(mask_256.sum())}")

        # 8. Compute pixels
        wound_pixels = int(mask.sum())
        total_pixels = mask.shape[0] * mask.shape[1]
        wound_percentage = (wound_pixels / total_pixels) * 100
        report = _build_report(wound_pixels, wound_percentage, {
            "max_probability": float(max_prob),
            "mean_probability": float(sigmoid_output.mean()),
            "threshold_used": float(threshold),
            "low_confidence": bool(max_prob < 0.35),
        })
        
        print(f"Final result - Pixels: {wound_pixels}, Percentage: {wound_percentage:.2f}%")

        # 9. Save artifact images (binary mask + overlay)
        artifact_id = str(uuid.uuid4())
        tmp_dir = tempfile.gettempdir()
        mask_path = os.path.join(tmp_dir, f"mask_{artifact_id}.png")
        overlay_path = os.path.join(tmp_dir, f"overlay_{artifact_id}.png")
        report_path = os.path.join(tmp_dir, f"report_{artifact_id}.json")

        mask_img = (mask * 255).astype(np.uint8)
        cv2.imwrite(mask_path, mask_img)

        overlay = original_bgr.copy()
        if overlay is not None:
            red_layer = np.zeros_like(overlay)
            red_layer[:, :, 2] = 255
            alpha = 0.35
            blended = cv2.addWeighted(overlay, 1.0, red_layer, alpha, 0.0)
            overlay = np.where(mask[:, :, None] == 1, blended, overlay)
            cv2.imwrite(overlay_path, overlay)

        mean_prob = float(sigmoid_output.mean())
        low_confidence = max_prob < 0.35

        report["confidence_level"] = _confidence_label(max_prob, low_confidence)
        report["wound_percentage"] = round(wound_percentage, 2)
        report["wound_pixels"] = wound_pixels
        report["threshold_used"] = round(float(threshold), 4)

        with open(report_path, "w", encoding="utf-8") as fp:
            json.dump(report, fp, ensure_ascii=True, indent=2)

        return {
            "wound_pixels": wound_pixels,
            "wound_percentage": round(wound_percentage, 2),
            "confidence": {
                "max_probability": round(max_prob, 4),
                "mean_probability": round(mean_prob, 4),
                "threshold_used": round(float(threshold), 4),
                "low_confidence": low_confidence
            },
            "report": report,
            "artifacts": {
                "mask_local_path": mask_path,
                "overlay_local_path": overlay_path if os.path.exists(overlay_path) else None,
                "report_local_path": report_path if os.path.exists(report_path) else None,
            }
        }
        
    except Exception as e:
        print(f"Error during wound analysis: {str(e)}")
        raise

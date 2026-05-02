"""
Diagnostic script to check model checkpoint compatibility.
Run this to see what's in the current checkpoint and identify the mismatch.
"""

import torch
import sys
from pathlib import Path

# Add app to path
sys.path.insert(0, str(Path(__file__).parent))

from app.model_loader import (
    _extract_state_dict,
    _infer_architecture,
    _build_model,
    _load_into_model,
)


def check_checkpoint(checkpoint_path):
    """Analyze a checkpoint and show compatibility info."""
    
    if not Path(checkpoint_path).exists():
        print(f"❌ Checkpoint not found: {checkpoint_path}")
        return False
    
    print(f"📦 Analyzing checkpoint: {checkpoint_path}")
    print(f"   File size: {Path(checkpoint_path).stat().st_size / 1e6:.2f} MB")
    
    try:
        checkpoint = torch.load(checkpoint_path, map_location="cpu")
        print(f"✓ Successfully loaded checkpoint")
        
        # Extract state dict
        state_dict = _extract_state_dict(checkpoint)
        print(f"✓ Extracted state_dict with {len(state_dict)} keys")
        
        # Infer architecture
        architecture = _infer_architecture(state_dict)
        print(f"✓ Inferred architecture: {architecture}")
        
        # Show first 10 keys
        print(f"\n📋 First 10 state_dict keys:")
        for i, key in enumerate(list(state_dict.keys())[:10]):
            print(f"   {i+1}. {key}")
        
        # Try to build and load model
        print(f"\n🔧 Attempting to build model...")
        model = _build_model(architecture)
        print(f"✓ Built {architecture} model")
        
        print(f"\n📊 Loading checkpoint into model...")
        load_result, coverage = _load_into_model(model, state_dict)
        
        print(f"   Coverage: {coverage*100:.2f}%")
        print(f"   Missing keys: {len(load_result.missing_keys)}")
        print(f"   Unexpected keys: {len(load_result.unexpected_keys)}")
        
        if load_result.missing_keys:
            print(f"\n   ⚠️  Missing keys (in model but not in checkpoint):")
            for key in load_result.missing_keys[:5]:
                print(f"      - {key}")
            if len(load_result.missing_keys) > 5:
                print(f"      ... and {len(load_result.missing_keys) - 5} more")
        
        if load_result.unexpected_keys:
            print(f"\n   ⚠️  Unexpected keys (in checkpoint but not in model):")
            for key in load_result.unexpected_keys[:5]:
                print(f"      - {key}")
            if len(load_result.unexpected_keys) > 5:
                print(f"      ... and {len(load_result.unexpected_keys) - 5} more")
        
        if coverage >= 0.9:
            print(f"\n✅ Checkpoint is COMPATIBLE (coverage >= 90%)")
            return True
        else:
            print(f"\n❌ Checkpoint is INCOMPATIBLE (coverage < 90%)")
            return False
            
    except Exception as e:
        print(f"❌ Error analyzing checkpoint: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    model_path = Path(__file__).parent / "models" / "wound_model.pth"
    check_checkpoint(str(model_path))

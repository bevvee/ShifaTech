import os
from datetime import timedelta
from minio import Minio
from minio.error import S3Error

MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "minio:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "admin")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "admin123")

# Use the public MinIO endpoint as a fallback when presigned URL generation fails.
# Format: http://localhost:9000/ (configured in docker-compose)
MINIO_PUBLIC_URL = os.getenv("MINIO_PUBLIC_URL", "http://localhost:9000")

MINIO_SECURE = os.getenv("MINIO_SECURE", "false").lower() == "true"

# When True the service will use the MINIO_PUBLIC_URL directly.
# Set `MINIO_USE_PUBLIC_URL=false` to return presigned URLs instead (recommended
# when the bucket is private). Presigned URLs are built using
# `MINIO_PUBLIC_ENDPOINT` which should be reachable from the browser.
MINIO_USE_PUBLIC_URL = os.getenv("MINIO_USE_PUBLIC_URL", "false").lower() == "true"
MINIO_PUBLIC_ENDPOINT = os.getenv("MINIO_PUBLIC_ENDPOINT")

print(f"Connecting to MinIO at: {MINIO_ENDPOINT}")
print(f"Public URL for downloads: {MINIO_PUBLIC_URL}")

client = Minio(
    MINIO_ENDPOINT,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=MINIO_SECURE
)

BUCKET = "wound-images"


def ensure_bucket_exists():
    try:
        if not client.bucket_exists(BUCKET):
            client.make_bucket(BUCKET)
            print(f"Created bucket: {BUCKET}")
    except S3Error as e:
        print(f"Error ensuring bucket exists: {str(e)}")
        raise


def download_image(object_name, file_path):
    try:
        ensure_bucket_exists()
        print(f"Downloading {object_name} from bucket {BUCKET}")
        client.fget_object(BUCKET, object_name, file_path)
        print(f"Successfully downloaded to {file_path}")
    except Exception as e:
        print(f"Error downloading image: {str(e)}")
        raise


def upload_file(object_name, file_path):
    try:
        ensure_bucket_exists()
        print(f"Uploading {object_name} to bucket {BUCKET}")
        client.fput_object(BUCKET, object_name, file_path)
        print(f"Successfully uploaded {object_name}")
    except Exception as e:
        print(f"Error uploading file: {str(e)}")
        raise


def build_object_url(object_name):
    """Return a URL that can be used by the browser to download the object.

    Behavior:
    - If `MINIO_USE_PUBLIC_URL` is true (default), return the nginx gateway URL
      constructed from `MINIO_PUBLIC_URL`.
    - Otherwise attempt to generate a presigned GET URL using the MinIO
      credentials. The presign client will use `MINIO_PUBLIC_ENDPOINT` if set,
      otherwise falls back to `MINIO_ENDPOINT`.
    """
    if MINIO_USE_PUBLIC_URL:
        return f"{MINIO_PUBLIC_URL}/{BUCKET}/{object_name}"

    # Build a presigned URL so the browser can fetch the object even if the
    # bucket is not public.
    endpoint_for_presign = MINIO_PUBLIC_ENDPOINT or MINIO_ENDPOINT
    # Normalize: remove scheme if provided (Minio client expects host:port)
    if endpoint_for_presign.startswith("http://"):
        endpoint_for_presign = endpoint_for_presign[len("http://"):]
    elif endpoint_for_presign.startswith("https://"):
        endpoint_for_presign = endpoint_for_presign[len("https://"):]

    try:
        presign_client = Minio(
            endpoint_for_presign,
            access_key=MINIO_ACCESS_KEY,
            secret_key=MINIO_SECRET_KEY,
            secure=MINIO_SECURE,
            region="us-east-1",
        )
        # MinIO expects a timedelta for the presign expiry.
        url = presign_client.presigned_get_object(BUCKET, object_name, expires=timedelta(hours=1))
        return url
    except Exception as e:
        # Fall back to the public gateway URL if presign fails
        print(f"Failed to generate presigned URL: {e}")
        return f"{MINIO_PUBLIC_URL}/{BUCKET}/{object_name}"

import os
from minio import Minio
from minio.error import S3Error

MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "minio:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "admin")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "admin123")
MINIO_PUBLIC_ENDPOINT = os.getenv("MINIO_PUBLIC_ENDPOINT", "localhost:9000")
MINIO_SECURE = os.getenv("MINIO_SECURE", "false").lower() == "true"

print(f"Connecting to MinIO at: {MINIO_ENDPOINT}")

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
    scheme = "https" if MINIO_SECURE else "http"
    return f"{scheme}://{MINIO_PUBLIC_ENDPOINT}/{BUCKET}/{object_name}"

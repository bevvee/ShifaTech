import os
from minio import Minio

MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "localhost:9000")

client = Minio(
    MINIO_ENDPOINT,
    access_key=os.getenv("MINIO_ACCESS_KEY", "admin"),
    secret_key=os.getenv("MINIO_SECRET_KEY", "admin123"),
    secure=False
)

BUCKET = "wound-images"


def download_image(object_name, file_path):
    client.fget_object(BUCKET, object_name, file_path)


def upload_file(object_name, file_path):
    client.fput_object(BUCKET, object_name, file_path)
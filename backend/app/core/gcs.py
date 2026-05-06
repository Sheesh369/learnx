import io
import os
import uuid
from google.cloud import storage
from app.core.config import GCS_BUCKET_NAME, STORAGE_EMULATOR_HOST

# Set emulator host before any client is constructed
if STORAGE_EMULATOR_HOST:
    os.environ["STORAGE_EMULATOR_HOST"] = STORAGE_EMULATOR_HOST


def get_gcs_client() -> storage.Client:
    return storage.Client()


def upload_bytes(data: bytes, content_type: str, folder: str = "uploads") -> str:
    """Upload raw bytes to GCS. Returns the public GCS URL (or emulator URL in local dev)."""
    client = get_gcs_client()
    bucket = client.bucket(GCS_BUCKET_NAME)
    blob_name = f"{folder}/{uuid.uuid4()}"
    blob = bucket.blob(blob_name)
    blob.upload_from_file(io.BytesIO(data), content_type=content_type)
    if STORAGE_EMULATOR_HOST:
        encoded = blob_name.replace("/", "%2F")
        return f"{STORAGE_EMULATOR_HOST}/download/storage/v1/b/{GCS_BUCKET_NAME}/o/{encoded}?alt=media"
    return f"https://storage.googleapis.com/{GCS_BUCKET_NAME}/{blob_name}"


def upload_file(file_path: str, content_type: str, folder: str = "uploads") -> str:
    """Upload a local file to GCS. Returns the public GCS URL."""
    with open(file_path, "rb") as f:
        return upload_bytes(f.read(), content_type, folder)


def _blob_name_from_url(gcs_url: str) -> str | None:
    """Extract blob name from either a public GCS URL or emulator download URL."""
    public_prefix = f"https://storage.googleapis.com/{GCS_BUCKET_NAME}/"
    if gcs_url.startswith(public_prefix):
        return gcs_url[len(public_prefix):]
    # Emulator URL: .../o/<encoded_blob_name>?alt=media
    emulator_marker = f"/b/{GCS_BUCKET_NAME}/o/"
    if emulator_marker in gcs_url:
        after = gcs_url.split(emulator_marker, 1)[1]
        encoded = after.split("?")[0]
        return encoded.replace("%2F", "/")
    return None


def delete_blob(gcs_url: str) -> bool:
    """Delete a blob by its full GCS URL (public or emulator). Returns True if deleted."""
    try:
        blob_name = _blob_name_from_url(gcs_url)
        if not blob_name:
            return False
        client = get_gcs_client()
        bucket = client.bucket(GCS_BUCKET_NAME)
        blob = bucket.blob(blob_name)
        blob.delete()
        return True
    except Exception:
        return False

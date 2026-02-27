import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from core.config import supabase_admin
from core.auth_middleware import get_current_user

router = APIRouter(prefix="/uploads", tags=["uploads"])

ALLOWED_VIDEO = {"video/mp4", "video/quicktime", "video/webm", "video/x-msvideo"}
ALLOWED_DECK  = {
    "application/pdf",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/keynote",
}
VIDEO_MAX_BYTES = 150 * 1024 * 1024   # 150 MB
DECK_MAX_BYTES  =  20 * 1024 * 1024   #  20 MB

BUCKET_VIDEO = "pitch-videos"
BUCKET_DECK  = "pitch-decks"


def _upload(bucket: str, user_id: str, file: UploadFile, content: bytes) -> str:
    """Upload bytes to a Supabase Storage bucket and return the public or signed URL."""
    ext  = Path(file.filename or "file").suffix or ".bin"
    key  = f"{user_id}/{uuid.uuid4().hex}{ext}"
    resp = supabase_admin.storage.from_(bucket).upload(
        key,
        content,
        {"content-type": file.content_type, "upsert": "false"},
    )
    # pitch-videos is private → signed URL (1 year)
    if bucket == BUCKET_VIDEO:
        signed = supabase_admin.storage.from_(bucket).create_signed_url(key, 31_536_000)
        return signed["signedURL"]
    # pitch-decks is public
    return supabase_admin.storage.from_(bucket).get_public_url(key)


@router.post("/video")
async def upload_video(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_VIDEO:
        raise HTTPException(status_code=415, detail=f"Unsupported video type: {file.content_type}")
    content = await file.read()
    if len(content) > VIDEO_MAX_BYTES:
        raise HTTPException(status_code=413, detail="Video exceeds 150 MB limit")
    url = _upload(BUCKET_VIDEO, user_id, file, content)
    return {"url": url}


@router.post("/deck")
async def upload_deck(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_DECK:
        raise HTTPException(status_code=415, detail=f"Unsupported deck type: {file.content_type}")
    content = await file.read()
    if len(content) > DECK_MAX_BYTES:
        raise HTTPException(status_code=413, detail="Deck exceeds 20 MB limit")
    url = _upload(BUCKET_DECK, user_id, file, content)
    return {"url": url}

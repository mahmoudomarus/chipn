import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from schemas.models import IdeaProductCreate, IdeaProductResponse
from core.config import supabase

router = APIRouter(prefix="/posts", tags=["posts"])

@router.post("/", response_model=IdeaProductResponse)
def create_post(post: IdeaProductCreate) -> IdeaProductResponse:
    try:
        data = post.model_dump()
        response = supabase.table("posts").insert(data).execute()
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to create post")
        return IdeaProductResponse(**response.data[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{post_id}", response_model=IdeaProductResponse)
def get_post(post_id: str) -> IdeaProductResponse:
    try:
        response = supabase.table("posts").select("*").eq("id", post_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Post not found")
        return IdeaProductResponse(**response.data[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

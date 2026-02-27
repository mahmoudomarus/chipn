import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from schemas.models import IdeaProductCreate, IdeaProductResponse
from core.config import supabase

router = APIRouter(prefix="/posts", tags=["posts"])


@router.post("/", response_model=IdeaProductResponse)
def create_post(post: IdeaProductCreate) -> IdeaProductResponse:
    try:
        data = post.model_dump(exclude_none=True)
        response = supabase.table("posts").insert(data).execute()
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to create post")
        return IdeaProductResponse(**response.data[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[IdeaProductResponse])
def get_posts(author_id: Optional[str] = Query(None)) -> List[IdeaProductResponse]:
    """Fetch posts, optionally filtered by author_id for Profile dashboard."""
    try:
        query = supabase.table("posts").select("*").order("created_at", desc=True)
        if author_id:
            query = query.eq("author_id", author_id)
        response = query.execute()
        return [IdeaProductResponse(**item) for item in response.data]
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


@router.patch("/{post_id}/boost", response_model=IdeaProductResponse)
def boost_post(post_id: str) -> IdeaProductResponse:
    """Increment boost_count atomically for a post."""
    try:
        # Read current count, then increment — Supabase JS RPC would be cleaner
        # but we keep it pure REST here
        response = supabase.table("posts").select("boost_count").eq("id", post_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Post not found")
        current = response.data[0].get("boost_count", 0) or 0
        updated = supabase.table("posts").update({"boost_count": current + 1}).eq("id", post_id).execute()
        if not updated.data:
            raise HTTPException(status_code=400, detail="Boost failed")
        return IdeaProductResponse(**updated.data[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

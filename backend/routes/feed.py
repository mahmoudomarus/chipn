from fastapi import APIRouter, HTTPException
from schemas.models import FeedResponse, IdeaProductResponse
from core.config import supabase

router = APIRouter(prefix="/feed", tags=["feed"])

@router.get("/", response_model=FeedResponse)
def get_feed(cursor: int = 0) -> FeedResponse:
    try:
        limit = 5
        response = supabase.table("posts").select("*").order("created_at", desc=True).range(cursor, cursor + limit - 1).execute()
        items = [IdeaProductResponse(**item) for item in response.data]
        next_cursor = cursor + limit if len(items) == limit else None
        return FeedResponse(items=items, next_cursor=next_cursor)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

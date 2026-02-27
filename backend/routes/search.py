from typing import List
from fastapi import APIRouter, HTTPException
from schemas.models import IdeaProductResponse
from core.config import supabase

router = APIRouter(prefix="/search", tags=["search"])

@router.get("/", response_model=List[IdeaProductResponse])
def search_posts(query: str, deep: bool = False) -> List[IdeaProductResponse]:
    """
    Search ideas/products against real Supabase data.
    Standard search: ilike match on title + description.
    Deep search: also searches ai_summary field for broader semantic coverage.
    """
    try:
        q = f"%{query}%"
        if deep:
            # Deep search: match title, description, OR ai_summary
            response = supabase.table("posts").select("*").or_(
                f"title.ilike.{q},description.ilike.{q},ai_summary.ilike.{q}"
            ).order("created_at", desc=True).execute()
        else:
            # Standard text search on title + description
            response = supabase.table("posts").select("*").or_(
                f"title.ilike.{q},description.ilike.{q}"
            ).order("created_at", desc=True).execute()

        return [IdeaProductResponse(**item) for item in response.data]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

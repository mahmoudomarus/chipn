from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from schemas.models import IdeaProductCreate, IdeaProductResponse
from core.config import supabase, supabase_admin
from core.auth_middleware import get_current_user, get_optional_user

router = APIRouter(prefix="/posts", tags=["posts"])


@router.post("/", response_model=IdeaProductResponse)
def create_post(
    post: IdeaProductCreate,
    user_id: str = Depends(get_current_user),
) -> IdeaProductResponse:
    """Create a new post. author_id is taken from the verified JWT — not the request body."""
    try:
        data = post.model_dump(exclude_none=True)
        data["author_id"] = user_id  # override any body-supplied author_id
        response = supabase_admin.table("posts").insert(data).execute()
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to create post")
        return IdeaProductResponse(**response.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[IdeaProductResponse])
def get_posts(author_id: Optional[str] = Query(None)) -> List[IdeaProductResponse]:
    """Return posts, optionally filtered by author_id. Public endpoint."""
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
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{post_id}/boost", response_model=IdeaProductResponse)
def boost_post(
    post_id: str,
    _: str = Depends(get_current_user),
) -> IdeaProductResponse:
    """
    Increment boost_count for a post. Requires authentication.
    Uses supabase_admin (service role) so the UPDATE passes RLS regardless of author.
    """
    try:
        current = supabase_admin.table("posts").select("boost_count").eq("id", post_id).execute()
        if not current.data:
            raise HTTPException(status_code=404, detail="Post not found")
        count = (current.data[0].get("boost_count") or 0) + 1
        updated = supabase_admin.table("posts").update({"boost_count": count}).eq("id", post_id).execute()
        if not updated.data:
            raise HTTPException(status_code=400, detail="Boost failed")
        return IdeaProductResponse(**updated.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

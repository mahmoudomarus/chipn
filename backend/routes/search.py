from typing import List
from fastapi import APIRouter
from backend.schemas.models import IdeaProductResponse
import uuid
from datetime import datetime

router = APIRouter(prefix="/search", tags=["search"])

@router.get("/", response_model=List[IdeaProductResponse])
def search_posts(query: str, deep: bool = False) -> List[IdeaProductResponse]:
    """
    Search ideas/products. If `deep` is true, perform a semantic deep search.
    """
    # Mock search functionality
    return [
        IdeaProductResponse(
            id=str(uuid.uuid4()),
            author_id="author-search",
            type="idea",
            title=f"Result for: {query}",
            description="Deep search found semantics similar to your query." if deep else "Text match found.",
            status="active",
            created_at=datetime.utcnow()
        )
    ]

import uuid
from datetime import datetime
from fastapi import APIRouter
from backend.schemas.models import FeedResponse, IdeaProductResponse

router = APIRouter(prefix="/feed", tags=["feed"])

@router.get("/", response_model=FeedResponse)
def get_feed(cursor: int = 0) -> FeedResponse:
    """
    TikTok-style algorithm feeding a shuffled batch of ideas/products.
    Uses Redis coordinate for quick access.
    """
    # Dummy data
    items = []
    for i in range(5):
        items.append(
            IdeaProductResponse(
                id=str(uuid.uuid4()),
                author_id=f"author-{i}",
                type="idea",
                title=f"Cool Idea #{i + cursor}",
                description="This is a smart shuffled idea to swipe through.",
                status="active",
                ai_summary="An exciting investment opportunity!",
                created_at=datetime.utcnow()
            )
        )
    return FeedResponse(items=items, next_cursor=cursor + 5)

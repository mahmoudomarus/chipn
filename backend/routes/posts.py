import uuid
from datetime import datetime
from fastapi import APIRouter
from backend.schemas.models import IdeaProductCreate, IdeaProductResponse

router = APIRouter(prefix="/posts", tags=["posts"])

@router.post("/", response_model=IdeaProductResponse)
def create_post(post: IdeaProductCreate) -> IdeaProductResponse:
    """
    Create a new idea, product, or request.
    In real implementation, this inserts a record into Supabase.
    """
    return IdeaProductResponse(
        id=str(uuid.uuid4()),
        author_id="author-123",  # Mocked from auth middleware
        status="pending",
        created_at=datetime.utcnow(),
        **post.model_dump()
    )

@router.get("/{post_id}", response_model=IdeaProductResponse)
def get_post(post_id: str) -> IdeaProductResponse:
    """
    Get details of a post by ID.
    """
    return IdeaProductResponse(
        id=post_id,
        author_id="author-123",
        type="idea",
        title="Sample Idea",
        description="A cool idea description",
        status="active",
        created_at=datetime.utcnow()
    )

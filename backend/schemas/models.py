from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class UserBase(BaseModel):
    id: str
    email: str
    name: str
    role: str = Field(pattern="^(founder|investor|normal)$")
    verified_id_status: bool = False


class IdeaProductCreate(BaseModel):
    author_id: str
    type: str = Field(pattern="^(idea|product|request)$")
    title: str
    description: str
    content: Optional[str] = None
    ai_summary: Optional[str] = None
    video_url: Optional[str] = None       # YouTube embed or direct MP4 URL
    deck_url: Optional[str] = None        # Pitch deck PDF or link
    product_url: Optional[str] = None     # Product/landing page URL


class IdeaProductResponse(IdeaProductCreate):
    id: str
    status: str
    boost_count: int = 0
    created_at: datetime


class InvestmentCreate(BaseModel):
    post_id: str
    amount: float = Field(gt=0)
    due_diligence_doc_url: Optional[str] = None


class InvestmentResponse(InvestmentCreate):
    id: str
    investor_id: str
    status: str
    created_at: datetime


class DueDiligenceSubmit(BaseModel):
    investment_id: str
    notes: str


class FeedResponse(BaseModel):
    items: List[IdeaProductResponse]
    next_cursor: Optional[int] = None

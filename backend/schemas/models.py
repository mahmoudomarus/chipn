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
    type: str = Field(pattern="^(idea|product|request)$")
    title: str
    description: str
    content: Optional[str] = None

class IdeaProductResponse(IdeaProductCreate):
    id: str
    author_id: str
    ai_summary: Optional[str] = None
    status: str
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

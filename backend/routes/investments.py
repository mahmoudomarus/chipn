import uuid
from datetime import datetime
from fastapi import APIRouter
from backend.schemas.models import InvestmentCreate, InvestmentResponse, DueDiligenceSubmit

router = APIRouter(prefix="/investments", tags=["investments"])

@router.post("/", response_model=InvestmentResponse)
def create_investment(inv: InvestmentCreate) -> InvestmentResponse:
    """
    Submit an investment or support for a specific idea/product.
    """
    return InvestmentResponse(
        id=str(uuid.uuid4()),
        investor_id="investor-123",
        status="pending_diligence" if inv.amount > 10000 else "approved",
        created_at=datetime.utcnow(),
        **inv.model_dump()
    )

@router.post("/due-diligence")
def submit_due_diligence(diligence: DueDiligenceSubmit):
    """
    Submit additional notes/documents for due diligence on large investments.
    """
    return {"message": "Due diligence submitted successfully", "investment_id": diligence.investment_id}

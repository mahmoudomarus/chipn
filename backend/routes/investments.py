import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from schemas.models import InvestmentCreate, InvestmentResponse, DueDiligenceSubmit
from core.config import supabase

router = APIRouter(prefix="/investments", tags=["investments"])

@router.post("/", response_model=InvestmentResponse)
def create_investment(inv: InvestmentCreate, investor_id: str) -> InvestmentResponse:
    try:
        data = inv.model_dump()
        data["investor_id"] = investor_id
        data["status"] = "pending_diligence" if inv.amount > 10000 else "approved"
        
        response = supabase.table("investments").insert(data).execute()
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to create investment")
        return InvestmentResponse(**response.data[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/due-diligence")
def submit_due_diligence(diligence: DueDiligenceSubmit):
    try:
        response = supabase.table("investments").update({
            "due_diligence_doc_url": diligence.notes,
            "status": "in_review"
        }).eq("id", diligence.investment_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Investment not found")
        return {"message": "Due diligence submitted successfully", "investment_id": diligence.investment_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

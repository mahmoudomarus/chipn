from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from schemas.models import InvestmentCreate, InvestmentResponse, DueDiligenceSubmit
from core.config import supabase, supabase_admin
from core.auth_middleware import get_current_user

router = APIRouter(prefix="/investments", tags=["investments"])


@router.get("/", response_model=List[InvestmentResponse])
def get_investments_by_investor(
    investor_id: str = Query(...),
    user_id: str = Depends(get_current_user),
) -> List[InvestmentResponse]:
    """
    Return investments for the authenticated user.
    investor_id param is verified against the JWT user_id to prevent cross-user reads.
    """
    if investor_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    try:
        response = (
            supabase_admin.table("investments")
            .select("*")
            .eq("investor_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return [InvestmentResponse(**item) for item in response.data]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/inbound", response_model=List[dict])
def get_inbound_investments(
    user_id: str = Depends(get_current_user),
) -> List[dict]:
    """
    Return all investments made into the authenticated user's posts.
    Groups by post: returns each investment with the post title.
    """
    try:
        # Get all posts by this user
        posts_resp = supabase_admin.table("posts").select("id, title").eq("author_id", user_id).execute()
        if not posts_resp.data:
            return []

        post_ids = [p["id"] for p in posts_resp.data]
        post_map = {p["id"]: p["title"] for p in posts_resp.data}

        # Get all investments for those posts
        inv_resp = (
            supabase_admin.table("investments")
            .select("*")
            .in_("post_id", post_ids)
            .order("created_at", desc=True)
            .execute()
        )

        result = []
        for inv in inv_resp.data:
            result.append({**inv, "post_title": post_map.get(inv["post_id"], "Unknown")})
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=InvestmentResponse)
def create_investment(
    inv: InvestmentCreate,
    user_id: str = Depends(get_current_user),
) -> InvestmentResponse:
    """
    Create an investment. investor_id is taken from the verified JWT.
    Uses supabase_admin to bypass RLS on INSERT.
    """
    try:
        data = inv.model_dump(exclude_none=True)
        data["investor_id"] = user_id
        data["status"] = "pending_diligence" if inv.amount > 10000 else "approved"
        response = supabase_admin.table("investments").insert(data).execute()
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to create investment")
        return InvestmentResponse(**response.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/due-diligence")
def submit_due_diligence(
    diligence: DueDiligenceSubmit,
    user_id: str = Depends(get_current_user),
):
    """
    Attach due diligence notes to an investment.
    Verifies ownership before updating.
    """
    try:
        # Verify the investment belongs to this user
        check = (
            supabase_admin.table("investments")
            .select("investor_id")
            .eq("id", diligence.investment_id)
            .execute()
        )
        if not check.data:
            raise HTTPException(status_code=404, detail="Investment not found")
        if check.data[0]["investor_id"] != user_id:
            raise HTTPException(status_code=403, detail="Access denied")

        supabase_admin.table("investments").update({
            "due_diligence_doc_url": diligence.notes,
            "status": "in_review",
        }).eq("id", diligence.investment_id).execute()

        return {"investment_id": diligence.investment_id, "status": "in_review"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/verify-id")
def verify_id_status():
    """
    Dummy endpoint that would normally verify ID using a third-party service 
    and update Supabase auth metadata.
    """
    return {"message": "ID verified. You can now submit ideas or invest."}

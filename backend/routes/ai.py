from fastapi import APIRouter, HTTPException
from core.config import anthropic_client

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/summarize")
async def summarize_post(content: str) -> dict:
    """
    Uses Anthropic's Claude to summarize the submitted idea/product so investors can digest it quickly.
    """
    # Using a dummy fallback for local dev if key is dummy
    if anthropic_client.api_key == "dummy_key":
         return {"summary": f"AI Summary: {content[:100]}..."}
    
    try:
        response = await anthropic_client.messages.create(
            max_tokens=256,
            model="claude-3-haiku-20240307",
            messages=[{
                "role": "user", 
                "content": f"Briefly summarize this crowdfunding idea/product for investors. Keep it exciting but factual: {content}"
            }]
        )
        return {"summary": response.content[0].text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

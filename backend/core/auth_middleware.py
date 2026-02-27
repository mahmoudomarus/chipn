from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from core.config import supabase_admin

_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> str:
    """
    Validates the Supabase access token passed as a Bearer header.
    Returns the authenticated user's UUID string.
    Raises 401 if the token is missing or invalid.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization token",
        )
    try:
        response = supabase_admin.auth.get_user(credentials.credentials)
        user = response.user
        if not user:
            raise ValueError("No user in response")
        return str(user.id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> str | None:
    """
    Like get_current_user but returns None instead of raising for unauthenticated requests.
    Use this on public endpoints that optionally benefit from knowing the user.
    """
    if not credentials:
        return None
    try:
        response = supabase_admin.auth.get_user(credentials.credentials)
        user = response.user
        return str(user.id) if user else None
    except Exception:
        return None

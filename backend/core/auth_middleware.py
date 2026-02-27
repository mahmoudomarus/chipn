import jwt
import requests
from functools import lru_cache
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from core.config import SUPABASE_JWKS_URL, SUPABASE_JWKS_KID

_bearer = HTTPBearer(auto_error=False)


@lru_cache(maxsize=1)
def _get_public_key() -> jwt.PyJWK:
    """
    Fetches the Supabase JWKS endpoint and returns the matching PyJWK key object.
    Cached after the first successful fetch — restart the server to refresh.
    """
    try:
        resp = requests.get(SUPABASE_JWKS_URL, timeout=5)
        resp.raise_for_status()
        jwks = resp.json()
    except Exception as e:
        raise RuntimeError(f"Failed to fetch JWKS from {SUPABASE_JWKS_URL}: {e}")

    keys = jwks.get("keys", [])
    if not keys:
        raise RuntimeError("JWKS response contained no keys")

    # If a specific KID is configured, find that key. Otherwise use the first.
    if SUPABASE_JWKS_KID:
        matches = [k for k in keys if k.get("kid") == SUPABASE_JWKS_KID]
        if not matches:
            raise RuntimeError(f"KID '{SUPABASE_JWKS_KID}' not found in JWKS")
        key_data = matches[0]
    else:
        key_data = keys[0]

    return jwt.PyJWK(key_data)


def _verify_token(token: str) -> str:
    """
    Verifies a Supabase-issued JWT (ES256) using the JWKS public key.
    Returns the authenticated user UUID.
    Raises ValueError on invalid or expired token.
    """
    try:
        jwk = _get_public_key()
        payload = jwt.decode(
            token,
            jwk.key,
            algorithms=["ES256"],
            options={"verify_aud": False},  # Supabase JWTs don't always set aud
        )
        sub = payload.get("sub")
        if not sub:
            raise ValueError("Token has no 'sub' claim")
        return str(sub)
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired")
    except jwt.InvalidTokenError as e:
        raise ValueError(f"Invalid token: {e}")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> str:
    """
    Validates the Bearer token using ES256 JWKS verification.
    Returns the authenticated user's UUID string.
    Raises 401 if token is missing or invalid.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required",
        )
    try:
        return _verify_token(credentials.credentials)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> str | None:
    """
    Returns the user UUID if a valid token is present, None otherwise.
    Use on public endpoints that optionally benefit from auth context.
    """
    if not credentials:
        return None
    try:
        return _verify_token(credentials.credentials)
    except ValueError:
        return None

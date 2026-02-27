import os
from dotenv import load_dotenv
from supabase import create_client, Client
from anthropic import AsyncAnthropic
import redis.asyncio as redis
from pathlib import Path

# Explicitly load backend/.env — not the frontend one
_env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=_env_path)

SUPABASE_URL         = os.environ["VITE_SUPABASE_URL"]
SUPABASE_ANON_KEY    = os.environ.get("SUPABASE_ANON_KEY", "")       # sb_publishable_*
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]        # sb_secret_*
SUPABASE_JWKS_URL    = os.environ.get("SUPABASE_JWKS_URL", f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json")
SUPABASE_JWKS_KID    = os.environ.get("SUPABASE_JWKS_KID", "")
REDIS_URL            = os.environ.get("REDIS_URL", "redis://localhost:6379")
ANTHROPIC_API_KEY    = os.environ["ANTHROPIC_API_KEY"]

# Public client (anon/publishable key) — for client-context auth flows
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY or SUPABASE_SERVICE_KEY)

# Admin client (secret key) — bypasses RLS for all server-side writes
supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

redis_client     = redis.from_url(REDIS_URL, decode_responses=True)
anthropic_client = AsyncAnthropic(api_key=ANTHROPIC_API_KEY)

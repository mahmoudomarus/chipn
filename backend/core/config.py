import os
from dotenv import load_dotenv
from supabase import create_client, Client
from anthropic import AsyncAnthropic
import redis.asyncio as redis
from pathlib import Path

# Explicitly load backend/.env — not the frontend one
_env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=_env_path)

SUPABASE_URL       = os.environ["VITE_SUPABASE_URL"]
SUPABASE_ANON_KEY  = os.environ.get("VITE_SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
SUPABASE_JWT_SECRET  = os.environ.get("SUPABASE_JWT_SECRET", "")
REDIS_URL            = os.environ.get("REDIS_URL", "redis://localhost:6379")
ANTHROPIC_API_KEY    = os.environ["ANTHROPIC_API_KEY"]

# Public client (anon key) — used only for auth flows that need it
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY or SUPABASE_SERVICE_KEY)

# Admin client (service role) — bypasses RLS for all server-side DB writes
supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

redis_client      = redis.from_url(REDIS_URL, decode_responses=True)
anthropic_client  = AsyncAnthropic(api_key=ANTHROPIC_API_KEY)

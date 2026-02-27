import os
from supabase import create_client, Client
from anthropic import AsyncAnthropic
import redis.asyncio as redis

# Environment variables
SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL", "http://localhost:54321")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", os.environ.get("VITE_SUPABASE_ANON_KEY", "dummy_key"))
REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "dummy_key")

# Initialize Supabase Admin Client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize Redis Async Client
redis_client = redis.from_url(REDIS_URL, decode_responses=True)

# Initialize Anthropic Async Client
anthropic_client = AsyncAnthropic(api_key=ANTHROPIC_API_KEY)

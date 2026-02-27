import psycopg2
import os

DB_USER = "postgres.txoynxptfgtsssgrbaag"
DB_PASS = "Chipn010010%40%40"
DB_HOST = "aws-1-us-east-2.pooler.supabase.com"
DB_PORT = "5432"
DB_NAME = "postgres"

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

def init_db():
    print(f"Connecting to {DB_HOST}...")
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cursor = conn.cursor()

    commands = [
        """
        CREATE TABLE IF NOT EXISTS public.posts (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            type VARCHAR(50) NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            ai_summary TEXT,
            status VARCHAR(50) DEFAULT 'active',
            search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || description)) STORED,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS public.investments (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
            investor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            amount NUMERIC NOT NULL,
            due_diligence_doc_url TEXT,
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        )
        """,
        """
        CREATE INDEX IF NOT EXISTS posts_search_vector_idx ON public.posts USING GIN (search_vector);
        """
    ]

    for cmd in commands:
        print("Executing:", cmd.strip().split('\n')[0])
        cursor.execute(cmd)
        
    cursor.close()
    conn.close()
    print("Database initialized successfully.")

if __name__ == "__main__":
    init_db()

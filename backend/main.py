from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import auth, posts, ai, feed, search, investments

app = FastAPI(title="Chipn Platform API", description="API for Chipn Crowdfunding and Idea Platform")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(ai.router)
app.include_router(feed.router)
app.include_router(search.router)
app.include_router(investments.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Chipn Platform API"}

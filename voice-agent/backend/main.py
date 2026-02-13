from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn
import os
from dotenv import load_dotenv

# Load from backend/.env first, then fall back to parent podcast-studio/.env
load_dotenv()
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'), override=False)

from agent_config import build_agent_config
from transcript_processor import process_transcript
from linkedin_writer import generate_linkedin_post
from perplexity_service import research_topic
from fastapi import HTTPException

app = FastAPI(title="Podcast Studio API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class TopicRequest(BaseModel):
    topic_title: Optional[str] = None
    topic: Optional[str] = None  # simple string fallback from frontend
    global_context: Optional[str] = ""
    why_this_matters: Optional[str] = ""
    key_questions: Optional[list[str]] = []
    user_name: Optional[str] = "Guest"
    userName: Optional[str] = None  # support camelCase from frontend

    def get_topic_title(self) -> str:
        return self.topic_title or self.topic or "General Discussion"

    def get_user_name(self) -> str:
        return self.userName or self.user_name or "Guest"


class TranscriptRequest(BaseModel):
    topic: Optional[str] = "General Discussion"
    userName: Optional[str] = "Guest"
    messages: list[dict] = []
    duration: Optional[int] = 0


class LinkedInRequest(BaseModel):
    topic: str
    userName: Optional[str] = "Guest"
    transcript: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/agent-config")
def agent_config(req: TopicRequest):
    config = build_agent_config(
        topic_title=req.get_topic_title(),
        global_context=req.global_context or "",
        why_this_matters=req.why_this_matters or "",
        key_questions=req.key_questions or [],
        user_name=req.get_user_name(),
    )
    return config


@app.post("/transcript")
def transcript(req: TranscriptRequest):
    result = process_transcript(
        topic=req.topic or "General Discussion",
        user_name=req.userName or "Guest",
        messages=req.messages,
        duration=req.duration or 0,
    )
    return result


@app.post("/generate-linkedin")
def generate_linkedin(req: LinkedInRequest):
    post = generate_linkedin_post(
        topic=req.topic,
        user_name=req.userName or "Guest",
        transcript=req.transcript,
    )
    return {"linkedin": post}


class ResearchRequest(BaseModel):
    keyword: str


@app.post("/api/research")
async def research_endpoint(request: ResearchRequest):
    try:
        print(f"Received research request for: {request.keyword}")
        result = research_topic(request.keyword)
        # Wrap result in "output" key to match frontend expectation
        return {"output": result}
    except Exception as e:
        print(f"Error in research endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

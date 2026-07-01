from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import json
import uuid
import logging
import asyncio
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
from fastapi import FastAPI, APIRouter, Request, HTTPException, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

from emergentintegrations.llm.chat import LlmChat, UserMessage
import scraper as scraper_mod

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rampx")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

EMERGENT_LLM_KEY = os.environ["EMERGENT_LLM_KEY"]
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
GEMINI_MODEL = "gemini-3.1-pro-preview"

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ---------------- Auth helpers ----------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["sub"]})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user.pop("password_hash", None)
        user.pop("_id", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------------- Models ----------------
class RegisterInput(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = ""


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class ResearchInput(BaseModel):
    company_name: str
    product_area: str


class WorkspaceInput(BaseModel):
    data: dict


# ---------------- LLM research ----------------
RESEARCH_SYSTEM = (
    "You are a corporate onboarding research analyst. You produce concise, factual, "
    "structured JSON to help a new employee ramp up at a company. Ground your answer in "
    "the provided real-time web sources when available; otherwise use your knowledge. "
    "Return ONLY valid JSON, no markdown, no commentary."
)


def build_research_prompt(company_name, product_area, context):
    sources_text = ""
    for s in context.get("sources", [])[:18]:
        sources_text += f"- {s['title']}: {s['snippet']} (URL: {s['url']})\n"
    site_text = context.get("site_text", "")
    website = context.get("website", "")
    return f"""Company: {company_name}
Product area: {product_area}
Official website: {website or "unknown"}

Company website text:
{site_text[:2000]}

Real-time web search results:
{sources_text or "(no live results retrieved)"}

Using the above, produce a JSON object with EXACTLY this shape:
{{
  "overview": "3-4 sentence plain-English summary of what the company does, its market and positioning",
  "website": "best-guess official homepage URL",
  "competitors": [
    {{
      "name": "Competitor name",
      "strengths": ["short strength", "short strength"],
      "weaknesses": ["short weakness", "short weakness"],
      "differentiation": "1 sentence: how {company_name} is different or better than this competitor",
      "recent_release": "1 sentence on a recent feature/product this competitor released"
    }}
  ],
  "releases": [
    {{"title": "release/news headline", "date": "approx date or 'Recent'", "summary": "1 sentence", "url": "source url or ''"}}
  ],
  "news": [
    {{"title": "shareholder/investor or company news headline", "date": "approx date or 'Recent'", "summary": "1 sentence", "url": "source url or ''"}}
  ],
  "goals_suggestions": ["a likely company goal", "another likely company goal", "a third"],
  "flashcards": [
    {{"term": "key concept/term in {product_area}", "concept": "1 sentence definition", "detail": "2-3 sentences going deeper", "resource_label": "e.g. 'YouTube: ...' or 'LinkedIn Learning: ...'", "resource_url": "a real, plausible https URL to learn more"}}
  ]
}}

Requirements:
- EXACTLY 4 competitors.
- 3 releases and 3 news items (use best available info; empty url is fine).
- 12 flashcards covering foundational {product_area} concepts for a newcomer.
- Keep every string concise. Output must be pure JSON."""


def _parse_json(text):
    text = text.strip()
    if text.startswith("```"):
        text = text.split("```", 2)[1]
        if text.startswith("json"):
            text = text[4:]
    text = text.strip().strip("`").strip()
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1:
        text = text[start : end + 1]
    return json.loads(text)


async def run_research(company_name, product_area):
    context = await asyncio.to_thread(
        scraper_mod.research_company, company_name, product_area
    )
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"research-{uuid.uuid4()}",
        system_message=RESEARCH_SYSTEM,
    ).with_model("gemini", GEMINI_MODEL)
    prompt = build_research_prompt(company_name, product_area, context)
    resp = await chat.send_message(UserMessage(text=prompt))
    data = _parse_json(resp)
    data["company_name"] = company_name
    data["product_area"] = product_area
    if not data.get("website"):
        data["website"] = context.get("website", "")
    data["generated_at"] = datetime.now(timezone.utc).isoformat()
    return data


# ---------------- Routes ----------------
@api_router.get("/")
async def root():
    return {"message": "rampX API"}


@api_router.post("/research")
async def research(input: ResearchInput):
    if not input.company_name.strip():
        raise HTTPException(status_code=400, detail="Company name required")
    try:
        data = await run_research(input.company_name.strip(), input.product_area.strip())
        return data
    except Exception as e:
        logger.error("research error: %s", e)
        raise HTTPException(status_code=500, detail="Research failed. Please try again.")


@api_router.post("/auth/register")
async def register(input: RegisterInput):
    email = input.email.lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    doc = {
        "id": user_id,
        "email": email,
        "password_hash": hash_password(input.password),
        "name": input.name or email.split("@")[0],
        "role": "user",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    token = create_access_token(user_id, email)
    return {"access_token": token, "user": {"id": user_id, "email": email, "name": doc["name"]}}


@api_router.post("/auth/login")
async def login(input: LoginInput):
    email = input.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(input.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], email)
    return {
        "access_token": token,
        "user": {"id": user["id"], "email": email, "name": user.get("name", "")},
    }


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return {"id": user["id"], "email": user["email"], "name": user.get("name", "")}


@api_router.get("/workspace")
async def get_workspace(user: dict = Depends(get_current_user)):
    ws = await db.workspaces.find_one({"user_id": user["id"]})
    if not ws:
        return {"data": None}
    return {"data": ws.get("data")}


@api_router.put("/workspace")
async def save_workspace(input: WorkspaceInput, user: dict = Depends(get_current_user)):
    await db.workspaces.update_one(
        {"user_id": user["id"]},
        {
            "$set": {
                "user_id": user["id"],
                "data": input.data,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        },
        upsert=True,
    )
    return {"ok": True}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000"), "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id")
    await db.workspaces.create_index("user_id", unique=True)
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@rampx.io")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one(
            {
                "id": str(uuid.uuid4()),
                "email": admin_email,
                "password_hash": hash_password(admin_password),
                "name": "Admin",
                "role": "admin",
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        )
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )


@app.on_event("shutdown")
async def shutdown():
    client.close()

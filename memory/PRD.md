# rampX — Product Requirements Document

## Original Problem Statement
Build "rampX", a neumorphic dashboard that helps users ramp up to a new role at a company faster. Onboarding asks who the company is and the product area, then auto-researches (real-time web scraping + AI) the company overview, competitors, latest releases, shareholder/company news, likely goals, and learning content. The user assigns the rest (board, goals, decisions). Modular clean layout, floating pill top nav, Neumorphism design, responsive. Preview dashboard anonymously, then create an account to save it.

## User Choices
- Data: Real-time web scraping (DuckDuckGo HTML) + AI synthesis
- Model: Gemini 3.1 Pro (`gemini-3.1-pro-preview`) via Emergent LLM key
- Auth: Email/password (JWT, Bearer token in localStorage)
- Layout: Responsive fixed modular layout (positions per brief)
- Content: Live-sourced (best-effort scrape grounds the LLM)

## Architecture
- **Backend** (FastAPI + MongoDB): `/api/research` (scrape + Gemini → structured JSON), `/api/auth/register|login|me`, `/api/workspace` GET/PUT. `scraper.py` = DuckDuckGo HTML search + homepage fetch (requests + BeautifulSoup).
- **Frontend** (React + Tailwind + framer-motion): AppContext manages user/workspace, localStorage persistence pre-auth + backend sync post-auth. Pages: Onboarding, Dashboard, Company, Board, Competitors, Goals, Decisions, Learning. Custom neumorphic component kit (`neu.jsx`).
- Workspace stored as a single embedded document per user.

## User Personas
- New hire ramping into a role who needs company context, key contacts, competitive landscape, goal alignment, decision logging, and domain learning.

## Core Requirements (static)
1. Onboarding wizard (company + product area) → AI+scrape research
2. Modular neumorphic dashboard (goals left, release right, board center-top, learning under board, competitors full-width bottom)
3. Board seat assignment across departments
4. Competitor cards (strengths/weaknesses/differentiation/recent release) ×4
5. Company goals; decisions coupled to goals via tags
6. Decision tree per project (160-char rationale, tags, timeline, builds-on)
7. Latest release + shareholder/news card
8. Swipeable/flippable learning flashcard deck, daily-rotating top card, resource links
9. Anonymous preview → account creation to save

## Implemented (2026-06)
- ✅ All 9 core requirements above, verified end-to-end (testing agent 100% backend + frontend)
- ✅ Floating pill top nav, neumorphic UI on #ECF0F3, responsive grid
- ✅ Real-time research via Gemini 3.1 Pro + DuckDuckGo scraping (~35s)
- ✅ JWT auth + workspace persistence (localStorage + MongoDB)

## Backlog / Next
- P1: Surface save errors as toast (currently silently swallowed)
- P1: Board member edit (currently add/remove only)
- P2: Distinguish scraper vs LLM errors in `/api/research` for observability
- P2: Re-run/refresh research on demand; cache sources
- P2: Decision tree branching visualization (currently chronological timeline with builds-on links)
- P2: Google OAuth option

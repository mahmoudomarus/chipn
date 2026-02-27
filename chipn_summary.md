# Chipn - Platform Handoff Summary

## 1. Core Concept
**Chipn** is a modern, fast-paced crowdfunding and idea-sharing platform designed with a TikTok-style infinite scrolling vertical feed. It allows founders, engineers, and creatives to quickly pitch ideas or showcase products, while investors and supporters can seamlessly discover, validate, and fund them.

### Key Workflows:
- **Founders/Creators**: Submit an "Idea", "Product", or "Request" (e.g., "I need an engineer to build this").
- **AI Processing**: Every submission is automatically intercepted by an Anthropic AI model that generates a bite-sized, investor-friendly summary before saving to the database.
- **Investors/Supporters**: Scroll through the feed. If they see something they like, they can hit "BOOST", or commit to "INVEST / BUILD IT" by specifying a dollar amount.
- **Due Diligence**: Investments over $10,000 trigger a strict due diligence workflow requiring document uploads.

## 2. Technology Stack
- **Frontend**: React (Vite ecosystem).
- **Backend / API**: Python (FastAPI), utilizing `Pydantic` for strict data validation models.
- **Database & Auth**: Supabase (PostgreSQL). Stores users, posts, and investment ledgers. Handles JWT session management and Identity Document storage via Supabase Storage buckets.
- **AI Engine**: Anthropic SDK (Claude) natively injected into the FastAPI post submission routes.
- **Caching / Event Coordinator**: Redis (Upstash) connected via the backend for rapid feed serving/shuffling.

## 3. Current Implementation Status
The platform is currently functionally complete from backend to frontend (End-to-End verified):
- **User Authentication**: Login and Signup routes are fully wired through the Supabase SDK. *Requirement: Signup strictly requires the user to upload an ID document to the `documents` Supabase storage bucket for KYC purposes.*
- **Live Feed System**: The React frontend successfully pulls from the `posts` index in PostgreSQL.
- **Live Submissions**: The `Submit.jsx` component connects to the FastAPI backend, hits the Anthropic AI for summarization, and saves to the Supabase database.
- **Live Investments**: The Feed's "Invest/Support" modal posts directly to the `investments` PostgreSQL table, tying the action to the authenticated user's ID.

## 4. Current UI / UX State
The current UI was built using a strict **"Swiss Style" Design System**.
- **Rules applied**: Maximum of 2 colors (Black & White). High contrast, bold typography, extreme padding, and thick border boxes (`border: 4px solid black`).
- **State**: The UI is purely functional (no placeholders) but completely rudimentary.

## 5. Next Steps / Directives for the New Agent
The foundational data layer, API layer, and authentication rules are completely stable and working. 

**Your goals as the incoming agent are to:**
1. **Elevate the UI/UX**: Break out of the rudimentary Swiss style if necessary. Apply modern, stunning, and responsive CSS/Tailwind (vibrant colors, glassmorphism, smooth animations) so the platform looks like a premium, state-of-the-art fintech/social app. Make the TikTok-style vertical feed feel native and fluid.
2. **Expand Features**: 
   - Add a robust Profile dashboard displaying user investment history and active pitches.
   - Flesh out the "Smart Search" AI deep-search vectors.
   - Implement the actual Due Diligence document upload flow for large investments.
3. **Respect Existing Integrations**: Do not break the existing Supabase (`supabase.js` and Postgres schema), Anthropic, or Redis connections. The backend `models.py` and endpoints are currently perfectly synced with the frontend fetches.

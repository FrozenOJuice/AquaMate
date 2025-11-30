# AquaMate Backend

FastAPI + SQLAlchemy + Postgres backend with cookie-based sessions and Alembic migrations.

## Setup
1) Python deps (inside your venv):  
   `pip install -r ../requirements.txt`
2) Environment: copy `.env.example` to `.env` and adjust values (especially `SESSION_SECRET`, DB creds).
3) Database: `docker compose up -d postgres adminer` (or use your own Postgres).
4) Migrations:  
   - Local: `alembic -c ../alembic.ini upgrade head`  
   - Docker: `docker compose exec backend alembic -c alembic.ini upgrade head`
5) Run the API:  
   - Local: `uvicorn backend.app.main:app --reload`  
   - Docker: `docker compose up -d backend`

## Key Endpoints
- `GET /health` — health check.
- `POST /auth/register` — create account (defaults to role `Applicant`, status `active`).
- `POST /auth/login` — login with username or email + password; sets `session` HTTP-only cookie.
- `POST /auth/logout` — clears the session cookie.
- `GET /auth/me` — returns current user (requires valid `session` cookie).

## Sessions
- Stateless signed cookies (`session`) using `itsdangerous`; token contains user UUID, signed with `SESSION_SECRET`, expires after `SESSION_MAX_AGE`.
- `get_current_user` dependency reads the cookie, verifies the token, loads the user, and checks `status == active`.

## Models / Schema
- `User`: UUID `id`, `username`, `email`, `hashed_password`, `role`, `status`, `created_at`.
- Roles: Applicant, Volunteer, Attendant, Lifeguard, Head Lifeguard, Aquatic Supervisor, Admin (enum in DB).
- Status: active, disabled.

## Running Tests
- `pytest` (tests override the DB with in-memory SQLite).

## Migrations (Alembic)
- Config: `alembic.ini`, env at `backend/migrations/env.py`.
- Initial migration: `backend/migrations/versions/0001_initial.py` (creates users table and enums).
- Typical commands:
  - `alembic -c ../alembic.ini revision --autogenerate -m "desc"`
  - `alembic -c ../alembic.ini upgrade head`
  - `alembic -c ../alembic.ini downgrade -1`

## Adminer (DB UI)
- `docker compose up -d adminer`
- Visit `http://localhost:8080` and connect to server `postgres` with your DB creds.

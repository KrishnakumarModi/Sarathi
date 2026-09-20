# AI Career OS

AI Career OS is a career operating system for AI/ML roles. The active runtime is a split stack:

- `frontend/`: React 19 + Vite single-page application
- `backend/`: FastAPI + PostgreSQL + Redis API
- `supabase/`: retained SQL assets from the original deployment, not required by the active Docker stack

The project no longer uses Next.js.

## Run with Docker

```bash
docker compose up --build
docker compose run --rm backend alembic upgrade head
docker compose run --rm backend python -m scripts.seed
```

Open `http://localhost:8080`.

## Run without Docker

Start PostgreSQL and Redis, then install the backend dependencies:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
python -m scripts.seed
uvicorn app.main:app --reload --port 8000
```

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Root commands

The root package only delegates to the active applications:

```bash
npm run dev          # Vite frontend
npm run build        # Vite production build
npm run type-check   # frontend TypeScript check
npm run test         # frontend unit tests
npm run backend      # FastAPI development server
npm run backend:test # backend tests
```

See [frontend/README.md](frontend/README.md) and [backend/README.md](backend/README.md) for detailed setup and deployment instructions.

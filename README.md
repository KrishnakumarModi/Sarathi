# Sarathi

A career prep app. Track DSA, CS topics, roles and progress in one place.

## Tech stack

**Frontend**
- React 19 + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- lucide-react for icons
- TanStack Query for data fetching

**Backend**
- FastAPI
- Pydantic for validation
- Uvicorn as the server
- PostgreSQL for the database
- Redis for caching
- Docker for running everything

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the built app |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run Playwright tests (needs frontend and backend running) |
| `npm run type-check` | TypeScript check only |

## How it works

**Business logic is on the backend.** Priority, capacity, mastery, readiness and JD matching are all calculated by the API. The frontend only does display calculations, like progress bars and the DSA solved/unsolved filter.

**Auth.** The access token is kept in memory and the refresh token in `localStorage`. On a 401, the API client refreshes once and retries the request. Concurrent requests share a single refresh. The backend rotates and revokes refresh tokens.

**Live updates.** Data is refetched every 30 seconds while the tab is visible, on window focus, and after every change. A change made in another tab can take up to 30 seconds to show. Redis keeps these reads fast.

## Known issues

- Domain icon colours from `domains.json` (like `text-violet-500`) don't render, because Tailwind never sees those class names. Fix: safelist them in the Tailwind config.
- `CardTitle` renders a `<div>` instead of a heading. Changing it to `<h3>` would improve accessibility but changes the markup.
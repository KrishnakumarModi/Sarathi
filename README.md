# Sarathi Frontend

Sarathi is a learning and career-planning companion for building skills,
evidence, and momentum toward the next role. This directory contains the
React single-page application. It communicates with the FastAPI backend over
HTTP and is designed to run alongside the backend in the repository's active
split-stack setup.

## What is included

The authenticated application provides:

- onboarding and a personalized dashboard
- daily planning, roadmap, curriculum, and spaced revision workflows
- skill tracking, computer science, DSA, and aptitude practice
- projects, job applications, interviews, roles, and readiness signals
- analytics, settings, theme switching, and responsive navigation

Unauthenticated visitors can view the landing page, log in, or create an
account. Protected pages redirect to login, and users who have not completed
onboarding are redirected to `/onboarding`.

## Tech stack

- React 19 and TypeScript
- Vite 6 with route-level code splitting
- React Router for navigation and route guards
- TanStack Query for server state and cache invalidation
- Tailwind CSS and Radix UI primitives
- Recharts for dashboard and analytics visualizations
- Vitest for unit tests and Playwright for end-to-end tests

## Prerequisites

- Node.js 20 or newer
- npm
- The FastAPI backend running on port `8000` for data-backed workflows

The backend setup and database requirements are documented in
`../backend/README.md` when working from the full repository.

## Local development

Install dependencies and start the Vite development server:

```bash
npm install
npm run dev
```

Open <http://localhost:5173>. By default, requests beginning with `/api` are
proxied to `http://localhost:8000`, keeping the browser same-origin during
development.

### Environment variables

No environment file is required for the default local setup. To use a
different backend, create a local `.env` file:

```dotenv
VITE_PROXY_TARGET=http://localhost:8000
VITE_API_BASE_URL=/api/v1
```

`VITE_PROXY_TARGET` controls Vite's development proxy. `VITE_API_BASE_URL`
controls the URL used by the browser API client and defaults to `/api/v1`.
Do not commit local `.env` files.

## Commands

```bash
npm run dev          # Start the development server
npm run build        # Type-check and create the production bundle in dist/
npm run preview      # Serve the production bundle locally
npm run type-check   # Run the TypeScript compiler without emitting files
npm run lint         # Lint TypeScript and TSX source files
npm run test         # Run unit tests once
npm run test:watch   # Run unit tests in watch mode
npm run test:e2e     # Run Playwright tests
```

End-to-end tests require both the backend and frontend to be running. They
exercise real authentication and onboarding flows, so use a test backend or
an isolated development database.

## Project structure

```text
src/
  components/   Shared layout components and UI primitives
  features/     Feature-specific pages, API functions, and calculations
  hooks/        Reusable React hooks
  lib/          API client, constants, query client, and token storage
  routes/       Route pages and authentication/onboarding layouts
  stores/       Small client-side stores
  types/        Shared TypeScript and API types
tests/
  unit/         Vitest tests for client-side logic
  e2e/          Playwright browser tests
public/         Static assets such as the Sarathi logo
```

## API and session behavior

The API client sends requests to `/api/v1` by default, includes the access
token when available, and sends cookies with requests. When an authenticated
request receives a `401`, it attempts one refresh using the stored refresh
token before clearing the session and returning the user to login.

Access tokens are kept in memory. The refresh token is stored in
`localStorage`, and the backend remains responsible for token rotation,
revocation, authorization, and business rules.

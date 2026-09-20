# Sarathi

> A focused career companion for planning, practising, and tracking progress toward AI/ML roles.

Sarathi brings a learner's roadmap, daily plan, revision schedule, skills, projects,
and job-search activity into one calm, structured workspace. The frontend is a React
single-page application powered by a FastAPI backend.

## Highlights

- **Personal roadmap** — organise curriculum topics, skills, DSA, CS fundamentals,
  aptitude, and interview preparation.
- **Daily momentum** — plan focused work, track completion, and maintain a revision
  rhythm.
- **Career readiness** — record projects, explore target roles, analyse job
  applications, and prepare for interviews.
- **Progress at a glance** — use dashboards, analytics, mastery signals, and XP to
  understand where to focus next.

## Tech stack

| Area | Tools |
| --- | --- |
| UI | React 19, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui, Radix UI |
| Data | TanStack Query |
| Routing | React Router |
| Charts | Recharts |
| API | FastAPI over `/api` |

## Quick start

### Prerequisites

- Node.js 20 or newer
- npm
- A running Sarathi backend (defaults to `http://localhost:8000`)

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

The development server proxies `/api` requests to `http://localhost:8000`. To point
at another backend, start Vite with `VITE_PROXY_TARGET` set to its URL:

```bash
VITE_PROXY_TARGET=http://localhost:8000 npm run dev
```

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Type-check and create a production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Lint TypeScript and React source files. |
| `npm run type-check` | Run TypeScript without emitting files. |
| `npm run test` | Run the Vitest unit test suite. |
| `npm run test:e2e` | Run Playwright end-to-end tests. |

## Project structure

```text
src/
├── components/     # Shared UI, layout, and provider components
├── features/       # Feature-focused views and client-side helpers
├── hooks/          # Reusable React hooks
├── lib/            # API client, session utilities, and constants
├── routes/         # Route-level pages and guards
└── types/          # Shared TypeScript types
```

## Authentication

Sarathi keeps short-lived access tokens in memory. Refresh tokens are handled by
secure, HttpOnly cookies, so they are never exposed to browser JavaScript. When an
access token expires, the API client refreshes the session once and retries the
original request.

## Contributing

1. Create a branch from the branch you intend to change.
2. Make focused changes and run `npm run type-check` and `npm run test`.
3. Open a pull request with a concise description of the change.

## Contributors

- [Aryan Prajapati](https://github.com/aryan-prajapati004) — `aryan-prajapati004`
- [Krishan Kumar](https://github.com/06K07) — `06K07`
- [Krishna Kumar Modi](https://github.com/KrishnakumarModi) — `KrishnakumarModi`

---

Built for deliberate, measurable career growth.

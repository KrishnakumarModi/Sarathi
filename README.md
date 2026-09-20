#SARATHI

React 19 + Vite + TypeScript + Tailwind + shadcn/ui, talking to the FastAPI
backend over HTTP.

**The design did not change.** `src/components/ui/` is byte-identical to the
Next.js build, `src/index.css` is the same `globals.css`, and
`tailwind.config.ts` carries the same tokens — violet `262 83% 58%`, teal
accent, `0.875rem` radius, the five chart colours, the `app-shell` grid, the
`hero-glow`, `surface-card`, and `page-enter` treatments. Every page renders
the same JSX it did before; what changed is where the data comes from.

---

## Running it

```bash
npm install
cp .env.example .env     # the default proxies /api to localhost:8000
npm run dev              # http://localhost:5173
```

The backend must be running (see `../backend/README.md`). Vite proxies
`/api` to it in development, so the browser stays same-origin and cookies
behave exactly as they will in production.

```bash
npm run build         # type-check, then bundle to dist/
npm run preview       # serve the bundle
npm run test          # unit tests
npm run test:e2e      # Playwright, against a running backend + frontend
npm run type-check
```

---

## How the Next.js pieces were replaced

| Next.js | Here |
|---|---|
| Server Component fetching in the page | TanStack Query calling the API |
| Server Action | `features/*/api.ts` — same function names, same arguments, same `ActionResult` return |
| `revalidatePath` | `refreshData()` invalidates the query cache after a mutation |
| `loading.tsx` | `<QueryBoundary skeleton={...}>` renders the same skeletons |
| `error.tsx` | `<QueryBoundary>` for data, `<RootErrorBoundary>` for render errors |
| `middleware.ts` auth gate | `<DashboardLayout>` and `<RequireOnboarding>` route guards |
| `next/link` | `react-router-dom` `<Link to>` |
| `next/navigation` | `hooks/use-navigation.ts` — `usePathname`, `useRouter`, `useSearchParams` with the same shapes |
| `next/image` | `<img>` |
| `next/font` | Inter from Google Fonts, preconnected in `index.html` |
| `metadata` export | `useDocumentTitle()`, same `Page · AI Career OS` template |
| `dynamic()` for Recharts | `React.lazy` + `Suspense`, same intent |
| Supabase Realtime | `<RealtimeSync>` — see below |

Keeping the Server Action names and signatures is why the feature components
barely changed: `updateTaskStatus`, `recordReview`, `completeOnboarding` and
the rest still return `{ success: true, data }` or `{ error, fieldErrors }`,
so every `if ('error' in result)` branch and every inline field message
still works.

### Realtime became polling

The Supabase build held a WebSocket per page and called `router.refresh()`
on change. There is no equivalent in a REST backend, so `<RealtimeSync>`
keeps the same promise — what you see reflects what is stored — by
refetching every 30 seconds while the tab is visible, on window focus, and
after every mutation. The reads are cheap because the backend serves these
view models from Redis.

This is the one behavioural difference a user could notice: a change made in
another tab appears within about 30 seconds rather than instantly. If
instant matters later, the backend can grow an SSE endpoint and
`<RealtimeSync>` can subscribe to it without touching any page.

### Where the business rules went

They live in the backend now. The frontend keeps only the presentation-side
calculations it actually renders with — CS topic completeness for the
progress bars, DSA solved/unsolved for the problem filter — plus the copy
and weights the UI labels things with. Everything scored (priority,
capacity, mastery, readiness, JD matching) is computed server-side and
arrives already explained, which is what stops the two runtimes drifting
apart.

Files such as `features/roles/lib/readiness-calculator.ts` are therefore now
type and copy contracts rather than implementations, and each says so.

---

## Session handling

`lib/token-store.ts` keeps the access token in memory and only the refresh
token in `localStorage`. `lib/api-client.ts` attaches the access token,
and on a 401 refreshes once and retries — with a single in-flight refresh
shared across concurrent requests, so a page that fires eight queries does
not trigger eight refreshes. The backend rotates and revokes refresh tokens,
which is what limits the blast radius of the stored copy.

---

## Inherited issues

Two things were already true of the Next.js build and were deliberately
left alone rather than silently changed:

- **`domains.json` colour classes never render.** The seed data names
  Tailwind classes like `text-violet-500`, but those strings appear only in
  data, so Tailwind's scanner never generates them. Domain icons inherit
  the surrounding colour. Fixing it means safelisting those classes — a
  visible change, so it is your call.
- **`CardTitle` renders a `<div>`, not a heading.** Three e2e assertions
  were written expecting `getByRole('heading')` and were adjusted to match
  the real DOM. Making it an `<h3>` would improve the document outline at
  the cost of changing rendered markup.

One change was necessary rather than optional: `DomainIcon` now maps icon
names explicitly instead of doing `import * as Icons from 'lucide-react'`.
Next rewrites those namespace imports per icon; a plain bundler cannot, and
the whole ~770 kB library landed in the initial chunk. Rendering is
identical, including the `BookOpen` fallback.

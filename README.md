# AU/NZ Weather Dashboard

A Next.js weather dashboard for monitoring conditions across Australia and New Zealand. It provides a Summary view with KPI cards and alerts, and a Charts view with interactive visualizations — all driven by shareable URL filters.

## Features

- Summary and Charts views with URL-based state (`view`, `city`, `gran`, `vars`, `start`, `end`)
- Open-Meteo API integration with AU/NZ coordinate validation and retry logic
- DaisyUI + Tailwind CSS with light, dark, and cupcake themes
- Recharts visualizations for temperature, rainfall, and wind
- Skeleton loading states and accessible error handling
- Jest unit tests, Playwright E2E tests, and Lighthouse audit script

## Tech stack

- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4 + DaisyUI
- Recharts + Zod

## Getting started

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard).

### Useful scripts

```bash
pnpm dev            # Start development server
pnpm build          # Production build
pnpm test           # Unit and component tests
pnpm test:coverage  # Tests with coverage thresholds
pnpm test:e2e       # Playwright E2E tests
pnpm lighthouse     # Lighthouse audit (requires running server)
pnpm lint:strict    # ESLint with zero warnings
pnpm typecheck      # TypeScript check
```

## URL examples

```
/dashboard
/dashboard?view=charts&city=auckland,sydney
/dashboard?view=summary&gran=daily&city=wellington
/dashboard?view=charts&vars=temperature_2m,precipitation&start=2026-06-08&end=2026-06-15
```

## Project structure

```
src/
  app/
    dashboard/       # Main dashboard page
    api/weather/     # Open-Meteo proxy route
  components/        # UI components (filters, KPIs, charts, theme)
  lib/               # Utilities, schemas, API helpers
  hooks/             # Client-side URL state hook
e2e/                 # Playwright tests
tasks/               # PRD and implementation task list
```

## Environment variables

| Variable                  | Description                               |
| ------------------------- | ----------------------------------------- |
| `NEXT_PUBLIC_BASE_URL`    | Public site URL for metadata and sitemaps |
| `NEXT_PUBLIC_SHOW_LOGGER` | Enable debug logging (`true` / `false`)   |

## License

Private project.

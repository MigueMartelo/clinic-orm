# Clinic ORM

Web application for an aesthetic medicine clinic: production tracking, patients, payments, multi-session services, inventory, and reports.

## Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, RLS, Storage)
- **Deploy:** Vercel + Supabase

## Prerequisites

- Node.js 20+
- [Supabase CLI](https://supabase.com/docs/guides/cli) (optional, for local DB)

## Setup

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Copy environment variables and fill in your Supabase project keys:

```bash
cp .env.example .env.local
```

Get keys from [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API.

3. Link the Supabase project (first time only):

```bash
supabase link --project-ref <your-project-ref>
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `supabase start` | Start local Supabase stack |
| `supabase stop` | Stop local Supabase stack |
| `supabase status` | Show local Supabase URLs and keys |
| `supabase db reset` | Apply migrations and seed locally |
| `supabase migration new <name>` | Create a new SQL migration |

## Engineering guardrails

- Money stored as **integer COP** (`bigint`), never floats
- Dates as **`timestamptz`**
- Auth + **Row Level Security** from day one
- SQL migrations versioned under `supabase/migrations/`
- Unified **services** model: catalog → instances → sessions (no laser-specific tables)

## Project structure

```
src/
  app/           # Next.js App Router pages
  components/    # UI components (shadcn/ui)
  lib/supabase/  # Supabase client helpers (browser, server, middleware)
supabase/
  migrations/    # Versioned PostgreSQL schema
  seed.sql       # Seed data
```

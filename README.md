# CubeForge Platform

Monorepo for the CubeForge platform — a game creation and discovery ecosystem built on the [CubeForge engine](https://github.com/1homsi/cubeforge).

## Apps

| App | URL | Description |
|-----|-----|-------------|
| `apps/landing` | [cubeforge.dev](https://cubeforge.dev) | Marketing landing page |
| `apps/play` | [play.cubeforge.dev](https://play.cubeforge.dev) | Browse and play community games |
| `apps/editor` | [editor.cubeforge.dev](https://editor.cubeforge.dev) | In-browser code editor & playground |
| `apps/account` | [account.cubeforge.dev](https://account.cubeforge.dev) | Auth, profile, and game management |

## Packages

| Package | Description |
|---------|-------------|
| `packages/auth` | Shared Supabase client with cross-subdomain cookie auth |

## Stack

- **React 19** with React Compiler across all apps
- **Vite 6** (Vite apps) / **Next.js 16** (landing)
- **Tailwind CSS v4**
- **Supabase** — Postgres DB, Auth (OAuth + email), Storage, RLS
- **Turborepo** — incremental builds, task caching
- **pnpm workspaces**
- **Cloudflare Pages** — hosting for all apps

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy env files and fill in Supabase credentials
cp .env.example apps/play/.env.local
cp .env.example apps/account/.env.local
cp .env.example apps/editor/.env.local
cp .env.example apps/landing/.env.local

# Run all apps in dev mode
pnpm dev

# Or run a specific app
pnpm --filter @cubeforgelabs/play dev
```

## Environment Variables

Each app needs a `.env.local` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The anon key is safe to expose — Row Level Security enforces all access rules server-side.

## Auth

Auth is shared across all subdomains via a cookie with `domain=.cubeforge.dev`. Signing in on `account.cubeforge.dev` automatically authenticates the user on `play.cubeforge.dev` and `editor.cubeforge.dev` without a second login.

## Database Schema

| Table | Description |
|-------|-------------|
| `profiles` | Public user profiles (auto-created on signup) |
| `games` | Published games with metadata |
| `game_tags` | Many-to-many game ↔ tag relations |
| `tags` | Searchable tags/categories |
| `reviews` | Star ratings + text reviews per game |
| `favorites` | User ↔ game bookmarks |
| `projects` | Editor project saves (private to owner) |

## Deployment

Each app is deployed to Cloudflare Pages independently from the same repo. Build configs:

| App | Root dir | Build command | Output |
|-----|----------|---------------|--------|
| landing | `apps/landing` | `pnpm build` | `out` |
| play | `apps/play` | `pnpm build` | `dist` |
| editor | `apps/editor` | `pnpm build` | `dist` |
| account | `apps/account` | `pnpm build` | `dist` |

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in each Cloudflare Pages project.

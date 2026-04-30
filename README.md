# TradeHub — egytradehub

A B2B wholesale marketplace following the Alibaba design philosophy.
Built with **Next.js 16 (App Router)**, **Tailwind CSS v4**, **Lucide React**,
**Framer Motion**, and **Supabase** (PostgreSQL, Auth, Storage).

## Tech stack

| Layer        | Tool                                  |
| ------------ | ------------------------------------- |
| Framework    | Next.js 16 (App Router, TypeScript)   |
| Styling      | Tailwind CSS v4 + custom brand tokens |
| Icons        | `lucide-react`                        |
| Animations   | `framer-motion`                       |
| Backend/Auth | `@supabase/supabase-js` + `@supabase/ssr` |
| Hosting      | Vercel                                |

Brand color: `#FF6A00` (orange) on a clean white surface.
Display font: `Outfit`. Body font: `DM Sans`.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Copy `env.second.txt` → `.env.local` and fill the values from your Supabase
project (Project Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Database

Run the SQL in `supabase/schema.sql` against your Supabase project (SQL editor).
It creates four tables — `profiles`, `products`, `rfqs`, `orders` — plus the
required enums, indexes, and Row Level Security policies.

## Project layout

```
src/
├── app/
│   ├── layout.tsx       # Root layout with DM Sans + Outfit fonts
│   ├── page.tsx         # Landing page composition
│   └── globals.css      # Tailwind + brand tokens
├── components/
│   └── landing/         # Mobile-first landing page sections
└── lib/
    └── supabase/        # client.ts (browser), server.ts (RSC), types.ts
```

## Roadmap

- [x] Landing page (mobile-first, scaled up on desktop)
- [x] Flash deal countdown timer
- [x] Category grid, Trending products, Verified supplier scroll
- [x] RFQ form (mock submit)
- [ ] Supabase Auth (Buyer / Supplier / Admin roles)
- [ ] Product detail page with MOQ + price-tier logic
- [ ] Order tracking timeline
- [ ] Admin CPanel (Dashboard, Inventory, Verification)

## Deploy

The fastest path is Vercel: import the GitHub repo, add the three Supabase
env vars, and deploy.

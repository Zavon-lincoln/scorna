# Scorna

A single, unified **React + Vite + Supabase** app for **Scorna**, an AI
marketing & systems agency. Three zones share one brand, one backend, and one
seamless navigation model:

- **Public website** (`/`) — marketing site + free-audit capture. Anonymous
  visitors submit a request that lands in the dashboard.
- **Client dashboard** (`/dashboard`) — authenticated portal for leads,
  schedule, team, content, marketing, and notifications. Admins get a God-mode
  view across all clients.
- **Blueprint generator** (`/blueprint`) — internal, admin-only tool for
  building audit blueprints (live cost calculator + PDF export).

Design system: **Glassmorphic** — layered frosted surfaces, deep blur, and
ambient ember light on a deep void. No grid background.

---

## Stack

- React 18 + Vite
- React Router v6 (zone routing + guards)
- Supabase (auth, Postgres, RLS)
- Lucide React (icons)
- jsPDF + html2canvas (blueprint PDF export, lazy-loaded)
- Plain CSS (no frameworks)
- Deploys cleanly to Vercel

---

## Zones & Routing

| Route          | Zone       | Access                         |
| -------------- | ---------- | ------------------------------ |
| `/`            | Public     | Always open                    |
| `/login`       | Auth gate  | Open (redirects in if signed in) |
| `/dashboard/*` | Client     | Requires session (client/admin) |
| `/blueprint/*` | Internal   | Admin only                     |
| `/components`  | Internal   | Admin only (unlinked)          |

`ProtectedRoute` / `AdminRoute` guards live in
`src/components/routing/RouteGuards.jsx`. Admins see a persistent **ZoneNav**
for instant switching between Dashboard and Blueprint. Blueprint drafts persist
to `localStorage` only — they are never written to the database.

---

## Setup

1. **Clone the repo**

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

   > The service role key powers the Admin views. See the security note below —
   > move admin operations to an Edge Function before production.

4. **Create the database**

   Open the Supabase SQL editor and run [`supabase/schema.sql`](supabase/schema.sql).
   This creates all tables, indexes, triggers, RLS policies, and helper
   functions.

5. **Run the dev server**

   ```bash
   npm run dev
   ```

   Visit http://localhost:5173.

---

## First Admin User

Accounts are created by admins, so you need to bootstrap the first one manually:

1. In the Supabase dashboard, go to **Authentication → Users → Add user**.
   Create a user with your email and a password (enable "Auto Confirm User").

2. Copy that user's UUID, then run in the SQL editor:

   ```sql
   insert into users (id, role, full_name, email)
   values ('PASTE-AUTH-USER-ID', 'admin', 'Your Name', 'your@email.com');
   ```

3. Sign in at the dashboard. You'll have the Admin tab and can create clients
   and additional users from there.

---

## Creating Clients & Users (as Admin)

- **Admin → Clients**: create a client business record.
- **Admin → Users**: create a login for that client. A temporary password is
  generated and shown once (copy it and share securely). The user changes it on
  first login.

Once a client user logs in, they only see their own data (enforced by RLS).

---

## Deployment (Vercel)

1. Push the repo to GitHub and import it into Vercel.
2. Framework preset: **Vite**. Build command `npm run build`, output `dist`.
3. Add the three `VITE_SUPABASE_*` environment variables in the Vercel
   dashboard (Project → Settings → Environment Variables).
4. Deploy.

---

## Security Note — Admin Operations

The Admin user create/delete flows use the Supabase **service role key**, which
is currently bundled into the client (`src/lib/supabase.js`) so the God-mode
views work out of the box. **This exposes the key to the browser.**

Before going to production, move these privileged operations server-side:

- A starter Edge Function lives at
  [`supabase/functions/admin-users/index.ts`](supabase/functions/admin-users/index.ts).
- Deploy it, remove `VITE_SUPABASE_SERVICE_ROLE_KEY` from the client build, and
  change `AdminUsers.jsx` / admin reads to call the function via
  `supabase.functions.invoke('admin-users', …)`.

The Edge Function verifies the caller is an admin before performing any action.

---

## Project Structure

```
src/
├── lib/            supabase client + utilities
├── hooks/          data hooks (auth, leads, appointments, …)
├── context/        AuthContext (wraps useAuth for router-mounted routes)
├── components/
│   ├── layout/     AppShell, ZoneNav, Sidebar, Topbar
│   ├── routing/    RouteGuards (ProtectedRoute, AdminRoute)
│   ├── ui/         Modal, FormField, Toast, states, ConfirmDialog, FullPageLoader
│   └── shared/     Avatar
├── zones/
│   ├── public/     PublicLayout, Home, ContactForm, Components
│   ├── dashboard/  DashboardLayout + pageRoutes (wrap the pages below)
│   └── blueprint/  BlueprintLayout + builder/ + document/ + lib/
├── pages/          Login, Overview, Leads, Schedule, Team, Content,
│                   Marketing, Notifications, admin/*
├── styles/         tokens, globals, typography, glass, buttons, forms, pills,
│                   zones, public, blueprint, pages, dashboard
├── App.jsx         router + zone wiring
└── main.jsx        providers (Router, Auth, Toast) + style imports
supabase/
├── schema.sql      full database schema + RLS (incl. public `bookings` table)
└── functions/admin-users/index.ts   (Edge Function placeholder)
```

---

## Notes

- Routing is React Router v6; zones fade between each other with no full reload.
- The public free-audit form inserts into the `bookings` table (anonymous
  insert allowed by RLS; admin-only read). Triage inbound prospects from there.
- Blueprint drafts live in React state + `localStorage`; PDF export captures the
  rendered document at 2x via html2canvas + jsPDF.
- Every list/table/board has loading, empty, and error states.
- All deletes require confirmation; all mutations show toasts.
- The calendar (month/week/day, drag-to-reschedule) is built from scratch.

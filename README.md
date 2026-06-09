# Scorna Client Dashboard

A production client dashboard for **Scorna**, an AI marketing & systems agency.
Built with React 18 + Vite + Supabase. Two roles:

- **Clients** — local service business owners managing leads, schedule, team,
  content, marketing, and notifications.
- **Admins** — Scorna staff with a God-mode view across all clients.

Design system: **Smoke & Glass** — dark luxury neubrutalism.

---

## Stack

- React 18 + Vite
- Supabase (auth, Postgres, RLS)
- Lucide React (icons)
- Plain CSS (no frameworks)
- Deploys cleanly to Vercel

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
├── components/
│   ├── layout/     Sidebar, Topbar
│   ├── ui/         Modal, FormField, Toast, states, ConfirmDialog
│   └── shared/     Avatar
├── pages/          Login, Overview, Leads, Schedule, Team, Content,
│                   Marketing, Notifications, admin/*
├── styles/         design-tokens, globals, pages
├── App.jsx         auth gate + navigation shell
└── main.jsx
supabase/
├── schema.sql      full database schema + RLS
└── functions/admin-users/index.ts   (Edge Function placeholder)
```

---

## Notes

- Navigation is state-based (no React Router) per the brief.
- Every list/table/board has loading, empty, and error states.
- All deletes require confirmation; all mutations show toasts.
- The calendar (month/week/day, drag-to-reschedule) is built from scratch.

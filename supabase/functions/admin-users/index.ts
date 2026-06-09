// ============================================================
// Supabase Edge Function: admin-users  (PLACEHOLDER)
//
// PURPOSE
// Move privileged user-management operations OFF the browser. The dashboard
// currently calls supabase.auth.admin.createUser / deleteUser directly from
// the client using the service role key (see src/lib/supabase.js), which
// exposes that key to anyone who loads the app. Before production, route those
// operations through this server-side function so the service role key stays
// secret.
//
// DEPLOY
//   supabase functions deploy admin-users --no-verify-jwt=false
// Set secrets:
//   supabase secrets set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=...
//
// Then change AdminUsers.jsx to call:
//   await supabase.functions.invoke('admin-users', { body: { action, ... } })
// instead of supabaseAdmin.auth.admin.*
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Generate a random temporary password (server-side).
function generatePassword(length = 12): string {
  const chars =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%'
  const bytes = new Uint32Array(length)
  crypto.getRandomValues(bytes)
  let out = ''
  for (let i = 0; i < length; i++) out += chars[bytes[i] % chars.length]
  return out
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // ── Authorize: caller must be an admin. ────────────────────
    const authHeader = req.headers.get('Authorization') ?? ''
    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: userErr } = await admin.auth.getUser(token)
    if (userErr || !userData?.user) {
      return json({ error: 'Unauthorized' }, 401)
    }
    const { data: profile } = await admin
      .from('users')
      .select('role')
      .eq('id', userData.user.id)
      .single()
    if (profile?.role !== 'admin') {
      return json({ error: 'Forbidden — admin only' }, 403)
    }

    // ── Dispatch. ──────────────────────────────────────────────
    const body = await req.json()
    const { action } = body

    if (action === 'create') {
      const { email, full_name, role, client_id } = body
      const password = generatePassword(12)
      const { data: created, error: createErr } =
        await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        })
      if (createErr) throw createErr

      const { error: insErr } = await admin.from('users').insert({
        id: created.user.id,
        email,
        full_name,
        role,
        client_id: role === 'admin' ? null : client_id ?? null,
      })
      if (insErr) throw insErr

      return json({ id: created.user.id, password })
    }

    if (action === 'delete') {
      const { id } = body
      const { error: delAuthErr } = await admin.auth.admin.deleteUser(id)
      if (delAuthErr && !/not found/i.test(delAuthErr.message)) throw delAuthErr
      const { error: delRowErr } = await admin.from('users').delete().eq('id', id)
      if (delRowErr) throw delRowErr
      return json({ ok: true })
    }

    return json({ error: 'Unknown action' }, 400)
  } catch (err) {
    return json({ error: (err as Error).message }, 500)
  }
})

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

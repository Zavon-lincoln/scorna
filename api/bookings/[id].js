import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' })

  if (req.headers.authorization !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { id } = req.query
  const patch = {}
  if (req.body.status !== undefined) patch.status = req.body.status
  if (req.body.notes  !== undefined) patch.notes  = req.body.notes

  const { data, error } = await supabase
    .from('bookings')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json(data)
}

import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { getAdminSessionOptions, type AdminSession } from '@/lib/session'
import { createServerClient } from '@/lib/supabase'
import { encrypt } from '@/lib/crypto'

async function requireAdmin() {
  const cookieStore = await cookies()
  const session = await getIronSession<AdminSession>(cookieStore, getAdminSessionOptions())
  if (!session.isAdmin) return null
  return session
}

function normalizeIds(ids: string[]): string[] {
  return ids.map(id => id.startsWith('act_') ? id : `act_${id}`)
}

// GET /api/admin/clients
export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('clients')
    .select('id, slug, name, created_at, ad_account_ids')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ clients: data })
}

// POST /api/admin/clients — create client
export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, slug, meta_token, ad_account_ids } = await req.json()

  // Support both single id (legacy) and array
  const rawIds: string[] = Array.isArray(ad_account_ids)
    ? ad_account_ids
    : ad_account_ids ? [ad_account_ids] : []

  if (!name || !slug || !meta_token || rawIds.length === 0) {
    return NextResponse.json({ error: 'name, slug, meta_token e ao menos uma conta de anúncios são obrigatórios' }, { status: 400 })
  }

  const supabase = createServerClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: client, error: clientError } = await (supabase as any)
    .from('clients')
    .insert({ name, slug: slug.toLowerCase().trim(), ad_account_ids: normalizeIds(rawIds) })
    .select('id, slug, name, ad_account_ids')
    .single() as { data: { id: string; slug: string; name: string; ad_account_ids: string[] } | null; error: { message: string } | null }

  if (clientError || !client) return NextResponse.json({ error: clientError?.message ?? 'Insert failed' }, { status: 400 })

  const encryptedToken = encrypt(meta_token)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: tokenError } = await (supabase as any)
    .from('meta_tokens')
    .insert({ client_id: client.id, encrypted_token: encryptedToken }) as { error: { message: string } | null }

  if (tokenError) return NextResponse.json({ error: tokenError.message }, { status: 500 })

  return NextResponse.json({ client }, { status: 201 })
}

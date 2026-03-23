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

// PATCH /api/admin/clients/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { name, slug, ad_account_ids, meta_token } = await req.json()

  const supabase = createServerClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = {}
  if (name) updates.name = name
  if (slug) updates.slug = slug.toLowerCase().trim()
  if (Array.isArray(ad_account_ids) && ad_account_ids.length > 0) {
    updates.ad_account_ids = ad_account_ids.map((id: string) =>
      id.startsWith('act_') ? id : `act_${id}`
    )
  }

  if (Object.keys(updates).length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('clients')
      .update(updates)
      .eq('id', id) as { error: { message: string } | null }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (meta_token) {
    const encryptedToken = encrypt(meta_token)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('meta_tokens')
      .upsert({ client_id: id, encrypted_token: encryptedToken, updated_at: new Date().toISOString() }, { onConflict: 'client_id' }) as { error: { message: string } | null }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

// DELETE /api/admin/clients/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = createServerClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('clients')
    .delete()
    .eq('id', id) as { error: { message: string } | null }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

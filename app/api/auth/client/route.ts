import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { clientSessionOptions, type ClientSession } from '@/lib/session'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { slug } = await req.json()

  if (!slug || typeof slug !== 'string') {
    return NextResponse.json({ error: 'slug required' }, { status: 400 })
  }

  const supabase = createServerClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: client, error } = await (supabase as any)
    .from('clients')
    .select('id, slug, name')
    .eq('slug', slug.toLowerCase().trim())
    .single() as { data: { id: string; slug: string; name: string } | null; error: { message: string } | null }

  if (error || !client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  const cookieStore = await cookies()
  const session = await getIronSession<ClientSession>(cookieStore, clientSessionOptions)
  session.clientId = client.id
  session.slug = client.slug
  await session.save()

  return NextResponse.json({ ok: true, slug: client.slug, name: client.name })
}

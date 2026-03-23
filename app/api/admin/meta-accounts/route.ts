import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { getAdminSessionOptions, type AdminSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const session = await getIronSession<AdminSession>(cookieStore, getAdminSessionOptions())
  if (!session.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { token } = await req.json()
  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 })

  const url = `https://graph.facebook.com/v22.0/me/adaccounts?fields=id,name,account_id,account_status&limit=50&access_token=${encodeURIComponent(token)}`

  const res = await fetch(url)
  const data = await res.json()

  if (data.error) {
    return NextResponse.json({ error: data.error.message }, { status: 400 })
  }

  // account_status: 1 = active, 2 = disabled, 3 = unsettled, 7 = pending review, 9 = in grace period, 100 = pending closure, 101 = closed
  const accounts = (data.data ?? []).map((a: { id: string; name: string; account_id: string; account_status: number }) => ({
    id: a.id,           // "act_123456789"
    account_id: a.account_id, // "123456789"
    name: a.name,
    active: a.account_status === 1,
  }))

  return NextResponse.json({ accounts })
}

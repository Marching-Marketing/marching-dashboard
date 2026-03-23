import { NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { adminSessionOptions, type AdminSession } from '@/lib/session'

export async function POST() {
  const cookieStore = await cookies()
  const session = await getIronSession<AdminSession>(cookieStore, adminSessionOptions)

  if (!session.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const syncSecret = process.env.SYNC_SECRET ?? ''
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const res = await fetch(`${appUrl}/api/sync`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${syncSecret}` },
  })

  const body = await res.json()
  return NextResponse.json(body, { status: res.status })
}

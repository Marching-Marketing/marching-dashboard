import { NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { getClientSessionOptions, getAdminSessionOptions } from '@/lib/session'

export async function POST() {
  const cookieStore = await cookies()

  const clientSession = await getIronSession(cookieStore, getClientSessionOptions())
  clientSession.destroy()

  const adminSession = await getIronSession(cookieStore, getAdminSessionOptions())
  adminSession.destroy()

  return NextResponse.json({ ok: true })
}

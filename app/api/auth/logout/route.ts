import { NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { clientSessionOptions, adminSessionOptions } from '@/lib/session'

export async function POST() {
  const cookieStore = await cookies()

  const clientSession = await getIronSession(cookieStore, clientSessionOptions)
  clientSession.destroy()

  const adminSession = await getIronSession(cookieStore, adminSessionOptions)
  adminSession.destroy()

  return NextResponse.json({ ok: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { timingSafeEqual, createHash } from 'crypto'
import { getAdminSessionOptions, type AdminSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (!password || typeof password !== 'string') {
    return NextResponse.json({ error: 'password required' }, { status: 400 })
  }

  const adminPassword = process.env.ADMIN_PASSWORD ?? ''

  if (!adminPassword) {
    return NextResponse.json({ error: 'ADMIN_PASSWORD not configured' }, { status: 500 })
  }

  // Use SHA-256 to normalize lengths before timingSafeEqual
  const inputHash = createHash('sha256').update(password).digest()
  const expectedHash = createHash('sha256').update(adminPassword).digest()

  let authorized = false
  try {
    authorized = timingSafeEqual(inputHash, expectedHash)
  } catch {
    authorized = false
  }

  if (!authorized) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const cookieStore = await cookies()
  const session = await getIronSession<AdminSession>(cookieStore, getAdminSessionOptions())
  session.isAdmin = true
  await session.save()

  return NextResponse.json({ ok: true })
}

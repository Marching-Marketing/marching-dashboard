import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock dependencies before importing route
vi.mock('@/lib/supabase', () => ({
  createServerClient: vi.fn(() => ({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        data: [],
        error: null,
      }),
    }),
  })),
}))

vi.mock('@/lib/crypto', () => ({
  decrypt: vi.fn((ct: string) => ct),
}))

vi.mock('@/lib/meta-api', () => ({
  fetchMetaInsights: vi.fn(async () => []),
}))

describe('POST /api/sync', () => {
  beforeEach(() => {
    process.env.SYNC_SECRET = 'test-sync-secret-32chars-padding!!'
  })

  it('returns 401 when Authorization header is missing', async () => {
    const { POST } = await import('../route')
    const req = new NextRequest('http://localhost/api/sync', { method: 'POST' })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 401 when Authorization token is wrong', async () => {
    const { POST } = await import('../route')
    const req = new NextRequest('http://localhost/api/sync', {
      method: 'POST',
      headers: { Authorization: 'Bearer wrong-secret' },
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 200 with correct secret', async () => {
    const { POST } = await import('../route')
    const req = new NextRequest('http://localhost/api/sync', {
      method: 'POST',
      headers: { Authorization: 'Bearer test-sync-secret-32chars-padding!!' },
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.synced).toBe(true)
  })
})

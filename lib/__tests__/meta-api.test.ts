import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchMetaInsights, type MetaInsight } from '../meta-api'

// Mock global fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('fetchMetaInsights', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('maps insight fields to DailyMetricRow correctly', async () => {
    const mockInsight: MetaInsight = {
      date_start: '2026-03-01',
      impressions: '5000',
      clicks: '120',
      spend: '48.50',
      actions: [
        { action_type: 'lead', value: '8' },
        { action_type: 'offsite_conversion.fb_pixel_purchase', value: '2' },
      ],
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [mockInsight] }),
    })

    const result = await fetchMetaInsights('act_123', 'test_token')

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      date: '2026-03-01',
      impressions: 5000,
      clicks: 120,
      spend: 48.5,
      leads: 8,
      conversions: 2,
    })
  })

  it('returns null for leads and conversions when actions are missing', async () => {
    const mockInsight: MetaInsight = {
      date_start: '2026-03-01',
      impressions: '1000',
      clicks: '50',
      spend: '10.00',
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [mockInsight] }),
    })

    const result = await fetchMetaInsights('act_123', 'test_token')
    expect(result[0].leads).toBeNull()
    expect(result[0].conversions).toBeNull()
  })

  it('throws on non-ok API response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: 'Invalid token' } }),
    })

    await expect(fetchMetaInsights('act_123', 'bad_token')).rejects.toThrow(
      'Meta API error: 400'
    )
  })

  it('uses date_preset=last_30_days and time_increment=1 in the URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    })

    await fetchMetaInsights('act_123', 'token')

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('date_preset=last_30_days')
    expect(calledUrl).toContain('time_increment=1')
  })
})

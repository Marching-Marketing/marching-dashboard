export interface MetaInsight {
  date_start: string       // "YYYY-MM-DD"
  impressions: string      // Meta returns numbers as strings
  clicks: string
  spend: string
  actions?: Array<{ action_type: string; value: string }>
}

export interface DailyMetricRow {
  date: string
  impressions: number
  clicks: number
  spend: number
  leads: number | null
  conversions: number | null
}

export async function fetchMetaInsights(
  adAccountId: string,   // e.g. "act_123456"
  accessToken: string
): Promise<DailyMetricRow[]> {
  const params = new URLSearchParams({
    fields: 'date_start,impressions,clicks,spend,actions',
    time_increment: '1',
    date_preset: 'last_30_days',
    access_token: accessToken,
    limit: '31',
  })

  const url = `https://graph.facebook.com/v22.0/${adAccountId}/insights?${params}`
  const response = await fetch(url)

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(`Meta API error: ${response.status} — ${JSON.stringify(error)}`)
  }

  const json = await response.json()
  const data: MetaInsight[] = json.data ?? []

  return data.map(mapInsight)
}

function mapInsight(insight: MetaInsight): DailyMetricRow {
  const leads = extractAction(insight.actions, 'lead')
    ?? extractAction(insight.actions, 'offsite_conversion.fb_pixel_lead')

  const conversions = extractAction(insight.actions, 'offsite_conversion.fb_pixel_purchase')
    ?? extractAction(insight.actions, 'purchase')

  return {
    date: insight.date_start,
    impressions: parseInt(insight.impressions ?? '0', 10),
    clicks: parseInt(insight.clicks ?? '0', 10),
    spend: parseFloat(insight.spend ?? '0'),
    leads: leads,
    conversions: conversions,
  }
}

function extractAction(
  actions: MetaInsight['actions'],
  actionType: string
): number | null {
  if (!actions) return null
  const action = actions.find(a => a.action_type === actionType)
  if (!action) return null
  const value = parseInt(action.value, 10)
  return isNaN(value) ? null : value
}

export interface MetaInsight {
  date_start: string
  impressions: string
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
  adAccountId: string,
  accessToken: string
): Promise<DailyMetricRow[]> {
  const params = new URLSearchParams({
    fields: 'date_start,impressions,clicks,spend,actions',
    time_increment: '1',
    date_preset: 'last_30d',
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

// Action types considered as "results" (leads/CPA), in priority order.
// Covers: lead forms, pixel leads, messages, WhatsApp, contacts, purchases, custom events.
const RESULT_ACTION_TYPES = [
  // Lead forms
  'lead',
  'offsite_conversion.fb_pixel_lead',
  'onsite_conversion.lead_grouped',
  // Messages / conversations
  'onsite_conversion.messaging_conversation_started_7d',
  'onsite_conversion.messaging_first_reply',
  'onsite_conversion.messaging_welcome_message_view',
  // WhatsApp
  'onsite_conversion.messaging_conversation_started_7d',
  // Contact / call
  'contact',
  'onsite_conversion.contact',
  'click_to_call',
  // Purchases / conversions
  'offsite_conversion.fb_pixel_purchase',
  'purchase',
  'offsite_conversion.fb_pixel_complete_registration',
  'complete_registration',
  // App installs / other
  'app_install',
  'omni_app_install',
]

// Action types considered as "conversions" (secondary metric — kept for compat)
const CONVERSION_ACTION_TYPES = [
  'offsite_conversion.fb_pixel_purchase',
  'purchase',
  'omni_purchase',
]

function mapInsight(insight: MetaInsight): DailyMetricRow {
  // Try each result type in priority order; first match wins
  let leads: number | null = null
  for (const type of RESULT_ACTION_TYPES) {
    const val = extractAction(insight.actions, type)
    if (val !== null && val > 0) {
      leads = val
      break
    }
  }

  // If no specific type matched, sum ALL actions as a fallback
  // (catches custom events, catalog sales, video views set as objective, etc.)
  if (leads === null && insight.actions && insight.actions.length > 0) {
    const total = insight.actions.reduce((sum, a) => {
      const v = parseInt(a.value, 10)
      return sum + (isNaN(v) ? 0 : v)
    }, 0)
    leads = total > 0 ? total : null
  }

  let conversions: number | null = null
  for (const type of CONVERSION_ACTION_TYPES) {
    const val = extractAction(insight.actions, type)
    if (val !== null && val > 0) {
      conversions = val
      break
    }
  }

  return {
    date: insight.date_start,
    impressions: parseInt(insight.impressions ?? '0', 10),
    clicks: parseInt(insight.clicks ?? '0', 10),
    spend: parseFloat(insight.spend ?? '0'),
    leads,
    conversions,
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

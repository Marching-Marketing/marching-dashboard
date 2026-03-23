import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { createServerClient } from '@/lib/supabase'
import { decrypt } from '@/lib/crypto'
import { fetchMetaInsights } from '@/lib/meta-api'
import type { MetaToken } from '@/types/database'

type ClientRow = {
  id: string
  slug: string
  name: string
  ad_account_ids: string[]
}

export async function POST(req: NextRequest) {
  // 1. Authorization
  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.replace('Bearer ', '')
  const syncSecret = process.env.SYNC_SECRET ?? ''

  if (!syncSecret) {
    return NextResponse.json({ error: 'SYNC_SECRET not configured' }, { status: 500 })
  }

  let authorized = false
  try {
    authorized = timingSafeEqual(Buffer.from(token), Buffer.from(syncSecret))
  } catch {
    authorized = false
  }

  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Fetch clients
  const supabase = createServerClient()
  const { data: clients, error: clientsError } = await supabase
    .from('clients')
    .select('id, slug, name, ad_account_ids') as { data: ClientRow[] | null; error: Error | null }

  if (clientsError) {
    return NextResponse.json({ error: clientsError.message }, { status: 500 })
  }

  const results: Array<{ slug: string; status: string; rows?: number; accounts?: number; error?: string }> = []

  // 3. Sync each client
  for (const client of (clients ?? [])) {
    try {
      // Get token
      const { data: tokenRow, error: tokenError } = await supabase
        .from('meta_tokens')
        .select('encrypted_token')
        .eq('client_id', client.id)
        .single() as { data: Pick<MetaToken, 'encrypted_token'> | null; error: Error | null }

      if (tokenError || !tokenRow) {
        results.push({ slug: client.slug, status: 'skipped', error: 'No token' })
        continue
      }

      const accessToken = decrypt(tokenRow.encrypted_token)
      const accountIds = client.ad_account_ids ?? []

      if (accountIds.length === 0) {
        results.push({ slug: client.slug, status: 'skipped', error: 'No ad_account_ids' })
        continue
      }

      // Fetch insights from ALL accounts and aggregate by date
      const aggregated = new Map<string, {
        impressions: number; clicks: number; spend: number; leads: number; conversions: number
      }>()

      for (const accountId of accountIds) {
        const insights = await fetchMetaInsights(accountId, accessToken)
        for (const insight of insights) {
          const existing = aggregated.get(insight.date)
          if (existing) {
            existing.impressions += insight.impressions
            existing.clicks += insight.clicks
            existing.spend += insight.spend
            existing.leads += insight.leads ?? 0
            existing.conversions += insight.conversions ?? 0
          } else {
            aggregated.set(insight.date, {
              impressions: insight.impressions,
              clicks: insight.clicks,
              spend: insight.spend,
              leads: insight.leads ?? 0,
              conversions: insight.conversions ?? 0,
            })
          }
        }
      }

      if (aggregated.size > 0) {
        const rows = Array.from(aggregated.entries()).map(([date, metrics]) => ({
          client_id: client.id,
          date,
          ...metrics,
        }))

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: upsertError } = await (supabase as any)
          .from('daily_metrics')
          .upsert(rows, { onConflict: 'client_id,date' }) as { error: Error | null }

        if (upsertError) {
          results.push({ slug: client.slug, status: 'error', error: upsertError.message })
          continue
        }

        results.push({ slug: client.slug, status: 'synced', rows: rows.length, accounts: accountIds.length })
      } else {
        results.push({ slug: client.slug, status: 'synced', rows: 0, accounts: accountIds.length })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      results.push({ slug: client.slug, status: 'error', error: message })
    }
  }

  return NextResponse.json({ synced: true, results })
}

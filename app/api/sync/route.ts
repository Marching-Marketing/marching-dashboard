import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { createServerClient } from '@/lib/supabase'
import { decrypt } from '@/lib/crypto'
import { fetchMetaInsights } from '@/lib/meta-api'
import type { Client, MetaToken } from '@/types/database'

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
    authorized = timingSafeEqual(
      Buffer.from(token),
      Buffer.from(syncSecret)
    )
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
    .select('id, slug, name, ad_account_id') as { data: (Pick<Client, 'id' | 'slug' | 'name'> & { ad_account_id: string | null })[] | null; error: Error | null }

  if (clientsError) {
    return NextResponse.json({ error: clientsError.message }, { status: 500 })
  }

  const results: Array<{ slug: string; status: string; rows?: number; error?: string }> = []

  // 3. Sync each client
  const clientList = clients ?? []
  for (const client of clientList) {
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

      // Use the stored ad_account_id
      if (!client.ad_account_id) {
        results.push({ slug: client.slug, status: 'skipped', error: 'No ad_account_id' })
        continue
      }
      const insights = await fetchMetaInsights(client.ad_account_id, accessToken)

      // Upsert metrics
      if (insights.length > 0) {
        const rows = insights.map(insight => ({
          client_id: client.id,
          date: insight.date,
          impressions: insight.impressions,
          clicks: insight.clicks,
          spend: insight.spend,
          leads: insight.leads,
          conversions: insight.conversions,
        }))

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: upsertError } = await (supabase as any)
          .from('daily_metrics')
          .upsert(rows, { onConflict: 'client_id,date' }) as { error: Error | null }

        if (upsertError) {
          results.push({ slug: client.slug, status: 'error', error: upsertError.message })
          continue
        }

        results.push({ slug: client.slug, status: 'synced', rows: rows.length })
      } else {
        results.push({ slug: client.slug, status: 'synced', rows: 0 })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      results.push({ slug: client.slug, status: 'error', error: message })
    }
  }

  return NextResponse.json({ synced: true, results })
}

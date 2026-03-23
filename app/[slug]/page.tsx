import { redirect } from 'next/navigation'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { getClientSessionOptions, type ClientSession } from '@/lib/session'
import { createServerClient } from '@/lib/supabase'
import DashboardShell, { type DashboardData } from '@/components/dashboard/DashboardShell'
import type { DailyMetric, Client } from '@/types/database'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ClientDashboardPage({ params }: Props) {
  const { slug } = await params

  const cookieStore = await cookies()
  const session = await getIronSession<ClientSession>(cookieStore, getClientSessionOptions())

  // Redirect to login if no session or wrong slug
  if (!session.clientId || session.slug !== slug) {
    redirect(`/${slug}/login`)
  }

  const supabase = createServerClient()

  // Fetch last 30 days of metrics
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const dateStr = thirtyDaysAgo.toISOString().split('T')[0]

  const { data: metrics } = await supabase
    .from('daily_metrics')
    .select('*')
    .eq('client_id', session.clientId)
    .gte('date', dateStr)
    .order('date', { ascending: false }) as { data: DailyMetric[] | null }

  // Fetch client info
  const { data: client } = await supabase
    .from('clients')
    .select('name')
    .eq('id', session.clientId)
    .single() as { data: Pick<Client, 'name'> | null }

  // Aggregate metrics
  const rows = metrics ?? []
  const totalImpressions = rows.reduce((s, r) => s + (r.impressions ?? 0), 0)
  const totalClicks = rows.reduce((s, r) => s + (r.clicks ?? 0), 0)
  const totalLeads = rows.reduce((s, r) => s + (r.leads ?? 0), 0)
  const totalSpend = rows.reduce((s, r) => s + Number(r.spend ?? 0), 0)
  const totalConversions = rows.reduce((s, r) => s + (r.conversions ?? 0), 0)

  const ctr = totalClicks > 0 && totalLeads > 0
    ? Math.round((totalLeads / totalClicks) * 100)
    : 0

  const roas = totalSpend > 0 && totalConversions > 0
    ? (totalConversions / totalSpend).toFixed(2) + 'x'
    : '—'

  // Format numbers
  const fmt = (n: number) =>
    n >= 1000000 ? `${(n / 1000000).toFixed(1)}M`
    : n >= 1000 ? `${(n / 1000).toFixed(1)}K`
    : String(n)

  const cpa = totalLeads > 0 ? `R$ ${(totalSpend / totalLeads).toFixed(0)}` : '—'

  const dashboardData: DashboardData = {
    clientName: client?.name ?? slug,
    lastUpdated: rows[0]?.date ?? 'N/A',
    metrics: {
      impressoes: fmt(totalImpressions),
      cliques: fmt(totalClicks),
      leads: String(totalLeads),
      cpa,
      impressoesChange: 0,
      cliquesChange: 0,
      leadsChange: 0,
      cpaChange: 0,
    },
    ctr,
    roas,
    leadQuality: '—',
  }

  return <DashboardShell data={dashboardData} />
}

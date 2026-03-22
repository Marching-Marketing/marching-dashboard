import DashboardShell, { DashboardData } from '@/components/dashboard/DashboardShell'

const demoData: DashboardData = {
  clientName: 'MARCHING',
  lastUpdated: '20/03/2026 às 14:32',
  metrics: {
    impressoes: '712K',
    cliques: '28.4K',
    leads: '653',
    cpa: 'R$ 26',
    impressoesChange: 18,
    cliquesChange: 24,
    leadsChange: 23,
    cpaChange: -8,
  },
  ctr: 68,
  roas: '4.24x',
  leadQuality: '87 / 100',
}

export default function Home() {
  return <DashboardShell data={demoData} />
}

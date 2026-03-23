import { redirect } from 'next/navigation'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { adminSessionOptions, type AdminSession } from '@/lib/session'
import { createServerClient } from '@/lib/supabase'
import AdminShell from '@/components/dashboard/AdminShell'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const session = await getIronSession<AdminSession>(cookieStore, adminSessionOptions)

  if (!session.isAdmin) {
    redirect('/admin/login')
  }

  const supabase = createServerClient()
  const { data: clients } = await supabase
    .from('clients')
    .select('id, slug, name, created_at')
    .order('created_at', { ascending: false })

  return <AdminShell clients={clients ?? []} />
}

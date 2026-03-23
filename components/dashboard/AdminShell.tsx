'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MarchingLogo from './MarchingLogo'
import { ArrowUpRight, Users, RefreshCw, LogOut, Plus, CheckCircle, XCircle } from 'lucide-react'

interface ClientRecord {
  id: string
  slug: string
  name: string
  created_at: string
}

interface AdminShellProps {
  clients: ClientRecord[]
}

export default function AdminShell({ clients: initialClients }: AdminShellProps) {
  const router = useRouter()
  const [clients, setClients] = useState(initialClients)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newClient, setNewClient] = useState({ name: '', slug: '', meta_token: '', ad_account_id: '' })
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')

  async function handleSync() {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch('/api/admin/trigger-sync', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        const count = data.results?.filter((r: { status: string }) => r.status === 'synced').length ?? 0
        setSyncResult(`✓ ${count} cliente(s) sincronizado(s)`)
      } else {
        setSyncResult(`✗ Erro: ${data.error}`)
      }
    } catch {
      setSyncResult('✗ Falha na conexão')
    }
    setSyncing(false)
  }

  async function handleAddClient(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    setAddError('')
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient),
      })
      const data = await res.json()
      if (res.ok) {
        setClients(prev => [data.client, ...prev])
        setNewClient({ name: '', slug: '', meta_token: '', ad_account_id: '' })
        setShowAdd(false)
      } else {
        setAddError(data.error ?? 'Erro ao adicionar')
      }
    } catch {
      setAddError('Falha na conexão')
    }
    setAdding(false)
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#05070F] text-[#E6EAF2]" style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <header className="border-b border-[#1a2040] px-6 py-4 flex items-center justify-between sticky top-0 bg-[#05070F]/90 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <MarchingLogo size={36} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#E6EAF2] text-base">MARCHING</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full border text-[#6C3BFF] border-[#6C3BFF]/30 font-semibold tracking-wider">ADMIN</span>
            </div>
            <span className="text-[11px] text-[#5C6475]">Painel de gestão</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 text-xs text-[#00D1C7] bg-[#00D1C7]/10 border border-[#00D1C7]/20 px-3 py-2 rounded-lg disabled:opacity-50 hover:bg-[#00D1C7]/15 transition-colors"
          >
            <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Sincronizando...' : 'Sincronizar agora'}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-[#5C6475] hover:text-[#E6EAF2] px-3 py-2 rounded-lg transition-colors"
          >
            <LogOut size={13} /> Sair
          </button>
        </div>
      </header>

      <main className="px-6 py-6 max-w-4xl mx-auto space-y-6">
        {/* Sync result */}
        {syncResult && (
          <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl border ${
            syncResult.startsWith('✓')
              ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
              : 'text-red-400 bg-red-400/10 border-red-400/20'
          }`}>
            {syncResult.startsWith('✓') ? <CheckCircle size={15} /> : <XCircle size={15} />}
            {syncResult}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl p-5 border border-[#1a2040] bg-[#0B0F1F] flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#6C3BFF]/12 border border-[#6C3BFF]/20">
              <Users size={20} className="text-[#6C3BFF]" />
            </div>
            <div>
              <div className="text-xs text-[#5C6475]">Total de clientes</div>
              <div className="text-2xl font-bold text-[#E6EAF2]">{clients.length}</div>
            </div>
          </div>
          <div
            className="rounded-xl p-5 border border-[#00D1C7]/20 bg-[#0B0F1F] flex items-center gap-4 cursor-pointer hover:bg-[#0B0F1F]/80 transition-colors"
            onClick={() => setShowAdd(true)}
          >
            <div className="p-3 rounded-xl bg-[#00D1C7]/12 border border-[#00D1C7]/20">
              <Plus size={20} className="text-[#00D1C7]" />
            </div>
            <div>
              <div className="text-xs text-[#5C6475]">Adicionar cliente</div>
              <div className="text-sm font-semibold text-[#00D1C7]">Novo cliente →</div>
            </div>
          </div>
        </div>

        {/* Add client form */}
        {showAdd && (
          <div className="rounded-xl p-5 border border-[#6C3BFF]/30 bg-[#0B0F1F]">
            <h3 className="text-sm font-semibold text-[#E6EAF2] mb-4">Novo cliente</h3>
            <form onSubmit={handleAddClient} className="space-y-3">
              <input
                type="text"
                placeholder="Nome (ex: Laís Rios)"
                value={newClient.name}
                onChange={e => setNewClient(p => ({ ...p, name: e.target.value }))}
                required
                className="w-full bg-[#05070F] border border-[#1a2040] text-[#E6EAF2] placeholder-[#5C6475] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#6C3BFF]"
              />
              <input
                type="text"
                placeholder="Slug (ex: lais-rios)"
                value={newClient.slug}
                onChange={e => setNewClient(p => ({ ...p, slug: e.target.value }))}
                required
                className="w-full bg-[#05070F] border border-[#1a2040] text-[#E6EAF2] placeholder-[#5C6475] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#6C3BFF]"
              />
              <input
                type="text"
                placeholder="ID da Conta de Anúncios (ex: 123456789)"
                value={newClient.ad_account_id}
                onChange={e => setNewClient(p => ({ ...p, ad_account_id: e.target.value }))}
                required
                className="w-full bg-[#05070F] border border-[#1a2040] text-[#E6EAF2] placeholder-[#5C6475] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#6C3BFF]"
              />
              <input
                type="password"
                placeholder="Meta System User Token"
                value={newClient.meta_token}
                onChange={e => setNewClient(p => ({ ...p, meta_token: e.target.value }))}
                required
                className="w-full bg-[#05070F] border border-[#1a2040] text-[#E6EAF2] placeholder-[#5C6475] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#6C3BFF]"
              />
              {addError && <p className="text-xs text-red-400">{addError}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #6C3BFF, #00D1C7)' }}
                >
                  {adding ? 'Salvando...' : 'Adicionar'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAdd(false); setAddError('') }}
                  className="px-4 py-2.5 rounded-lg text-sm text-[#5C6475] border border-[#1a2040] hover:text-[#E6EAF2]"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Clients list */}
        <div className="rounded-xl border border-[#1a2040] bg-[#0B0F1F] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1a2040]">
            <h3 className="text-sm font-semibold text-[#E6EAF2]">Clientes ativos</h3>
          </div>
          {clients.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-[#5C6475]">
              Nenhum cliente cadastrado ainda.
            </div>
          ) : (
            <div className="divide-y divide-[#1a2040]">
              {clients.map(c => (
                <div key={c.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <div className="text-sm font-semibold text-[#E6EAF2]">{c.name}</div>
                    <div className="text-xs text-[#5C6475] mt-0.5">relatorios.marching.com.br/{c.slug}</div>
                  </div>
                  <a
                    href={`/${c.slug}`}
                    target="_blank"
                    className="flex items-center gap-1 text-xs text-[#6C3BFF] hover:text-[#00D1C7] transition-colors"
                  >
                    Ver dashboard <ArrowUpRight size={12} />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

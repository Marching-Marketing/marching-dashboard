'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MarchingLogo from './MarchingLogo'
import { ArrowUpRight, Users, RefreshCw, LogOut, Plus, CheckCircle, XCircle, Pencil, Trash2, Save, X } from 'lucide-react'

interface ClientRecord {
  id: string
  slug: string
  name: string
  created_at: string
  ad_account_id?: string
}

interface AdminShellProps {
  clients: ClientRecord[]
}

const inputClass = 'w-full bg-[#05070F] border border-[#1a2040] text-[#E6EAF2] placeholder-[#5C6475] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#6C3BFF] transition-colors'

export default function AdminShell({ clients: initialClients }: AdminShellProps) {
  const router = useRouter()
  const [clients, setClients] = useState(initialClients)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<string | null>(null)

  // Add form
  const [showAdd, setShowAdd] = useState(false)
  const [newClient, setNewClient] = useState({ name: '', slug: '', meta_token: '', ad_account_id: '' })
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')

  // Edit state: id of client being edited
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', slug: '', ad_account_id: '', meta_token: '' })
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState('')

  // Delete confirm
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  function startEdit(c: ClientRecord) {
    setEditingId(c.id)
    setEditForm({
      name: c.name,
      slug: c.slug,
      ad_account_id: c.ad_account_id?.replace(/^act_/, '') ?? '',
      meta_token: '',
    })
    setEditError('')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditError('')
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingId) return
    setSaving(true)
    setEditError('')
    try {
      const res = await fetch(`/api/admin/clients/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      const data = await res.json()
      if (res.ok) {
        setClients(prev => prev.map(c =>
          c.id === editingId
            ? {
                ...c,
                name: editForm.name || c.name,
                slug: editForm.slug || c.slug,
                ad_account_id: editForm.ad_account_id ? `act_${editForm.ad_account_id.replace(/^act_/, '')}` : c.ad_account_id,
              }
            : c
        ))
        setEditingId(null)
      } else {
        setEditError(data.error ?? 'Erro ao salvar')
      }
    } catch {
      setEditError('Falha na conexão')
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/clients/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setClients(prev => prev.filter(c => c.id !== id))
        setDeletingId(null)
      }
    } catch {
      // ignore
    }
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
            onClick={() => { setShowAdd(true); setEditingId(null) }}
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
              <input type="text" placeholder="Nome (ex: Laís Rios)" value={newClient.name}
                onChange={e => setNewClient(p => ({ ...p, name: e.target.value }))} required className={inputClass} />
              <input type="text" placeholder="Slug da URL (ex: lais-rios)" value={newClient.slug}
                onChange={e => setNewClient(p => ({ ...p, slug: e.target.value }))} required className={inputClass} />
              <input type="text" placeholder="ID da Conta de Anúncios Meta (ex: 123456789)" value={newClient.ad_account_id}
                onChange={e => setNewClient(p => ({ ...p, ad_account_id: e.target.value }))} required className={inputClass} />
              <input type="password" placeholder="Meta System User Token" value={newClient.meta_token}
                onChange={e => setNewClient(p => ({ ...p, meta_token: e.target.value }))} required className={inputClass} />
              {addError && <p className="text-xs text-red-400">{addError}</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={adding}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #6C3BFF, #00D1C7)' }}>
                  {adding ? 'Salvando...' : 'Adicionar'}
                </button>
                <button type="button" onClick={() => { setShowAdd(false); setAddError('') }}
                  className="px-4 py-2.5 rounded-lg text-sm text-[#5C6475] border border-[#1a2040] hover:text-[#E6EAF2]">
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
                <div key={c.id}>
                  {/* Normal row */}
                  {editingId !== c.id ? (
                    <div className="flex items-center justify-between px-5 py-4">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[#E6EAF2]">{c.name}</div>
                        <div className="text-xs text-[#5C6475] mt-0.5">/{c.slug}</div>
                        {c.ad_account_id ? (
                          <div className="text-[10px] text-[#6C3BFF]/70 mt-0.5">{c.ad_account_id}</div>
                        ) : (
                          <div className="text-[10px] text-yellow-500/70 mt-0.5">⚠ Sem conta de anúncios</div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-4 shrink-0">
                        <a href={`/${c.slug}`} target="_blank"
                          className="flex items-center gap-1 text-xs text-[#6C3BFF] hover:text-[#00D1C7] transition-colors px-2 py-1.5 rounded-lg hover:bg-[#6C3BFF]/10">
                          <ArrowUpRight size={12} />
                        </a>
                        <button onClick={() => startEdit(c)}
                          className="flex items-center gap-1 text-xs text-[#5C6475] hover:text-[#E6EAF2] px-2 py-1.5 rounded-lg hover:bg-[#1a2040] transition-colors">
                          <Pencil size={12} />
                        </button>
                        {deletingId === c.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-red-400">Confirmar?</span>
                            <button onClick={() => handleDelete(c.id)}
                              className="text-[10px] text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-400/10">
                              Sim
                            </button>
                            <button onClick={() => setDeletingId(null)}
                              className="text-[10px] text-[#5C6475] hover:text-[#E6EAF2] px-2 py-1 rounded bg-[#1a2040]">
                              Não
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setDeletingId(c.id)}
                            className="flex items-center gap-1 text-xs text-[#5C6475] hover:text-red-400 px-2 py-1.5 rounded-lg hover:bg-red-400/10 transition-colors">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Edit row */
                    <div className="px-5 py-4 bg-[#0d1124]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-[#6C3BFF]">Editando {c.name}</span>
                        <button onClick={cancelEdit} className="text-[#5C6475] hover:text-[#E6EAF2]">
                          <X size={14} />
                        </button>
                      </div>
                      <form onSubmit={handleSaveEdit} className="space-y-2.5">
                        <div className="grid grid-cols-2 gap-2.5">
                          <input type="text" placeholder="Nome" value={editForm.name}
                            onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                            className={inputClass} />
                          <input type="text" placeholder="Slug da URL" value={editForm.slug}
                            onChange={e => setEditForm(p => ({ ...p, slug: e.target.value }))}
                            className={inputClass} />
                        </div>
                        <input type="text"
                          placeholder="ID da Conta de Anúncios Meta (ex: 123456789)"
                          value={editForm.ad_account_id}
                          onChange={e => setEditForm(p => ({ ...p, ad_account_id: e.target.value }))}
                          className={inputClass} />
                        <input type="password"
                          placeholder="Novo token Meta (deixe vazio para manter atual)"
                          value={editForm.meta_token}
                          onChange={e => setEditForm(p => ({ ...p, meta_token: e.target.value }))}
                          className={inputClass} />
                        {editError && <p className="text-xs text-red-400">{editError}</p>}
                        <div className="flex gap-2 pt-1">
                          <button type="submit" disabled={saving}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #6C3BFF, #00D1C7)' }}>
                            <Save size={12} />
                            {saving ? 'Salvando...' : 'Salvar alterações'}
                          </button>
                          <button type="button" onClick={cancelEdit}
                            className="px-4 py-2 rounded-lg text-xs text-[#5C6475] border border-[#1a2040] hover:text-[#E6EAF2]">
                            Cancelar
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

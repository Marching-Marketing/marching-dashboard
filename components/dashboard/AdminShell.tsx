'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MarchingLogo from './MarchingLogo'
import { ArrowUpRight, Users, RefreshCw, LogOut, Plus, CheckCircle, XCircle, Pencil, Trash2, Save, X, Search } from 'lucide-react'

interface ClientRecord {
  id: string
  slug: string
  name: string
  created_at: string
  ad_account_ids?: string[]
}

interface MetaAccount {
  id: string
  account_id: string
  name: string
  active: boolean
}

interface AdminShellProps {
  clients: ClientRecord[]
}

const inputClass = 'w-full bg-[#05070F] border border-[#1a2040] text-[#E6EAF2] placeholder-[#5C6475] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#6C3BFF] transition-colors'

// Multi-account picker: paste token → fetch all accounts → toggle chips
function TokenAccountPicker({
  tokenValue,
  onTokenChange,
  selectedIds,
  onSelectedChange,
  tokenPlaceholder = 'Meta System User Token',
}: {
  tokenValue: string
  onTokenChange: (v: string) => void
  selectedIds: string[]
  onSelectedChange: (ids: string[]) => void
  tokenPlaceholder?: string
}) {
  const [fetching, setFetching] = useState(false)
  const [accounts, setAccounts] = useState<MetaAccount[] | null>(null)
  const [fetchError, setFetchError] = useState('')

  async function fetchAccounts() {
    if (!tokenValue.trim()) { setFetchError('Cole o token antes de buscar'); return }
    setFetching(true)
    setFetchError('')
    setAccounts(null)
    try {
      const res = await fetch('/api/admin/meta-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenValue }),
      })
      const data = await res.json()
      if (res.ok) {
        setAccounts(data.accounts)
        // Auto-select all active accounts
        const activeIds = data.accounts
          .filter((a: MetaAccount) => a.active)
          .map((a: MetaAccount) => a.account_id)
        onSelectedChange(activeIds)
      } else {
        setFetchError(data.error ?? 'Erro ao buscar contas')
      }
    } catch {
      setFetchError('Falha na conexão')
    }
    setFetching(false)
  }

  function toggleAccount(accountId: string) {
    if (selectedIds.includes(accountId)) {
      onSelectedChange(selectedIds.filter(id => id !== accountId))
    } else {
      onSelectedChange([...selectedIds, accountId])
    }
  }

  return (
    <div className="space-y-2.5">
      <div className="flex gap-2">
        <input
          type="password"
          placeholder={tokenPlaceholder}
          value={tokenValue}
          onChange={e => { onTokenChange(e.target.value); setAccounts(null); setFetchError('') }}
          className={inputClass + ' flex-1'}
        />
        <button
          type="button"
          onClick={fetchAccounts}
          disabled={fetching || !tokenValue.trim()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#00D1C7] bg-[#00D1C7]/10 border border-[#00D1C7]/20 hover:bg-[#00D1C7]/20 disabled:opacity-40 transition-colors whitespace-nowrap shrink-0"
        >
          <Search size={12} className={fetching ? 'animate-pulse' : ''} />
          {fetching ? 'Buscando...' : 'Buscar contas'}
        </button>
      </div>

      {fetchError && <p className="text-xs text-red-400">{fetchError}</p>}

      {/* Chips de contas encontradas */}
      {accounts !== null && (
        accounts.length === 0 ? (
          <p className="text-xs text-yellow-400">Nenhuma conta de anúncios encontrada nesse token.</p>
        ) : (
          <div className="space-y-2">
            <p className="text-[10px] text-[#5C6475] uppercase tracking-wider">
              {accounts.length} conta{accounts.length > 1 ? 's' : ''} encontrada{accounts.length > 1 ? 's' : ''} — clique para selecionar/desselecionar:
            </p>
            <div className="flex flex-wrap gap-2">
              {accounts.map(a => {
                const selected = selectedIds.includes(a.account_id)
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggleAccount(a.account_id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      selected
                        ? 'bg-[#6C3BFF]/20 border-[#6C3BFF]/60 text-[#E6EAF2]'
                        : 'bg-[#05070F] border-[#1a2040] text-[#5C6475] hover:border-[#6C3BFF]/30'
                    } ${!a.active ? 'opacity-50' : ''}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${selected ? 'bg-[#6C3BFF]' : 'bg-[#1a2040]'}`} />
                    <span className="max-w-[160px] truncate">{a.name}</span>
                    <span className="text-[10px] opacity-60">{a.account_id}</span>
                    {!a.active && <span className="text-[9px] text-yellow-500">inativa</span>}
                  </button>
                )
              })}
            </div>
            {selectedIds.length > 0 && (
              <p className="text-[10px] text-[#6C3BFF]">
                ✓ {selectedIds.length} conta{selectedIds.length > 1 ? 's' : ''} selecionada{selectedIds.length > 1 ? 's' : ''} — métricas serão somadas no relatório
              </p>
            )}
          </div>
        )
      )}

      {/* Fallback manual quando não buscou ainda */}
      {accounts === null && (
        <div>
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {selectedIds.map(id => (
                <span key={id} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-[#6C3BFF]/15 border border-[#6C3BFF]/30 text-[#E6EAF2]">
                  {id.replace('act_', '')}
                  <button type="button" onClick={() => onSelectedChange(selectedIds.filter(s => s !== id))}
                    className="text-[#5C6475] hover:text-red-400 ml-0.5">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <input
            type="text"
            placeholder="ID manual (ou clique em Buscar contas acima)"
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault()
                const val = (e.target as HTMLInputElement).value.trim().replace(/^act_/, '')
                if (val && !selectedIds.includes(val)) {
                  onSelectedChange([...selectedIds, val]);
                  (e.target as HTMLInputElement).value = ''
                }
              }
            }}
            className={inputClass}
          />
          <p className="text-[10px] text-[#5C6475] mt-1">Digite o ID e pressione Enter para adicionar</p>
        </div>
      )}
    </div>
  )
}

export default function AdminShell({ clients: initialClients }: AdminShellProps) {
  const router = useRouter()
  const [clients, setClients] = useState(initialClients)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<string | null>(null)

  const [showAdd, setShowAdd] = useState(false)
  const [newClient, setNewClient] = useState({ name: '', slug: '', meta_token: '', ad_account_ids: [] as string[] })
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', slug: '', ad_account_ids: [] as string[], meta_token: '' })
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState('')

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
        setNewClient({ name: '', slug: '', meta_token: '', ad_account_ids: [] })
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
      ad_account_ids: (c.ad_account_ids ?? []).map(id => id.replace(/^act_/, '')),
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
                ad_account_ids: editForm.ad_account_ids.length > 0
                  ? editForm.ad_account_ids.map(id => `act_${id.replace(/^act_/, '')}`)
                  : c.ad_account_ids,
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
          <button onClick={handleSync} disabled={syncing}
            className="flex items-center gap-2 text-xs text-[#00D1C7] bg-[#00D1C7]/10 border border-[#00D1C7]/20 px-3 py-2 rounded-lg disabled:opacity-50 hover:bg-[#00D1C7]/15 transition-colors">
            <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Sincronizando...' : 'Sincronizar agora'}
          </button>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-[#5C6475] hover:text-[#E6EAF2] px-3 py-2 rounded-lg transition-colors">
            <LogOut size={13} /> Sair
          </button>
        </div>
      </header>

      <main className="px-6 py-6 max-w-4xl mx-auto space-y-6">
        {syncResult && (
          <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl border ${
            syncResult.startsWith('✓') ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-red-400 bg-red-400/10 border-red-400/20'
          }`}>
            {syncResult.startsWith('✓') ? <CheckCircle size={15} /> : <XCircle size={15} />}
            {syncResult}
          </div>
        )}

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
          <div onClick={() => { setShowAdd(true); setEditingId(null) }}
            className="rounded-xl p-5 border border-[#00D1C7]/20 bg-[#0B0F1F] flex items-center gap-4 cursor-pointer hover:bg-[#0B0F1F]/80 transition-colors">
            <div className="p-3 rounded-xl bg-[#00D1C7]/12 border border-[#00D1C7]/20">
              <Plus size={20} className="text-[#00D1C7]" />
            </div>
            <div>
              <div className="text-xs text-[#5C6475]">Adicionar cliente</div>
              <div className="text-sm font-semibold text-[#00D1C7]">Novo cliente →</div>
            </div>
          </div>
        </div>

        {showAdd && (
          <div className="rounded-xl p-5 border border-[#6C3BFF]/30 bg-[#0B0F1F]">
            <h3 className="text-sm font-semibold text-[#E6EAF2] mb-4">Novo cliente</h3>
            <form onSubmit={handleAddClient} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Nome (ex: Laís Rios)" value={newClient.name}
                  onChange={e => setNewClient(p => ({ ...p, name: e.target.value }))} required className={inputClass} />
                <input type="text" placeholder="Slug da URL (ex: lais-rios)" value={newClient.slug}
                  onChange={e => setNewClient(p => ({ ...p, slug: e.target.value }))} required className={inputClass} />
              </div>
              <TokenAccountPicker
                tokenValue={newClient.meta_token}
                onTokenChange={v => setNewClient(p => ({ ...p, meta_token: v }))}
                selectedIds={newClient.ad_account_ids}
                onSelectedChange={ids => setNewClient(p => ({ ...p, ad_account_ids: ids }))}
              />
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

        <div className="rounded-xl border border-[#1a2040] bg-[#0B0F1F] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1a2040]">
            <h3 className="text-sm font-semibold text-[#E6EAF2]">Clientes ativos</h3>
          </div>
          {clients.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-[#5C6475]">Nenhum cliente cadastrado ainda.</div>
          ) : (
            <div className="divide-y divide-[#1a2040]">
              {clients.map(c => (
                <div key={c.id}>
                  {editingId !== c.id ? (
                    <div className="flex items-center justify-between px-5 py-4">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[#E6EAF2]">{c.name}</div>
                        <div className="text-xs text-[#5C6475] mt-0.5">/{c.slug}</div>
                        {(c.ad_account_ids ?? []).length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(c.ad_account_ids ?? []).map(id => (
                              <span key={id} className="text-[10px] px-1.5 py-0.5 rounded bg-[#6C3BFF]/10 border border-[#6C3BFF]/20 text-[#6C3BFF]/80">
                                {id.replace('act_', '')}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[10px] text-yellow-500/70 mt-0.5">⚠ Sem conta de anúncios</div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-4 shrink-0">
                        <a href={`/${c.slug}`} target="_blank"
                          className="text-xs text-[#6C3BFF] hover:text-[#00D1C7] px-2 py-1.5 rounded-lg hover:bg-[#6C3BFF]/10 transition-colors">
                          <ArrowUpRight size={12} />
                        </a>
                        <button onClick={() => startEdit(c)}
                          className="text-xs text-[#5C6475] hover:text-[#E6EAF2] px-2 py-1.5 rounded-lg hover:bg-[#1a2040] transition-colors">
                          <Pencil size={12} />
                        </button>
                        {deletingId === c.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-red-400">Confirmar?</span>
                            <button onClick={() => handleDelete(c.id)} className="text-[10px] text-red-400 px-2 py-1 rounded bg-red-400/10">Sim</button>
                            <button onClick={() => setDeletingId(null)} className="text-[10px] text-[#5C6475] px-2 py-1 rounded bg-[#1a2040]">Não</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeletingId(c.id)}
                            className="text-xs text-[#5C6475] hover:text-red-400 px-2 py-1.5 rounded-lg hover:bg-red-400/10 transition-colors">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="px-5 py-4 bg-[#0d1124]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-[#6C3BFF]">Editando {c.name}</span>
                        <button onClick={cancelEdit} className="text-[#5C6475] hover:text-[#E6EAF2]"><X size={14} /></button>
                      </div>
                      <form onSubmit={handleSaveEdit} className="space-y-2.5">
                        <div className="grid grid-cols-2 gap-2.5">
                          <input type="text" placeholder="Nome" value={editForm.name}
                            onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className={inputClass} />
                          <input type="text" placeholder="Slug da URL" value={editForm.slug}
                            onChange={e => setEditForm(p => ({ ...p, slug: e.target.value }))} className={inputClass} />
                        </div>
                        <TokenAccountPicker
                          tokenValue={editForm.meta_token}
                          onTokenChange={v => setEditForm(p => ({ ...p, meta_token: v }))}
                          selectedIds={editForm.ad_account_ids}
                          onSelectedChange={ids => setEditForm(p => ({ ...p, ad_account_ids: ids }))}
                          tokenPlaceholder="Novo token (vazio = manter atual)"
                        />
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

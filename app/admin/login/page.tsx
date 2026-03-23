'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MarchingLogo from '@/components/dashboard/MarchingLogo'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/admin')
    } else {
      setError('Senha incorreta')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#05070F] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <MarchingLogo size={52} />
          <h1 className="mt-4 text-xl font-bold text-[#E6EAF2]">Admin</h1>
          <p className="text-xs text-[#5C6475] mt-1">Painel de gestão</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Senha"
              required
              className="w-full bg-[#0B0F1F] border border-[#1a2040] text-[#E6EAF2] placeholder-[#5C6475] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6C3BFF] transition-colors"
            />
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-50 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #6C3BFF, #00D1C7)' }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

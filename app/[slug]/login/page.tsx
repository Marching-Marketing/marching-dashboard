'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MarchingLogo from '@/components/dashboard/MarchingLogo'

export default function ClientLoginPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Use React.use() would need Suspense — instead unwrap via params
    const resolvedParams = await params

    const res = await fetch('/api/auth/client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: resolvedParams.slug }),
    })

    if (res.ok) {
      router.push(`/${resolvedParams.slug}`)
    } else {
      const data = await res.json()
      setError(data.error ?? 'Acesso negado')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#05070F] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <MarchingLogo size={52} />
          <h1 className="mt-4 text-xl font-bold text-[#E6EAF2] tracking-tight">MARCHING</h1>
          <p className="text-xs text-[#5C6475] mt-1">Acesso ao dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-center text-[#8A94A6]">
            Clique em <strong className="text-[#E6EAF2]">Acessar</strong> para entrar no seu painel.
          </p>

          {error && (
            <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-opacity disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #6C3BFF, #00D1C7)' }}
          >
            {loading ? 'Entrando...' : 'Acessar Dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}

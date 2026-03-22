# Meta Ads Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar o dashboard React/Vite estático em um sistema Next.js conectado à Meta Marketing API, com sync diário às 08h, multi-cliente via URL única protegida por senha, e painel admin para gerenciar clientes.

**Architecture:** Next.js 15 App Router hospedado na Vercel; Supabase para banco de dados gerenciado; GitHub Actions como cron gratuito; tokens Meta criptografados com AES-256-GCM em repouso; sessões via iron-session.

**Tech Stack:** Next.js 15, TypeScript, Supabase (PostgreSQL), iron-session, Node.js crypto (AES-256-GCM), Meta Marketing API v22, GitHub Actions, Vercel, Tailwind CSS, shadcn/ui, Vitest.

**Spec:** `docs/superpowers/specs/2026-03-22-meta-ads-dashboard-design.md`

---

## File Map

```
marching-dashboard/           ← repositório existente (substituir Vite por Next.js)
├── app/
│   ├── layout.tsx            # Root layout com fonte DM Sans e globals.css
│   ├── globals.css           # Estilos globais dark (migrado de App.css)
│   ├── [slug]/
│   │   ├── page.tsx          # Server Component — dashboard do cliente
│   │   └── login/
│   │       └── page.tsx      # Página de login do cliente
│   └── admin/
│       ├── page.tsx          # Server Component — painel admin
│       └── login/
│           └── page.tsx      # Página de login admin
├── app/api/
│   ├── sync/
│   │   └── route.ts          # POST /api/sync — sync Meta API → Supabase
│   ├── auth/
│   │   ├── client/
│   │   │   └── route.ts      # POST /api/auth/client — login cliente
│   │   └── admin/
│   │       └── route.ts      # POST /api/auth/admin — login admin
│   ├── clients/
│   │   └── route.ts          # GET/POST/PATCH /api/clients — CRUD admin
│   └── admin/
│       └── trigger-sync/
│           └── route.ts      # POST /api/admin/trigger-sync — proxy seguro (secret nunca vai ao browser)
├── components/
│   ├── dashboard/
│   │   ├── MarchingLogo.tsx  # Logo SVG MARCHING (migrado de App.tsx)
│   │   ├── MetricCard.tsx    # Card KPI com sparkline
│   │   ├── GrowthChart.tsx   # Gráfico exponencial SVG
│   │   ├── BarChartComp.tsx  # Gráfico de barras semanal
│   │   ├── DonutChart.tsx    # Donut de conversão
│   │   └── DashboardShell.tsx # Layout completo do dashboard
│   └── ui/                   # shadcn/ui existente — NÃO MODIFICAR
├── lib/
│   ├── supabase.ts           # Supabase server client
│   ├── crypto.ts             # encrypt/decrypt AES-256-GCM
│   ├── meta-api.ts           # fetch Meta API + mapeamento de campos
│   ├── session.ts            # iron-session config (cliente + admin)
│   └── types.ts              # tipos TypeScript compartilhados
├── supabase/
│   └── migrations/
│       └── 001_initial.sql   # DDL: clients, meta_tokens, daily_metrics
├── tests/
│   ├── lib/
│   │   ├── crypto.test.ts    # testa encrypt/decrypt
│   │   └── meta-api.test.ts  # testa mapeamento da resposta Meta
│   └── api/
│       └── sync.test.ts      # testa autorização do endpoint
├── .github/
│   └── workflows/
│       └── sync.yml          # GitHub Actions — cron 08h BRT
├── .env.local.example        # template de variáveis de ambiente
├── next.config.ts            # config Next.js
└── package.json              # dependências atualizadas
```

---

## Chunk 1: Project Setup — Next.js + Dependências

### Task 1: Inicializar projeto Next.js 15

**Files:**
- Create: `next.config.ts`
- Create: `package.json` (substituir)
- Create: `.env.local.example`
- Create: `app/layout.tsx`
- Create: `app/globals.css`

- [ ] **Step 1: Instalar Next.js 15 no projeto existente**

```bash
cd /Users/march-marketingarchtechture/marching-dashboard
# Remover config Vite (manter src/components/ui/ intacto)
rm -f vite.config.ts index.html tsconfig.node.json
# Instalar Next.js e dependências novas
npm install next@15 react@19 react-dom@19
npm install @supabase/supabase-js iron-session bcryptjs
npm install --save-dev vitest @vitejs/plugin-react jsdom @types/bcryptjs
```

- [ ] **Step 2: Criar `next.config.ts`**

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {}

export default nextConfig
```

- [ ] **Step 3: Criar `.env.local.example`**

```bash
# .env.local.example
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Segurança
TOKEN_ENCRYPTION_KEY=gere-com-openssl-rand-hex-32-aqui
SYNC_SECRET=gere-uma-senha-forte-aleatoria-aqui
ADMIN_PASSWORD=sua-senha-do-painel-admin

# iron-session (usar secrets DIFERENTES para cliente e admin)
SESSION_SECRET_CLIENT=gere-com-openssl-rand-hex-32-aqui
SESSION_SECRET_ADMIN=gere-com-openssl-rand-hex-32-diferente-do-client
```

- [ ] **Step 4: Criar `app/globals.css`** (copiar de `src/App.css` e adicionar):

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #05070F;
  --foreground: #E6EAF2;
}

body {
  background: #05070F;
  color: #E6EAF2;
  font-family: 'DM Sans', 'Segoe UI', sans-serif;
}
```

- [ ] **Step 5: Criar `app/layout.tsx`**

```typescript
// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MARCHING Analytics',
  description: 'Dashboard de Tráfego Pago',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 6: Atualizar `package.json` scripts**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 7: Verificar que Next.js sobe**

```bash
npm run dev
# Esperado: ready on http://localhost:3000
```

- [ ] **Step 8: Commit**

```bash
git add next.config.ts app/layout.tsx app/globals.css .env.local.example package.json
git commit -m "chore: scaffold Next.js 15 App Router, replace Vite"
```

---

### Task 2: Migrar componentes visuais de App.tsx

**Files:**
- Create: `components/dashboard/MarchingLogo.tsx`
- Create: `components/dashboard/MetricCard.tsx`
- Create: `components/dashboard/GrowthChart.tsx`
- Create: `components/dashboard/BarChartComp.tsx`
- Create: `components/dashboard/DonutChart.tsx`
- Create: `components/dashboard/DashboardShell.tsx`

- [ ] **Step 1: Criar `components/dashboard/MarchingLogo.tsx`**

Extrair o componente `MarchingLogo` de `src/App.tsx` para este arquivo. Adicionar `'use client'` no topo se usar hooks. Como é SVG puro, não precisa de `'use client'`.

```typescript
// components/dashboard/MarchingLogo.tsx
export function MarchingLogo({ size = 40 }: { size?: number }) {
  // colar exatamente o SVG que está em src/App.tsx — componente MarchingLogo
}
```

- [ ] **Step 2: Criar `components/dashboard/MetricCard.tsx`**

Extrair `MetricCard` e `Sparkline` de `src/App.tsx`:

```typescript
// components/dashboard/MetricCard.tsx
'use client'
import { TrendingUp, TrendingDown } from 'lucide-react'

function Sparkline({ data, color }: { data: number[]; color: string }) {
  // colar exatamente de src/App.tsx
}

export function MetricCard({ title, value, change, icon: Icon, color, sparkData, suffix = '' }: {
  title: string; value: string; change: number; icon: React.ElementType
  color: string; sparkData: number[]; suffix?: string
}) {
  // colar exatamente de src/App.tsx
}
```

- [ ] **Step 3: Criar `components/dashboard/GrowthChart.tsx`**

Extrair `GrowthChart` de `src/App.tsx`:

```typescript
// components/dashboard/GrowthChart.tsx
export function GrowthChart() {
  // colar exatamente de src/App.tsx
}
```

- [ ] **Step 4: Criar `components/dashboard/BarChartComp.tsx`**

```typescript
// components/dashboard/BarChartComp.tsx
export function BarChartComp({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  // colar exatamente de src/App.tsx
}
```

- [ ] **Step 5: Criar `components/dashboard/DonutChart.tsx`**

```typescript
// components/dashboard/DonutChart.tsx
export function DonutChart({ value, color }: { value: number; color: string }) {
  // colar exatamente de src/App.tsx
}
```

- [ ] **Step 6: Criar `components/dashboard/DashboardShell.tsx`**

Este é o layout completo — migrar o `return (...)` de `src/App.tsx`, substituindo os dados hardcoded por props:

```typescript
// components/dashboard/DashboardShell.tsx
'use client'
import { MarchingLogo } from './MarchingLogo'
import { MetricCard } from './MetricCard'
import { GrowthChart } from './GrowthChart'
import { BarChartComp } from './BarChartComp'
import { DonutChart } from './DonutChart'
import type { DashboardData } from '@/lib/types'

export function DashboardShell({ data, clientName, lastSync }: {
  data: DashboardData
  clientName: string
  lastSync: string | null
}) {
  // Layout completo de src/App.tsx
  // Substituir dados hardcoded por props vindas de `data`
  // Ex: value="712K" vira value={formatNumber(data.totals.impressoes)}
}
```

- [ ] **Step 7: Commit**

```bash
git add components/
git commit -m "feat: extract dashboard components from App.tsx"
```

---

## Chunk 2: Database Layer

### Task 3: Supabase — migration SQL e tipos TypeScript

**Files:**
- Create: `supabase/migrations/001_initial.sql`
- Create: `lib/types.ts`
- Create: `lib/supabase.ts`

- [ ] **Step 1: Criar `supabase/migrations/001_initial.sql`**

```sql
-- supabase/migrations/001_initial.sql

-- Tabela de clientes
CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  slug text NOT NULL UNIQUE,
  senha_hash text NOT NULL,
  meta_account_id text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

-- Tabela de tokens Meta (1:1 com clients)
CREATE TABLE meta_tokens (
  client_id uuid PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
  access_token_encrypted text NOT NULL,
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

-- Tabela de métricas diárias
CREATE TABLE daily_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  data date NOT NULL,
  impressoes bigint,
  cliques bigint,
  alcance bigint,
  investido numeric(12,2),
  leads integer,
  ctr numeric(6,4),
  cpc numeric(10,4),
  cpm numeric(10,4),
  cpa numeric(10,4),
  roas numeric(8,4),
  sincronizado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE(client_id, data)
);

-- Índice para queries de dashboard (busca por cliente + período)
CREATE INDEX idx_daily_metrics_client_data ON daily_metrics(client_id, data DESC);

-- Trigger para atualizar atualizado_em em clients
CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN NEW.atualizado_em = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clients_atualizado_em
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_atualizado_em();
```

- [ ] **Step 2: Instalar Supabase CLI e aplicar migration**

```bash
# Instalar CLI (se não tiver)
npm install -g supabase

# Inicializar config local (cria supabase/config.toml)
supabase init

# Linkar ao projeto remoto — pegar o project ref em Settings > General
supabase link --project-ref SEU_PROJECT_REF

# Aplicar migration no banco remoto
supabase db push
```

Verificar no Supabase dashboard → **Table Editor** que as 3 tabelas aparecem.

- [ ] **Step 3: Criar teste de smoke para `lib/supabase.ts`**

```typescript
// tests/lib/supabase.test.ts
import { describe, it, expect, afterEach } from 'vitest'

describe('createServerClient', () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
  })

  it('throws when env vars are missing', async () => {
    const { createServerClient } = await import('@/lib/supabase')
    expect(() => createServerClient()).toThrow('Supabase env vars ausentes')
  })
})
```

- [ ] **Step 5: Criar `lib/types.ts`**

```typescript
// lib/types.ts

export interface Client {
  id: string
  nome: string
  slug: string
  meta_account_id: string
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

export interface DailyMetric {
  data: string
  impressoes: number | null
  cliques: number | null
  alcance: number | null
  investido: number | null
  leads: number | null
  ctr: number | null
  cpc: number | null
  cpm: number | null
  cpa: number | null
  roas: number | null
}

// Totais agregados dos últimos 30 dias para os KPI cards
export interface DashboardTotals {
  impressoes: number
  cliques: number
  investido: number
  leads: number
  ctr: number      // média ponderada
  cpa: number      // média
  roas: number     // média
  roi_pct: number  // ((receita - investido) / investido) * 100 — calculado no frontend
}

export interface DashboardData {
  client: Client
  metrics: DailyMetric[]      // últimos 30 dias, ordenados por data ASC
  totals: DashboardTotals
  lastSync: string | null
}

// Payload do /api/sync
export interface SyncResult {
  success: Array<{ client_id: string; nome: string; days_synced: number }>
  errors: Array<{ client_id: string; nome: string; error: string }>
}
```

- [ ] **Step 7: Criar `lib/supabase.ts`**

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Client com service role — só usado no servidor (API routes, Server Components)
// NUNCA exposto ao browser
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!url || !key) throw new Error('Supabase env vars ausentes')
  return createClient(url, key)
}
```

- [ ] **Step 8: Configurar variáveis de ambiente locais**

Copiar `.env.local.example` para `.env.local` e preencher com as credenciais do projeto Supabase:
- `NEXT_PUBLIC_SUPABASE_URL` → Settings > API > Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Settings > API > anon key
- `SUPABASE_SERVICE_ROLE_KEY` → Settings > API > service_role key

- [ ] **Step 9: Rodar teste do supabase client**

```bash
npm test tests/lib/supabase.test.ts
# Esperado: PASS — 1 teste passando
```

- [ ] **Step 10: Commit**

```bash
git add supabase/ lib/types.ts lib/supabase.ts tests/lib/supabase.test.ts
git commit -m "feat: Supabase migration SQL, types, and server client"
```

---

## Chunk 3: Core Libraries — Crypto, Meta API, Session

### Task 4: lib/crypto.ts — criptografia AES-256-GCM

**Files:**
- Create: `lib/crypto.ts`
- Create: `tests/lib/crypto.test.ts`

- [ ] **Step 1: Escrever teste primeiro**

```typescript
// tests/lib/crypto.test.ts
import { describe, it, expect } from 'vitest'
import { encrypt, decrypt } from '@/lib/crypto'

describe('crypto', () => {
  it('encrypt then decrypt returns original text', () => {
    process.env.TOKEN_ENCRYPTION_KEY = 'a'.repeat(64) // 32 bytes hex
    const original = 'EAANWxRwIxBQ...token-exemplo'
    const encrypted = encrypt(original)
    expect(encrypted).not.toBe(original)
    expect(decrypt(encrypted)).toBe(original)
  })

  it('two encryptions of same text produce different ciphertexts (random IV)', () => {
    process.env.TOKEN_ENCRYPTION_KEY = 'a'.repeat(64)
    const text = 'same-token'
    expect(encrypt(text)).not.toBe(encrypt(text))
  })

  it('decrypt throws on tampered ciphertext', () => {
    process.env.TOKEN_ENCRYPTION_KEY = 'a'.repeat(64)
    const encrypted = encrypt('token')
    expect(() => decrypt(encrypted + 'x')).toThrow()
  })
})
```

- [ ] **Step 2: Rodar teste para verificar que falha**

```bash
npm test tests/lib/crypto.test.ts
# Esperado: FAIL — Cannot find module '@/lib/crypto'
```

- [ ] **Step 3: Criar `lib/crypto.ts`**

```typescript
// lib/crypto.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12   // 96 bits — padrão GCM
const TAG_LENGTH = 16  // 128 bits

function getKey(): Buffer {
  const hex = process.env.TOKEN_ENCRYPTION_KEY
  if (!hex || hex.length !== 64) {
    throw new Error('TOKEN_ENCRYPTION_KEY deve ter 64 chars hex (32 bytes)')
  }
  return Buffer.from(hex, 'hex')
}

// Formato salvo no banco: <iv_hex>:<ciphertext_hex>:<tag_hex>
export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [iv.toString('hex'), encrypted.toString('hex'), tag.toString('hex')].join(':')
}

export function decrypt(stored: string): string {
  const key = getKey()
  const parts = stored.split(':')
  if (parts.length !== 3) throw new Error('Formato de token inválido')
  const [ivHex, encryptedHex, tagHex] = parts
  const iv = Buffer.from(ivHex, 'hex')
  const encrypted = Buffer.from(encryptedHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}
```

- [ ] **Step 4: Rodar teste para verificar que passa**

```bash
npm test tests/lib/crypto.test.ts
# Esperado: PASS — 3 testes passando
```

- [ ] **Step 5: Commit**

```bash
git add lib/crypto.ts tests/lib/crypto.test.ts
git commit -m "feat: AES-256-GCM encrypt/decrypt for Meta tokens"
```

---

### Task 5: lib/meta-api.ts — cliente Meta Marketing API

**Files:**
- Create: `lib/meta-api.ts`
- Create: `tests/lib/meta-api.test.ts`

- [ ] **Step 1: Escrever testes de mapeamento**

```typescript
// tests/lib/meta-api.test.ts
import { describe, it, expect } from 'vitest'
import { mapMetaInsightRow } from '@/lib/meta-api'

describe('mapMetaInsightRow', () => {
  it('maps direct numeric fields correctly', () => {
    const row = {
      date_start: '2026-03-01',
      impressions: '10000',
      clicks: '400',
      reach: '8000',
      spend: '120.50',
      ctr: '4.0',
      cpc: '0.30',
      cpm: '12.05',
    }
    const result = mapMetaInsightRow(row)
    expect(result.data).toBe('2026-03-01')
    expect(result.impressoes).toBe(10000)
    expect(result.cliques).toBe(400)
    expect(result.investido).toBe(120.50)
    expect(result.ctr).toBe(4.0)
  })

  it('extracts leads from actions array', () => {
    const row = {
      date_start: '2026-03-01',
      impressions: '1000', clicks: '50', reach: '800', spend: '50',
      ctr: '5', cpc: '1', cpm: '50',
      actions: [
        { action_type: 'post_engagement', value: '200' },
        { action_type: 'lead', value: '15' },
      ],
    }
    expect(mapMetaInsightRow(row).leads).toBe(15)
  })

  it('returns null for leads when actions array is absent', () => {
    const row = { date_start: '2026-03-01', impressions: '1000', clicks: '50', reach: '800', spend: '50', ctr: '5', cpc: '1', cpm: '50' }
    expect(mapMetaInsightRow(row).leads).toBeNull()
  })

  it('returns null for roas when purchase_roas is absent', () => {
    const row = { date_start: '2026-03-01', impressions: '1000', clicks: '50', reach: '800', spend: '50', ctr: '5', cpc: '1', cpm: '50' }
    expect(mapMetaInsightRow(row).roas).toBeNull()
  })

  it('extracts roas from purchase_roas array', () => {
    const row = {
      date_start: '2026-03-01',
      impressions: '1000', clicks: '50', reach: '800', spend: '50', ctr: '5', cpc: '1', cpm: '50',
      purchase_roas: [{ action_type: 'omni_purchase', value: '3.8' }],
    }
    expect(mapMetaInsightRow(row).roas).toBe(3.8)
  })
})
```

- [ ] **Step 2: Rodar testes — verificar que falham**

```bash
npm test tests/lib/meta-api.test.ts
# Esperado: FAIL — Cannot find module '@/lib/meta-api'
```

- [ ] **Step 3: Criar `lib/meta-api.ts`**

```typescript
// lib/meta-api.ts
import type { DailyMetric } from './types'

const META_API_BASE = 'https://graph.facebook.com/v22.0'

const FIELDS = [
  'impressions', 'clicks', 'reach', 'spend',
  'actions', 'ctr', 'cpc', 'cpm',
  'cost_per_action_type', 'purchase_roas',
].join(',')

// Busca os dados dos últimos 30 dias com granularidade diária
export async function fetchMetaInsights(
  adAccountId: string,
  accessToken: string
): Promise<DailyMetric[]> {
  const url = new URL(`${META_API_BASE}/${adAccountId}/insights`)
  url.searchParams.set('fields', FIELDS)
  url.searchParams.set('date_preset', 'last_30_days')  // Meta API: usar 'last_30_days', não 'last_30d'
  url.searchParams.set('time_increment', '1')
  url.searchParams.set('level', 'account')
  url.searchParams.set('access_token', accessToken)

  const res = await fetch(url.toString())
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Meta API error: ${res.status} — ${JSON.stringify(err)}`)
  }

  const json = await res.json()
  if (!json.data || !Array.isArray(json.data)) {
    throw new Error('Meta API retornou formato inesperado')
  }

  return json.data.map(mapMetaInsightRow)
}

// Exportado separadamente para ser testado isoladamente (sem rede)
export function mapMetaInsightRow(row: Record<string, unknown>): DailyMetric {
  const num = (v: unknown) => (v != null ? parseFloat(v as string) : null)
  const int = (v: unknown) => (v != null ? parseInt(v as string, 10) : null)

  // Extrai valor de um array de action objects pelo action_type
  function findAction(
    arr: unknown,
    type: string
  ): number | null {
    if (!Array.isArray(arr)) return null
    const found = arr.find((a: Record<string, string>) => a.action_type === type)
    return found ? parseFloat(found.value) : null
  }

  return {
    data: row.date_start as string,
    impressoes: int(row.impressions),
    cliques: int(row.clicks),
    alcance: int(row.reach),
    investido: num(row.spend),
    leads: findAction(row.actions, 'lead'),
    ctr: num(row.ctr),
    cpc: num(row.cpc),
    cpm: num(row.cpm),
    cpa: findAction(row.cost_per_action_type, 'lead'),
    roas: Array.isArray(row.purchase_roas)
      ? parseFloat((row.purchase_roas as Array<{ value: string }>)[0]?.value ?? 'NaN') || null
      : null,
  }
}
```

- [ ] **Step 4: Rodar testes — verificar que passam**

```bash
npm test tests/lib/meta-api.test.ts
# Esperado: PASS — 5 testes passando
```

- [ ] **Step 5: Commit**

```bash
git add lib/meta-api.ts tests/lib/meta-api.test.ts
git commit -m "feat: Meta Marketing API v22 client with field mapping"
```

---

### Task 6: lib/session.ts — iron-session

**Files:**
- Create: `lib/session.ts`

- [ ] **Step 1: Criar `lib/session.ts`**

```typescript
// lib/session.ts
import type { IronSessionOptions } from 'iron-session'

// IMPORTANTE: usar secrets DIFERENTES para cliente e admin
// SESSION_SECRET_CLIENT e SESSION_SECRET_ADMIN no .env.local
// Isso garante que um cookie admin não pode ser reutilizado como cliente

// Sessão do cliente (dashboard)
export const clientSessionOptions: IronSessionOptions = {
  password: process.env.SESSION_SECRET_CLIENT!,
  cookieName: 'marching_client_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 horas
  },
}

// Sessão do admin (separada — secret E cookie name diferentes)
export const adminSessionOptions: IronSessionOptions = {
  password: process.env.SESSION_SECRET_ADMIN!,
  cookieName: 'marching_admin_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 horas
  },
}

// Tipagem dos dados armazenados na sessão
declare module 'iron-session' {
  interface IronSessionData {
    clientSlug?: string    // slug do cliente logado
    isAdmin?: boolean      // true se sessão admin
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/session.ts
git commit -m "feat: iron-session config for client and admin sessions"
```

---

## Chunk 4: Sync API Endpoint

### Task 7: /api/sync — endpoint de sincronização

**Files:**
- Create: `app/api/sync/route.ts`
- Create: `tests/api/sync.test.ts`

- [ ] **Step 1: Escrever teste de autorização**

```typescript
// tests/api/sync.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock das dependências de banco/API antes de importar a route
vi.mock('@/lib/supabase', () => ({ createServerClient: vi.fn() }))
vi.mock('@/lib/crypto', () => ({ decrypt: vi.fn((v) => v) }))
vi.mock('@/lib/meta-api', () => ({ fetchMetaInsights: vi.fn().mockResolvedValue([]) }))

// Helper para simular requisição
function makeRequest(authHeader?: string, params?: Record<string, string>) {
  const url = new URL('http://localhost/api/sync')
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return new Request(url, {
    method: 'POST',
    headers: authHeader ? { Authorization: authHeader } : {},
  })
}

describe('POST /api/sync authorization', () => {
  beforeEach(() => {
    process.env.SYNC_SECRET = 'test-secret-123'
  })

  it('returns 401 when Authorization header is absent', async () => {
    const { POST } = await import('@/app/api/sync/route')
    const res = await POST(makeRequest())
    expect(res.status).toBe(401)
  })

  it('returns 401 when secret is wrong', async () => {
    const { POST } = await import('@/app/api/sync/route')
    const res = await POST(makeRequest('Bearer wrong-secret'))
    expect(res.status).toBe(401)
  })

  it('returns 200 when secret is correct (no active clients)', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    }
    const { createServerClient } = await import('@/lib/supabase')
    vi.mocked(createServerClient).mockReturnValue(mockSupabase as never)

    const { POST } = await import('@/app/api/sync/route')
    const res = await POST(makeRequest('Bearer test-secret-123'))
    expect(res.status).toBe(200)
  })
})
```

- [ ] **Step 2: Rodar teste — verificar que falha**

```bash
npm test tests/api/sync.test.ts
# Esperado: FAIL — Cannot find module
```

- [ ] **Step 3: Criar `app/api/sync/route.ts`**

```typescript
// app/api/sync/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { decrypt } from '@/lib/crypto'
import { fetchMetaInsights } from '@/lib/meta-api'
import type { SyncResult } from '@/lib/types'

export async function POST(req: NextRequest) {
  // 1. Validar autorização
  const authHeader = req.headers.get('authorization')
  const expectedSecret = process.env.SYNC_SECRET
  if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient()
  const clientIdParam = req.nextUrl.searchParams.get('client_id')

  // 2. Buscar clientes a sincronizar
  let query = supabase
    .from('clients')
    .select('id, nome, meta_account_id')
    .eq('ativo', true)

  if (clientIdParam) {
    query = query.eq('id', clientIdParam)
  }

  const { data: clients, error: clientsError } = await query
  if (clientsError) {
    return NextResponse.json({ error: clientsError.message }, { status: 500 })
  }

  const result: SyncResult = { success: [], errors: [] }

  // 3. Sincronizar cada cliente
  for (const client of clients ?? []) {
    try {
      // Buscar token criptografado
      const { data: tokenRow, error: tokenError } = await supabase
        .from('meta_tokens')
        .select('access_token_encrypted')
        .eq('client_id', client.id)
        .single()

      // Guard: cliente sem token → log erro e continua (não aborta o batch)
      if (tokenError || !tokenRow || !tokenRow.access_token_encrypted) {
        result.errors.push({
          client_id: client.id,
          nome: client.nome,
          error: 'Token Meta não configurado para este cliente',
        })
        continue
      }

      const accessToken = decrypt(tokenRow.access_token_encrypted)
      const metrics = await fetchMetaInsights(client.meta_account_id, accessToken)

      if (metrics.length === 0) {
        result.success.push({ client_id: client.id, nome: client.nome, days_synced: 0 })
        continue
      }

      // 4. Upsert métricas (UNIQUE client_id + data garante sem duplicatas)
      const rows = metrics.map((m) => ({
        client_id: client.id,
        data: m.data,
        impressoes: m.impressoes,
        cliques: m.cliques,
        alcance: m.alcance,
        investido: m.investido,
        leads: m.leads,
        ctr: m.ctr,
        cpc: m.cpc,
        cpm: m.cpm,
        cpa: m.cpa,
        roas: m.roas,
        sincronizado_em: new Date().toISOString(),
      }))

      const { error: upsertError } = await supabase
        .from('daily_metrics')
        .upsert(rows, { onConflict: 'client_id,data' })

      if (upsertError) throw new Error(upsertError.message)

      result.success.push({
        client_id: client.id,
        nome: client.nome,
        days_synced: metrics.length,
      })
    } catch (err) {
      result.errors.push({
        client_id: client.id,
        nome: client.nome,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }

  return NextResponse.json(result, { status: 200 })
}
```

- [ ] **Step 4: Rodar testes — verificar que passam**

```bash
npm test tests/api/sync.test.ts
# Esperado: PASS — 3 testes passando
```

- [ ] **Step 5: Testar manualmente o endpoint**

```bash
# Terminal 1: subir dev server
npm run dev

# Terminal 2: testar sem auth
curl -X POST http://localhost:3000/api/sync
# Esperado: {"error":"Unauthorized"} com status 401

# Testar com auth correto (preencher SYNC_SECRET do .env.local)
curl -X POST http://localhost:3000/api/sync \
  -H "Authorization: Bearer SEU_SYNC_SECRET"
# Esperado: {"success":[],"errors":[]} (sem clientes cadastrados ainda)
```

- [ ] **Step 6: Commit**

```bash
git add app/api/sync/ tests/api/
git commit -m "feat: POST /api/sync — Meta API sync with authorization"
```

---

## Chunk 5: Auth Flow

### Task 8: API routes de autenticação

**Files:**
- Create: `app/api/auth/client/route.ts`
- Create: `app/api/auth/admin/route.ts`

- [ ] **Step 1: Criar `app/api/auth/client/route.ts`**

```typescript
// app/api/auth/client/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import bcrypt from 'bcryptjs'
import { createServerClient } from '@/lib/supabase'
import { clientSessionOptions } from '@/lib/session'

export async function POST(req: NextRequest) {
  const { slug, senha } = await req.json()

  if (!slug || !senha) {
    return NextResponse.json({ error: 'Slug e senha obrigatórios' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data: client, error } = await supabase
    .from('clients')
    .select('slug, senha_hash, ativo')
    .eq('slug', slug)
    .single()

  if (error || !client || !client.ativo) {
    return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
  }

  const senhaCorreta = await bcrypt.compare(senha, client.senha_hash)
  if (!senhaCorreta) {
    return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  const session = await getIronSession(req, res, clientSessionOptions)
  session.clientSlug = slug
  await session.save()

  return res
}
```

- [ ] **Step 2: Criar `app/api/auth/admin/route.ts`**

```typescript
// app/api/auth/admin/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { timingSafeEqual, createHash } from 'crypto'
import { adminSessionOptions } from '@/lib/session'

export async function POST(req: NextRequest) {
  const { senha } = await req.json()
  const adminPassword = process.env.ADMIN_PASSWORD

  // timingSafeEqual previne timing attacks na comparação de senhas
  // Ambos os buffers precisam ter o mesmo tamanho — usar hash para normalizar
  const senhaCorreta = adminPassword
    ? timingSafeEqual(
        createHash('sha256').update(senha ?? '').digest(),
        createHash('sha256').update(adminPassword).digest()
      )
    : false

  if (!senhaCorreta) {
    return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  const session = await getIronSession(req, res, adminSessionOptions)
  session.isAdmin = true
  await session.save()

  return res
}
```

- [ ] **Step 3: Criar `app/api/clients/route.ts`**

```typescript
// app/api/clients/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import bcrypt from 'bcryptjs'
import { createServerClient } from '@/lib/supabase'
import { encrypt } from '@/lib/crypto'
import { adminSessionOptions } from '@/lib/session'

// Middleware de auth admin reutilizável
async function requireAdmin(req: NextRequest) {
  const session = await getIronSession(req, new NextResponse(), adminSessionOptions)
  return session.isAdmin === true
}

// GET /api/clients — lista todos os clientes com última sync
export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('clients')
    .select(`
      id, nome, slug, meta_account_id, ativo, criado_em, atualizado_em,
      daily_metrics(sincronizado_em)
    `)
    .order('criado_em', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/clients — criar novo cliente
export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { nome, slug, senha, meta_account_id, access_token } = await req.json()

  if (!nome || !slug || !senha || !meta_account_id || !access_token) {
    return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
  }

  const supabase = createServerClient()
  const senha_hash = await bcrypt.hash(senha, 12)
  const access_token_encrypted = encrypt(access_token)

  const { data: client, error: clientError } = await supabase
    .from('clients')
    .insert({ nome, slug, senha_hash, meta_account_id })
    .select('id')
    .single()

  if (clientError) return NextResponse.json({ error: clientError.message }, { status: 400 })

  const { error: tokenError } = await supabase
    .from('meta_tokens')
    .insert({ client_id: client.id, access_token_encrypted })

  if (tokenError) return NextResponse.json({ error: tokenError.message }, { status: 500 })

  return NextResponse.json({ ok: true, id: client.id }, { status: 201 })
}

// PATCH /api/clients — ativar/desativar cliente
export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id, ativo } = await req.json()
  const supabase = createServerClient()
  const { error } = await supabase.from('clients').update({ ativo }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 4: Commit**

```bash
git add app/api/auth/ app/api/clients/
git commit -m "feat: auth API routes for client login, admin login, client CRUD"
```

---

### Task 9: Páginas de login

**Files:**
- Create: `app/[slug]/login/page.tsx`
- Create: `app/admin/login/page.tsx`

- [ ] **Step 1: Criar `app/[slug]/login/page.tsx`**

```typescript
// app/[slug]/login/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MarchingLogo } from '@/components/dashboard/MarchingLogo'

export default function ClientLogin({ params }: { params: { slug: string } }) {
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')
    const res = await fetch('/api/auth/client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: params.slug, senha }),
    })
    if (res.ok) {
      router.push(`/${params.slug}`)
    } else {
      const data = await res.json()
      setErro(data.error || 'Erro ao fazer login')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#05070F] flex items-center justify-center">
      <div className="w-full max-w-sm p-8 rounded-2xl border border-[#1a2040] bg-[#0B0F1F]">
        <div className="flex items-center gap-3 mb-8">
          <MarchingLogo size={40} />
          <div>
            <div className="font-bold text-[#E6EAF2]">MARCHING</div>
            <div className="text-xs text-[#5C6475]">Relatório de Tráfego</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-[#8A94A6] mb-1 block">Senha de acesso</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full bg-[#05070F] border border-[#1a2040] rounded-lg px-3 py-2 text-sm text-[#E6EAF2] focus:outline-none focus:border-[#6C3BFF]"
              placeholder="••••••••"
              required
            />
          </div>
          {erro && <p className="text-xs text-red-400">{erro}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #6C3BFF, #00D1C7)' }}
          >
            {loading ? 'Entrando...' : 'Acessar relatório'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Criar `app/admin/login/page.tsx`**

Mesma estrutura de `ClientLogin`, adaptada para admin:
- Título: "Painel Admin"
- Chama `POST /api/auth/admin` com `{ senha }`
- Redireciona para `/admin` ao logar

- [ ] **Step 3: Commit**

```bash
git add app/
git commit -m "feat: login pages for client and admin"
```

---

## Chunk 6: Dashboard e Admin Pages

### Task 10: /[slug] — página do dashboard

**Files:**
- Create: `app/[slug]/page.tsx`

- [ ] **Step 1: Criar `app/[slug]/page.tsx`**

```typescript
// app/[slug]/page.tsx
import { redirect, notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import { createServerClient } from '@/lib/supabase'
import { clientSessionOptions } from '@/lib/session'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import type { DashboardData, DashboardTotals } from '@/lib/types'

export default async function ClientDashboard({ params }: { params: { slug: string } }) {
  const { slug } = params

  // 1. Verificar sessão
  // Next.js 15: cookies() é assíncrono — OBRIGATÓRIO awaitar
  const cookieStore = await cookies()
  const session = await getIronSession(cookieStore, clientSessionOptions)
  if (session.clientSlug !== slug) {
    redirect(`/${slug}/login`)
  }

  const supabase = createServerClient()

  // 2. Buscar dados do cliente
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id, nome, slug, meta_account_id, ativo, criado_em, atualizado_em')
    .eq('slug', slug)
    .eq('ativo', true)
    .single()

  if (clientError || !client) notFound()

  // 3. Buscar métricas dos últimos 30 dias
  const { data: metrics } = await supabase
    .from('daily_metrics')
    .select('*')
    .eq('client_id', client.id)
    .order('data', { ascending: true })
    .limit(30)

  // 4. Calcular totais para KPI cards
  const totals = calcTotals(metrics ?? [])

  // 5. Última sync
  const lastSync = metrics && metrics.length > 0
    ? metrics[metrics.length - 1].sincronizado_em
    : null

  const dashboardData: DashboardData = {
    client,
    metrics: metrics ?? [],
    totals,
    lastSync,
  }

  return <DashboardShell data={dashboardData} clientName={client.nome} lastSync={lastSync} />
}

function calcTotals(metrics: Record<string, number | null>[]): DashboardTotals {
  if (metrics.length === 0) {
    return { impressoes: 0, cliques: 0, investido: 0, leads: 0, ctr: 0, cpa: 0, roas: 0, roi_pct: 0 }
  }
  const sum = (key: string) => metrics.reduce((acc, m) => acc + (Number(m[key]) || 0), 0)
  const avg = (key: string) => {
    const vals = metrics.filter((m) => m[key] != null)
    return vals.length ? vals.reduce((a, m) => a + Number(m[key]), 0) / vals.length : 0
  }
  const investido = sum('investido')
  return {
    impressoes: sum('impressoes'),
    cliques: sum('cliques'),
    investido,
    leads: sum('leads'),
    ctr: avg('ctr'),
    cpa: avg('cpa'),
    roas: avg('roas'),
    roi_pct: investido > 0 ? ((sum('investido') * avg('roas') - investido) / investido) * 100 : 0,
  }
}
```

- [ ] **Step 2: Atualizar `DashboardShell` para usar dados reais**

Em `components/dashboard/DashboardShell.tsx`, substituir todos os valores hardcoded pelas props:
- `data.totals.impressoes` em vez de `"712K"`
- `data.totals.cliques` em vez de `"28.4K"`
- `data.metrics` passado para `GrowthChart` e `BarChartComp`
- Estado vazio: se `data.metrics.length === 0`, exibir mensagem "Dados serão atualizados às 08h de amanhã"

- [ ] **Step 3: Commit**

```bash
git add app/\[slug\]/ components/dashboard/DashboardShell.tsx
git commit -m "feat: dynamic client dashboard page with real Supabase data"
```

---

### Task 11: /admin — painel de gestão

**Files:**
- Create: `app/admin/page.tsx`

- [ ] **Step 1: Criar `app/admin/page.tsx`**

```typescript
// app/admin/page.tsx
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import { createServerClient } from '@/lib/supabase'
import { adminSessionOptions } from '@/lib/session'
import { AdminShell } from '@/components/admin/AdminShell'

export default async function AdminPage() {
  // Next.js 15: cookies() é assíncrono
  const cookieStore = await cookies()
  const session = await getIronSession(cookieStore, adminSessionOptions)
  if (!session.isAdmin) redirect('/admin/login')

  const supabase = createServerClient()
  const { data: clients } = await supabase
    .from('clients')
    .select(`id, nome, slug, meta_account_id, ativo, criado_em, atualizado_em,
      daily_metrics(sincronizado_em)`)
    .order('criado_em', { ascending: true })

  // NUNCA passar SYNC_SECRET como prop para Client Component — seria exposto no bundle do browser
  // O botão "Sincronizar agora" chama /api/admin/trigger-sync (rota proxy server-side)
  return <AdminShell clients={clients ?? []} />
}
```

- [ ] **Step 2: Criar `components/admin/AdminShell.tsx`**

Interface minimalista com estilo MARCHING dark:

```typescript
// components/admin/AdminShell.tsx
'use client'
import { useState } from 'react'
import { MarchingLogo } from '@/components/dashboard/MarchingLogo'

// Lista de clientes com ativo/inativo, última sync, link da página
// Formulário "Novo Cliente": Nome, Slug, Senha, Meta Account ID, Token
// Botão "Sincronizar agora" por cliente
// Todos os POSTs/PATCHs vão para /api/clients e /api/sync
```

O componente deve ter:
- Tabela de clientes com colunas: Nome | Slug | Última Sync | Status | Ações
- Botão "Novo Cliente" → abre formulário inline
- Botão "Sincronizar agora" → `POST /api/admin/trigger-sync?client_id={id}` (rota proxy — SYNC_SECRET nunca vai ao browser)
- Botão toggle ativo/inativo → `PATCH /api/clients`

- [ ] **Step 3: Criar `app/api/admin/trigger-sync/route.ts`** (proxy seguro para o botão "Sincronizar agora")

```typescript
// app/api/admin/trigger-sync/route.ts
// Esta rota existe para que o SYNC_SECRET nunca chegue ao browser.
// AdminShell chama /api/admin/trigger-sync, esta rota adiciona o Authorization server-side.
import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { adminSessionOptions } from '@/lib/session'

export async function POST(req: NextRequest) {
  // 1. Verificar que é admin logado
  const cookieStore = await cookies()
  const session = await getIronSession(cookieStore, adminSessionOptions)
  if (!session.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Encaminhar para /api/sync com SYNC_SECRET (server-side — nunca exposto ao browser)
  const clientId = req.nextUrl.searchParams.get('client_id')
  const syncUrl = new URL('/api/sync', req.nextUrl.origin)
  if (clientId) syncUrl.searchParams.set('client_id', clientId)

  const syncRes = await fetch(syncUrl.toString(), {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.SYNC_SECRET}` },
  })

  const body = await syncRes.json()
  return NextResponse.json(body, { status: syncRes.status })
}
```

- [ ] **Step 4: Commit**

```bash
git add app/admin/ app/api/admin/ components/admin/
git commit -m "feat: admin panel with client management and secure sync trigger proxy"
```

---

## Chunk 7: Deploy

### Task 12: GitHub Actions — cron diário

**Files:**
- Create: `.github/workflows/sync.yml`

- [ ] **Step 1: Criar `.github/workflows/sync.yml`**

```yaml
# .github/workflows/sync.yml
name: Daily Meta Ads Sync

on:
  schedule:
    - cron: '0 11 * * *'  # 08:00 BRT (UTC-3) = 11:00 UTC
  workflow_dispatch:       # Permite trigger manual pelo GitHub UI

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger sync endpoint
        run: |
          RESPONSE=$(curl -s -o /tmp/sync_response.json -w "%{http_code}" \
            -X POST \
            -H "Authorization: Bearer ${{ secrets.SYNC_SECRET }}" \
            https://relatorios.marching.com.br/api/sync)

          echo "HTTP Status: $RESPONSE"
          echo "Response body:"
          cat /tmp/sync_response.json

          if [ "$RESPONSE" != "200" ]; then
            echo "❌ Sync failed with status $RESPONSE"
            exit 1
          fi

          echo "✅ Sync completed successfully"
```

- [ ] **Step 2: Adicionar `SYNC_SECRET` no GitHub Secrets**

No GitHub: Settings → Secrets and variables → Actions → New repository secret:
- Name: `SYNC_SECRET`
- Value: o mesmo valor do `.env.local`

- [ ] **Step 3: Commit e push**

```bash
git add .github/
git commit -m "feat: GitHub Actions daily sync cron at 08:00 BRT"
git push origin main
```

- [ ] **Step 4: Testar trigger manual**

No GitHub, acessar Actions → "Daily Meta Ads Sync" → "Run workflow". Verificar que o job roda e retorna status 200.

---

### Task 13: Vercel + DNS

- [ ] **Step 1: Criar projeto na Vercel**

1. Acessar [vercel.com](https://vercel.com) → New Project
2. Importar repositório do GitHub
3. Framework preset: **Next.js** (detectado automaticamente)
4. Clique em Deploy

- [ ] **Step 2: Configurar variáveis de ambiente na Vercel**

Em Settings → Environment Variables, adicionar todas as variáveis do `.env.local.example`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TOKEN_ENCRYPTION_KEY`
- `SYNC_SECRET`
- `ADMIN_PASSWORD`
- `SESSION_SECRET_CLIENT`
- `SESSION_SECRET_ADMIN`

- [ ] **Step 3: Adicionar domínio personalizado na Vercel**

Em Settings → Domains → Add: `relatorios.marching.com.br`

A Vercel vai mostrar o valor CNAME a configurar.

- [ ] **Step 4: Configurar DNS na Hostinger**

1. Acessar Hostinger → Domains → `marching.com.br` → DNS Zone
2. Adicionar registro:
   - **Tipo:** CNAME
   - **Nome:** `relatorios`
   - **Valor:** `cname.vercel-dns.com`
   - **TTL:** 3600
3. Salvar — propagação leva até 24h
4. Verificar na Vercel quando o domínio ficar verde (ativo)

- [ ] **Step 5: Verificar deploy completo**

```bash
# Testar endpoint de sync em produção
curl -X POST https://relatorios.marching.com.br/api/sync \
  -H "Authorization: Bearer SEU_SYNC_SECRET"
# Esperado: {"success":[],"errors":[]}

# Testar página de login (deve carregar sem erro)
curl -I https://relatorios.marching.com.br/marching/login
# Esperado: HTTP/2 200
```

- [ ] **Step 6: Adicionar cliente MARCHING pelo painel admin**

1. Acessar `https://relatorios.marching.com.br/admin`
2. Fazer login com `ADMIN_PASSWORD`
3. Criar cliente "MARCHING" com slug `marching`, senha, Account ID e token
4. Clicar "Sincronizar agora"
5. Acessar `https://relatorios.marching.com.br/marching` e fazer login
6. Confirmar que os dados reais da Meta aparecem

---

## Checklist Final

- [ ] `npm test` — todos os testes passando
- [ ] `npm run build` — build sem erros de TypeScript
- [ ] Dashboard `/marching` carrega com dados reais da Meta
- [ ] Login com senha errada retorna erro
- [ ] Página de slug inexistente retorna 404
- [ ] `/api/sync` sem Authorization retorna 401
- [ ] GitHub Actions executa sem erro (workflow_dispatch)
- [ ] CNAME `relatorios.marching.com.br` resolvendo corretamente
- [ ] Emails `@marching.com.br` continuam funcionando (verificar MX records intactos)

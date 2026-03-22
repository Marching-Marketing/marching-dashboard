# Design Spec — Dashboard de Relatórios Meta Ads (MARCHING)

**Data:** 2026-03-22
**Status:** Aprovado

---

## Contexto

O projeto atual (`marching-dashboard`) é um frontend React + Vite com dados estáticos. O objetivo é transformá-lo em um sistema real conectado à Meta Marketing API, com atualização diária automática, multi-cliente e hospedado 24/7 no domínio próprio da MARCHING.

---

## Requisitos

### Funcionais
- Conectar à Meta Marketing API via System User token (não expira)
- Sincronizar dados de cada cliente automaticamente todo dia às 08h (horário Brasília)
- Exibir dashboard individual por cliente via URL única com senha de acesso
- Painel `/admin` para adicionar e gerenciar clientes sem tocar em código
- Suporte a múltiplos clientes (começa com 2: MARCHING + Lais Rios)

### Não-funcionais
- Custo: gratuito para começar (Vercel free + Supabase free + GitHub Actions free)
- Disponibilidade: 24/7
- Domínio: `relatorios.marching.com.br` (CNAME na Hostinger, sem afetar e-mails)
- Banco de dados gerenciado via interface visual (Supabase dashboard)
- Se a Meta API falhar, o dashboard mantém dados do dia anterior sem quebrar

---

## Arquitetura

```
relatorios.marching.com.br (CNAME → Vercel)
│
├── Next.js App (Vercel — grátis)
│   ├── /[slug]         → Dashboard do cliente (protegido por senha)
│   ├── /admin          → Painel de gestão (protegido por senha master)
│   └── /api/sync       → Endpoint chamado pelo cron
│
├── Supabase (banco gerenciado — grátis até 500MB)
│   ├── clients         → Dados e configurações por cliente
│   ├── meta_tokens     → System User tokens (criptografados)
│   └── daily_metrics   → Métricas diárias puxadas da Meta API
│
└── GitHub Actions (cron — grátis)
    └── Todo dia às 08h → chama /api/sync → atualiza Supabase
```

---

## Banco de Dados (Supabase)

### Tabela `clients`
| Campo | Tipo | Descrição |
|---|---|---|
| id | uuid | Chave primária |
| nome | text | Nome de exibição (ex: "Lais Rios") |
| slug | text | URL slug único (ex: "lais-rios") — UNIQUE |
| senha_hash | text | Senha de acesso hasheada (bcrypt) |
| meta_account_id | text | ID da conta de anúncios (ex: act_XXXXX) |
| ativo | boolean | Liga/desliga o cliente |
| criado_em | timestamp | Data de criação |
| atualizado_em | timestamp | Última modificação (auditoria no admin) |

### Tabela `meta_tokens`
**Relação:** 1:1 com `clients` (um token por cliente). `client_id` é a chave primária da tabela.
**Criptografia:** O token é criptografado com AES-256-GCM antes de ser salvo. A chave de criptografia fica em variável de ambiente `TOKEN_ENCRYPTION_KEY` no Vercel (nunca no banco). A descriptografia ocorre apenas no servidor Next.js no momento da sync — nunca exposta ao frontend.

| Campo | Tipo | Descrição |
|---|---|---|
| client_id | uuid | PK + FK → clients.id (relação 1:1) |
| access_token_encrypted | text | System User token criptografado (AES-256-GCM) |
| atualizado_em | timestamp | Última vez que foi salvo |

### Tabela `daily_metrics`
**Granularidade:** 1 linha por cliente por dia (dados diários, não agregados do período).
**Constraint de unicidade:** `UNIQUE(client_id, data)` — garante que o UPSERT da sync nunca duplique registros.

| Campo | Tipo | Descrição |
|---|---|---|
| id | uuid | Chave primária |
| client_id | uuid | FK → clients.id |
| data | date | Data da métrica (1 linha por dia) |
| impressoes | bigint | Total de impressões do dia |
| cliques | bigint | Total de cliques do dia |
| alcance | bigint | Alcance único do dia |
| investido | numeric | Valor investido no dia (R$) |
| leads | integer | Total de leads do dia |
| ctr | numeric | Click-through rate (%) — retornado diretamente pela API |
| cpc | numeric | Custo por clique (R$) — retornado diretamente pela API |
| cpm | numeric | Custo por mil impressões (R$) — retornado pela API |
| cpa | numeric | Custo por aquisição (R$) — extraído de `cost_per_action_type` (tipo: `lead`) |
| roas | numeric | ROAS — extraído de `purchase_roas` (valor numérico do array) |
| sincronizado_em | timestamp | Timestamp da última sync bem-sucedida |

---

## Páginas

### `/[slug]` — Dashboard do Cliente
- Rota pública com proteção por senha
- **Sessão:** iron-session com cookie `HttpOnly; Secure; SameSite=Lax`, expiração de 24h
- Se cookie expirar: redirect silencioso para `/[slug]/login`
- Exibe dados dos últimos 30 dias (série temporal dia a dia, gráficos + KPIs)
- Layout idêntico ao dashboard atual (dark, neon, MARCHING branding)
- Mostra timestamp "Última atualização: hoje às 08h"
- Estado vazio (cliente recém-adicionado sem sync ainda): exibe mensagem "Dados serão atualizados às 08h de amanhã"
- Se slug não existir → 404

### `/admin` — Painel de Gestão
- Protegido por senha master (`ADMIN_PASSWORD` em variável de ambiente no Vercel)
- **Sessão:** iron-session separada da sessão dos clientes, expiração de 8h
- Sem rate limiting de login (admin é uso interno; acesso por URL obscura)
- Lista todos os clientes com status ativo/inativo e timestamp da última sync
- Formulário para adicionar novo cliente: Nome, Slug, Senha, Meta Account ID, System User Token
- Botão "Sincronizar agora" por cliente: chama `POST /api/sync?client_id={id}` com o `SYNC_SECRET`

### `/api/sync` — Endpoint de Sincronização
- **Autorização:** valida header `Authorization: Bearer {SYNC_SECRET}` contra `process.env.SYNC_SECRET`
- Se header ausente ou inválido → retorna 401 imediatamente
- Aceita parâmetro opcional `?client_id={id}` para sync individual (usado pelo botão no admin)
- Sem parâmetro → sincroniza todos os clientes ativos (usado pelo cron)
- Para cada cliente:
  1. Descriptografa token (AES-256-GCM com `TOKEN_ENCRYPTION_KEY`)
  2. Chama Meta API com `time_increment=1` e `date_preset=last_30d` (retorna 30 linhas diárias)
  3. Fuso: dados no fuso da conta Meta (`America/Sao_Paulo` para contas BR) — armazenados como UTC no Supabase
  4. Upsert em `daily_metrics` usando constraint `UNIQUE(client_id, data)`
  5. Atualiza `sincronizado_em`
- Retorna JSON `{ success: [], errors: [] }` com resultado por cliente
- Em caso de erro na Meta API: mantém dados existentes, loga o erro no retorno JSON

---

## Meta Marketing API

**Versão:** v22.0
**Autenticação:** System User token (permanent — não expira)
**Endpoint principal:** `GET /{ad_account_id}/insights`

**Parâmetros da chamada:**
```
fields=impressions,clicks,reach,spend,actions,ctr,cpc,cpm,cost_per_action_type,purchase_roas
date_preset=last_30d
time_increment=1        ← retorna 1 linha por dia (não agregado)
level=account
```

**Mapeamento API → banco:**
| Campo API | Campo no banco | Observação |
|---|---|---|
| `impressions` | `impressoes` | Número direto |
| `clicks` | `cliques` | Número direto |
| `reach` | `alcance` | Número direto |
| `spend` | `investido` | Número direto (R$) |
| `actions[type=lead].value` | `leads` | Extraído do array de actions |
| `ctr` | `ctr` | Número direto (%) |
| `cpc` | `cpc` | Número direto (R$) |
| `cpm` | `cpm` | Número direto (R$) |
| `cost_per_action_type[type=lead].value` | `cpa` | Extraído do array |
| `purchase_roas[0].value` | `roas` | Extraído do array |

**Período:** `date_preset=last_30d` com `time_increment=1` — intencional em cada sync para auto-corrigir conversões reportadas com atraso pela Meta.
**Nível:** account (visão consolidada de todas as campanhas)

**Campos ausentes (zero conversões):** Se `actions`, `cost_per_action_type` ou `purchase_roas` estiverem ausentes na resposta da API (conta sem conversões no dia), gravar `null` nos campos `leads`, `cpa` e `roas` — nunca gravar 0, pois 0 e "sem dado" são semanticamente diferentes.

---

## Sincronização Diária (GitHub Actions)

```yaml
# .github/workflows/sync.yml
schedule:
  - cron: '0 11 * * *'  # 08:00 BRT = 11:00 UTC
```

- Chama `POST https://relatorios.marching.com.br/api/sync`
- Header de autorização: `Authorization: Bearer SYNC_SECRET`
- `SYNC_SECRET` fica em GitHub Secrets (não exposto no código)
- Em caso de falha: GitHub envia e-mail de notificação automaticamente

---

## DNS / Domínio (Hostinger)

Único registro a adicionar no painel Hostinger:
```
Tipo: CNAME
Nome: relatorios
Valor: cname.vercel-dns.com
TTL: 3600
```

Registros MX (e-mail) **não são alterados** — e-mails continuam funcionando normalmente.

---

## Setup de Novo Cliente (Processo Operacional)

1. Acessar `relatorios.marching.com.br/admin`
2. Clicar "Novo Cliente"
3. Preencher: Nome, Slug, Senha, Meta Account ID, System User Token
4. Salvar — página já disponível em `relatorios.marching.com.br/[slug]`
5. Enviar link + senha para o cliente

**Tempo estimado:** menos de 2 minutos por cliente.

---

## Migração do Projeto Atual

O projeto atual (React + Vite) será migrado para Next.js:
- Componentes visuais em `src/components/ui/` são 100% compatíveis — reaproveitados sem alteração
- `src/App.tsx` será desmontado: a lógica de dados vai para Server Components Next.js e os componentes visuais são extraídos para `components/`
- Roteamento Vite (se houver) é substituído pelo App Router do Next.js
- Adiciona-se: `app/`, `app/api/` (estrutura Next.js App Router)
- Remove-se: configuração Vite, bundle script atual (`bundle-artifact.sh`)
- Tailwind CSS e shadcn/ui já instalados — configuração mantida

---

## Tecnologias

| Camada | Tecnologia | Plano |
|---|---|---|
| Frontend + Backend | Next.js 15 (App Router) | — |
| Hospedagem | Vercel | Grátis |
| Banco de dados | Supabase (PostgreSQL) | Grátis (500MB) |
| Cron scheduler | GitHub Actions | Grátis |
| Domínio | relatorios.marching.com.br | Já existente |
| DNS | Hostinger | Já existente |
| Meta API | Meta Marketing API v22 | Grátis (uso) |
| Sessão | iron-session | — |
| Criptografia tokens | AES-256-GCM (Node.js crypto) | — |

**Custo total mensal: R$ 0** para a escala atual.

---

## Fora do Escopo

- App mobile
- Notificações por WhatsApp/e-mail quando métricas caem
- Integração com Google Ads, TikTok Ads (pode ser adicionado no futuro)
- Relatórios em PDF (pode ser adicionado no futuro)
- OAuth flow automático para conectar contas Meta (System User manual é suficiente)

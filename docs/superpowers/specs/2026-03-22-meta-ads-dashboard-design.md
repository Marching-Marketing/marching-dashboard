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
| slug | text | URL slug único (ex: "lais-rios") |
| senha_hash | text | Senha de acesso hasheada (bcrypt) |
| meta_account_id | text | ID da conta de anúncios (ex: act_XXXXX) |
| ativo | boolean | Liga/desliga o cliente |
| criado_em | timestamp | Data de criação |

### Tabela `meta_tokens`
| Campo | Tipo | Descrição |
|---|---|---|
| client_id | uuid | FK → clients.id |
| access_token | text | System User token (criptografado em repouso) |
| atualizado_em | timestamp | Última vez que foi salvo |

### Tabela `daily_metrics`
| Campo | Tipo | Descrição |
|---|---|---|
| id | uuid | Chave primária |
| client_id | uuid | FK → clients.id |
| data | date | Data da métrica |
| impressoes | bigint | Total de impressões |
| cliques | bigint | Total de cliques |
| alcance | bigint | Alcance único |
| investido | numeric | Valor investido (R$) |
| leads | integer | Total de leads |
| ctr | numeric | Click-through rate (%) |
| cpc | numeric | Custo por clique (R$) |
| cpm | numeric | Custo por mil impressões (R$) |
| cpa | numeric | Custo por aquisição (R$) |
| roas | numeric | Retorno sobre investimento em anúncio |
| sincronizado_em | timestamp | Timestamp da última sync |

---

## Páginas

### `/[slug]` — Dashboard do Cliente
- Rota pública com proteção por senha (sessão via cookie seguro)
- Exibe dados dos últimos 30 dias para o cliente do slug
- Layout idêntico ao dashboard atual (dark, neon, MARCHING branding)
- Mostra timestamp "Última atualização: hoje às 08h"
- Se slug não existir → 404

### `/admin` — Painel de Gestão
- Protegido por senha master (variável de ambiente no Vercel)
- Lista todos os clientes com status ativo/inativo
- Formulário para adicionar novo cliente:
  - Nome, slug, senha de acesso, Meta Account ID, System User Token
- Botão "Sincronizar agora" por cliente (trigger manual da sync)
- Exibe última sincronização de cada cliente

### `/api/sync` — Endpoint de Sincronização
- Recebe chamada do GitHub Actions com secret de autorização
- Para cada cliente ativo:
  1. Busca token no Supabase
  2. Chama Meta Marketing API (campo: insights, período: últimos 30 dias)
  3. Upsert na tabela `daily_metrics`
  4. Atualiza `sincronizado_em`
- Retorna JSON com resultado por cliente (sucesso/erro)
- Em caso de erro na Meta API: mantém dados existentes, loga o erro

---

## Meta Marketing API

**Versão:** v19.0
**Autenticação:** System User token (permanent — não expira)
**Endpoint principal:** `GET /{ad_account_id}/insights`

**Campos puxados:**
```
impressions, clicks, reach, spend, actions (leads),
ctr, cpc, cpm, cost_per_action_type, purchase_roas
```

**Período:** últimos 30 dias (`date_preset=last_30d`)
**Nível:** account (visão consolidada de todas as campanhas)

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
- Todo o código de componentes React é compatível (sem reescrita)
- Arquivos `src/components/` e `src/App.tsx` são reaproveitados
- Adiciona-se: `pages/`, `app/`, `api/` (estrutura Next.js)
- Remove-se: configuração Vite, bundle script atual

---

## Tecnologias

| Camada | Tecnologia | Plano |
|---|---|---|
| Frontend + Backend | Next.js 14 (App Router) | — |
| Hospedagem | Vercel | Grátis |
| Banco de dados | Supabase (PostgreSQL) | Grátis (500MB) |
| Cron scheduler | GitHub Actions | Grátis |
| Domínio | relatorios.marching.com.br | Já existente |
| DNS | Hostinger | Já existente |
| Meta API | Meta Marketing API v19 | Grátis (uso) |

**Custo total mensal: R$ 0** para a escala atual.

---

## Fora do Escopo

- App mobile
- Notificações por WhatsApp/e-mail quando métricas caem
- Integração com Google Ads, TikTok Ads (pode ser adicionado no futuro)
- Relatórios em PDF (pode ser adicionado no futuro)
- OAuth flow automático para conectar contas Meta (System User manual é suficiente)

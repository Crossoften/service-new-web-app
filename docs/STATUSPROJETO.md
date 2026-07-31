# 📊 STATUS DO PROJETO — Auditoria & Integração Service App

> **Arquivo mestre de progresso e retomada.** Atualizado a cada passo. Se a sessão renovar/reiniciar,
> **leia este arquivo primeiro** — ele resume tudo o que foi decidido, feito e o que falta.
>
> **Última atualização:** 2026-07-31 · **Fase atual:** Módulo 1 (Auth) — Slice 1 ✅ / Slice 2 a iniciar
>
> ⚠️ **Base sincronizada com `origin/main` (commit `f4931bf`).** O clone inicial estava 2 commits atrás;
> o `origin` adicionou o **módulo Entregador** (`home-entregador`, `status-entrega`, `trabalhos-entregador`)
> e telas de compra-venda do fornecedor. **Todos os patches foram regenerados contra essa base** — aplique
> os patches novos (os antigos, gerados contra a base antiga, não aplicam). **A9 resolvido:** a rota
> `/entregador/home` já existe → `Delivery` roteia direto para ela.

---

## 🔴 Regras invioláveis (do cliente)

1. **NUNCA** executar `git commit`, `git push`, criar branch/PR/merge. Autoria dos commits é **exclusiva do cliente**.
   Entregas do assistente = **arquivos `.patch`/diffs** na pasta `patches/`, aplicados manualmente pelo cliente.
2. **NÃO** alterar back-end. Necessidades de API são **documentadas** em `docs/backend-demandas.md`.
3. Trabalho **incremental, módulo por módulo**. Auditar antes de integrar.

> Branch de trabalho definida pelo cliente: **`integracao`** (o cliente cria e commita).

---

## ✅ Decisões travadas

| Tema | Decisão |
|---|---|
| **Login** | Email + senha (segue a API). Sem SMS no web. |
| **Delivery** | Congelado como **mock** no FE; prioridade máxima de backend (BE-01/02/03). |
| **Aluguel / Empregos** | Aluguel = `products?transactionType=Rent`. Empregos = mock + demanda. |
| **D1 — Perfis** | **1 perfil por conta** (API retorna um `profileType`). |
| **D2 — Parceiro** | Parceiro = **`Influencer`** (`Partner` a depreciar). |
| **D3 — Assinatura** | Todas as verticais de fornecedor exigem assinatura; delivery híbrido. |
| **D4 — Entregador** | Repasse por entrega, sem assinatura. |
| **A9 — Rota entregador** | `Delivery` → `/home` **provisório** até o módulo Entregador. |
| **Cadastro fornecedor** | Sequência: register → **login automático** → planos → `POST /subscriptions`. |

---

## 📚 Índice de artefatos (docs/)

| Arquivo | Conteúdo |
|---|---|
| `STATUS-PROJETO.md` | **Este arquivo** — progresso e retomada |
| `blueprint-perfis-e-regras.md` | Desenho de negócio: perfis, regras, matriz por vertical |
| `backend-demandas.md` | 17 demandas de back-end (BE-01…BE-17) |
| `inventario-auth.md` | Inventário detalhado do Módulo Auth |

---

## 🗺️ Roadmap & progresso

| Fase / Módulo | Status | Patch |
|---|---|---|
| **Fase 0 — Fundação** (HttpClient, interceptors, session, guards, models, env) | ✅ **Concluída** (build ok) | `patches/fase-0-fundacao.patch` |
| **Módulo 1 — Auth** | 🔄 **Em andamento** | fatiado (ver abaixo) |
| Módulo 2 — Perfil | ⏳ Pendente | — |
| Módulo 3 — Serviços (Cliente) | ⏳ Pendente | — |
| Módulo 4 — Serviços (Fornecedor) | ⏳ Pendente | — |
| Módulo 5 — Parceiro | ⏳ Pendente | — |
| Módulo 6 — Marketplace (Produtos/Transporte/Hospedagem/Negociações) | ⏳ Pendente | — |
| Delivery / Empregos | 🧊 Congelados (demanda BE) | — |

### Módulo 1 — Auth (fatias)

| Slice | Escopo | Status | Patch |
|---|---|---|---|
| **1** | models de auth + `AuthService` + tela de **Login** (email/senha, roteia por `profileType`) | ✅ **concluído** (build ok) | `patches/auth-slice-1-login.patch` |
| **2** | **Cadastro** (email, sem SMS, register por perfil, fornecedor→planos+assinatura) | 🔄 **a iniciar** | `patches/auth-slice-2-cadastro.patch` |
| **3** | **Recuperação de senha** (`/esqueci-senha`, `/redefinir-senha`) + wiring de guards nas rotas | ⏳ | `patches/auth-slice-3-recuperacao.patch` |

---

## 🔧 Estado técnico

- **Build:** `ng build --configuration development` → ✅ (Fase 0).
- **Ambiente:** `apiBaseUrl = https://homolog.crosoften.com:8029/v1` (env prod e dev).
- **Fundação disponível:** `SessionService` (signals+localStorage), `ApiService` (baseURL+params+upload),
  `authInterceptor` (Bearer), `errorInterceptor` (normaliza + trata 401), `authGuard`/`profileGuard`
  (criados, **ainda não aplicados às rotas** — serão no Auth Slice 3).

---

## ▶️ Próximos passos imediatos

1. ✅ **[feito]** Auth Slice 1 — `core/models/auth.ts`, `core/services/auth.ts` (AuthService), rework do Login.
2. **[próximo]** Auth Slice 2 — Cadastro (adicionar email, remover SMS, register por perfil, fornecedor→planos+assinatura).
3. Auth Slice 3 — Recuperação de senha + aplicar guards nas rotas.

---

## 🧭 Como retomar (checklist para nova sessão)

1. Ler este arquivo + `blueprint-perfis-e-regras.md` + `inventario-auth.md`.
2. Conferir a working tree: `git status` (mudanças ainda não commitadas ficam aqui; o cliente commita na `integracao`).
3. Ver patches prontos em `patches/`.
4. Continuar do "Próximos passos imediatos" acima.
5. **Nunca** commitar/pushar; entregar patches.

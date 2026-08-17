# Inventário — Módulo 8: Parceiro / Influencer

> Auditoria antes da integração. Perfil `Influencer` (Decisão D2). Núcleo do perfil =
> **indicação + comissão + saldo/banco**. Fonte da verdade: **Swagger** (nunca assumir DTOs).
>
> **Status:** 🔍 auditoria concluída — **integração bloqueada por contrato** (ver §4).

## 1. Telas existentes (hoje 100% mock)

| # | Rota | Componente | O que exibe (mock) | Endpoint-alvo |
|---|------|-----------|--------------------|---------------|
| P-home | `/parceiro/home` | `HomeParceiroComponent` | link de indicação (copiar/compartilhar); stats: **downloads, pagantes, comissão, ranking**; últimas indicações | `GET /profile/me` (link) + `GET /referrals/me/summary` (stats) + `GET /referrals/me` (últimas) |
| P-cod | `/parceiro/codigo` | `MeuCodigoComponent` | link de indicação (copiar/compartilhar) | `GET /profile/me` → `referralCode` |
| P-ind | `/parceiro/indicacoes` | `IndicacoesComponent` | lista com abas **Todas / Ativas / Inativas** | `GET /referrals/me` |
| P-sal | `/parceiro/saldo` | `SaldoComponent` | saldo do mês; abas **Histórico** (lançamentos) e **Bancos** (contas) | saldo/comissão + `bank-accounts` (?) |
| P-ban | `/parceiro/banco/novo` | `NovoBancoComponent` | form: banco, tipo, agência, conta, CPF | `POST bank-accounts` (?) |
| P-mais | `/parceiro/mais` | `MaisParceiroComponent` | menu institucional + Sair | — (estático / logout) |

Todas protegidas por `authGuard + profileGuard('Influencer')` (já existente em `app.routes.ts`).

## 2. O que JÁ temos no contrato (confirmado)

- **`GET /profile/me`** (`ResponseProfileDto`) já modelado — inclui **`referralCode?`** e
  **`commissionRate?`**. → resolve o **link de indicação** (P-cod e o link do P-home) **sem depender
  de novos DTOs**.
- **BE-10 resolvido:** `GET /referrals/me` e `GET /referrals/me/summary` existem
  (registrado em `backend-demandas.md`).
- **BE-11 resolvido:** `Partner` removido; o perfil de indicação é **`Influencer`**.
- **Enum `BankAccountType = 'Checking' | 'Savings'`** já existe em `enums.ts` (do Swagger) →
  contas bancárias **existem** no contrato.

## 3. Plano de fatias proposto

| Slice | Escopo | Depende de |
|-------|--------|-----------|
| **P-1** | **Meu Código + link do Home** — link real a partir de `profile/me.referralCode`; copiar/compartilhar (Web Share API) | ✅ nada além do que já existe → **pode ir agora** |
| **P-2** | **Home stats + últimas indicações** — `referrals/me/summary` + `referrals/me` | ⛔ DTO de `summary` e de `referral` |
| **P-3** | **Indicações (Todas/Ativas/Inativas)** — `referrals/me` com filtro | ⛔ DTO de `referral` (campo de status ativo/inativo) |
| **P-4** | **Saldo (histórico + comissão)** | ⛔ endpoint/ْDTO de saldo/comissão do influencer |
| **P-5** | **Bancos (listar + cadastrar)** — `bank-accounts` | ⛔ endpoints/DTO de `bank-accounts` |

## 4. ⛔ Bloqueio: seções do Swagger necessárias

O contrato completo veio no contexto inicial (agora sumarizado) e **não está no repositório**.
Para wire preciso (sem assumir campos), preciso das seguintes seções do Swagger:

1. **`GET /referrals/me`** — shape de cada indicação (ex.: `name`, status ativo/inativo,
   `profileType`, `createdAt`, comissão gerada?, foto?).
2. **`GET /referrals/me/summary`** — campos do resumo (comissão total, contagens
   downloads/pagantes, ranking?).
3. **Saldo/repasse do influencer** — existe `/balances/*` ou o saldo sai do `summary`? (ligado ao BE-17).
4. **`bank-accounts`** — rotas (listar/criar/excluir) e `Create...Dto` (banco, `BankAccountType`,
   agência, conta, documento).

> **Enquanto isso:** P-1 (link real) pode ser entregue já, pois só usa `profile/me.referralCode`.

## 5. Observações / possíveis demandas de back

- **Ranking** e **downloads** (stats do Home) podem não existir no `summary` → se faltarem, viram
  demanda de back (candidato a **BE-18**) ou saem da UI.
- **Saque/withdrawal**: as telas mostram saldo e bancos, mas não há ação de "sacar" — confirmar se
  o repasse é automático ou se falta endpoint de solicitação de saque.

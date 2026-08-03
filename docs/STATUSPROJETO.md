# 📊 STATUS DO PROJETO — Auditoria & Integração Service App

> **Arquivo mestre de progresso e retomada.** Atualizado a cada passo. Se a sessão renovar/reiniciar,
> **leia este arquivo primeiro** — ele resume tudo o que foi decidido, feito e o que falta.
>
> **Última atualização:** 2026-08-02 · **Fase atual:** Auth ✅ / Perfil ✅ / Delivery Cliente ✅ / **Delivery Fornecedor ✅ (DF-1/2)** / próximo: Entregador (Módulo 7)
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
| **Delivery** | ✅ **Destravado** — backend implementado (`/restaurants`, `/food-orders`, `/deliveries`). Agora é vertical integrável. |
| **Aluguel / Empregos** | Aluguel = `products?transactionType=Rent`. Empregos = mock + demanda. |
| **D1 — Perfis** | **1 perfil por conta** (API retorna um `profileType`). |
| **D2 — Parceiro** | Parceiro = **`Influencer`**. `Partner` **removido** do código (Slice 2). |
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
| `inventario-delivery-cliente.md` | Inventário detalhado do Delivery Cliente (auditoria) |
| `inventario-delivery-fornecedor.md` | Inventário detalhado do Delivery Fornecedor (auditoria) |

---

## 🗺️ Roadmap & progresso

| Fase / Módulo | Status | Patch |
|---|---|---|
| **Fase 0 — Fundação** (HttpClient, interceptors, session, guards, models, env) | ✅ **Concluída** (build ok) | `patches/fase-0-fundacao.patch` |
| **Módulo 1 — Auth** | ✅ **Concluído** (Slices 1–3, build+specs ok) | fatiado (ver abaixo) |
| **Módulo 2 — Perfil** | ✅ **Concluído** (`/profile/me`, endereço, foto, cobrança, logout) | `patches/modulo-2-perfil.patch` |
| Módulo 3 — Serviços (Cliente) | ⏳ Pendente | — |
| Módulo 4 — Serviços (Fornecedor) | ⏳ Pendente | — |
| Módulo 5 — Delivery Cliente (`/restaurants`, `/food-orders`) | ✅ **Concluído** (DC-1/2/3) | fatiado (ver abaixo) |
| Módulo 6 — Delivery Fornecedor (`/restaurants/me`, cardápio, pedidos) | ✅ **Concluído** (DF-1/2) | fatiado (ver abaixo) |
| Módulo 7 — Entregador (`/deliveries` + rastreamento) | 🔄 **Próximo** (backend pronto) | — |
| Módulo 8 — Parceiro/Influencer (`/referrals/me`) | ⏳ Pendente (backend pronto) | — |
| Módulo 9 — Marketplace: Compra-Venda (`/products` + `/commercial-transactions`) | ⏳ Pendente (backend pronto) | — |
| Módulo 10 — Aluguel (`/products?Rent` + `/rentals`) | ⏳ Pendente (backend pronto) | — |
| Módulo 11 — Transporte (`/transportations` + `/transport-requests`) | ⏳ Pendente (backend pronto) | — |
| Módulo 12 — Hospedagem (`/accommodations` + `/bookings`) | ⏳ Pendente (backend pronto) | — |
| Módulo 13 — Empregos (`/jobs` + applications) | ⏳ Pendente (backend pronto) | — |

> 🎉 **Nada mais congelado:** o Swagger novo (2026-07-31) implementou BE-01…BE-17. Todas as verticais têm backend transacional.
> ✅ **Limpeza feita (Slice 2):** `Partner` removido de `core/models/enums.ts` (`UserProfileType`) e de `PROFILE_HOME_ROUTES` em `auth.ts`.

### Módulo 6 — Delivery Fornecedor (fatias)

| Slice | Escopo | Status | Patch |
|---|---|---|---|
| **DF-1** | **Restaurante & Cardápio** — `FornecedorService` real (restaurante/cardápio); `GET /restaurants/me` (+criar via `/fornecedor/restaurante`); gerenciar/adicionar/editar item; nova categoria; abrir/fechar; desativar item (soft-delete) | ✅ **concluído** (build+specs ok) | `patches/delivery-fornecedor-df1-restaurante-cardapio.patch` |
| **DF-2** | **Pedidos & Faturamento** — pedidos recebidos (`GET /food-orders`), aceitar/recusar (`respond`) + em preparo (`preparing`), payout agregado (`/restaurants/me/payouts`) | ✅ **concluído** (build+specs ok) | `patches/delivery-fornecedor-df2-pedidos-payout.patch` |

> Decisões travadas: remover item = **desativar** (`isActive=false`); pedido = **Aceitar/Recusar/Em preparo**; faturamento = **payout agregado**; **incluir** criar restaurante no 404.

### Módulo 5 — Delivery Cliente (fatias)

| Slice | Escopo | Status | Patch |
|---|---|---|---|
| **DC-1** | **Catálogo** — models `restaurant.ts`; `DeliveryService` real (camada view-model); categorias/listagem/restaurante+cardápio/item (T1–T4) integrados | ✅ **concluído** (build+specs ok) | `patches/delivery-cliente-dc1-catalogo.patch` |
| **DC-2** | **Carrinho & Checkout** — models `food-order.ts`; pagamento (Crédito/PIX), endereço via perfil + Express, `POST /food-orders` (T5–T7) | ✅ **concluído** (build+specs ok) | `patches/delivery-cliente-dc2-checkout.patch` |
| **DC-3** | **Acompanhamento** — status real por polling (6 estados) + rastreio `delivery.lat/lng` + cancelar + tela "meus pedidos" (`/delivery/pedidos`) | ✅ **concluído** (build+specs ok) | `patches/delivery-cliente-dc3-acompanhamento.patch` |

> Decisões travadas: pagamento **Crédito+PIX**; endereço do **perfil** + **Express** no front; campos de restaurante (avaliação/tempo/logo/taxa) **opcionais** aguardando BE-D1.

### Módulo 1 — Auth (fatias)

| Slice | Escopo | Status | Patch |
|---|---|---|---|
| **1** | models de auth + `AuthService` + tela de **Login** (email/senha, roteia por `profileType`) | ✅ **concluído** (build ok) | `patches/auth-slice-1-login.patch` |
| **2** | **Cadastro** (email, sem SMS, register por perfil, fornecedor→login auto→planos+assinatura) + limpeza `Partner` | ✅ **concluído** (build+specs ok) | `patches/auth-slice-2-cadastro.patch` |
| **3** | **Recuperação de senha** (`/esqueci-senha`, `/redefinir-senha`) + wiring de `authGuard`/`profileGuard` nas rotas | ✅ **concluído** (build+specs ok) | `patches/auth-slice-3-recuperacao.patch` |

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
2. ✅ **[feito]** Auth Slice 2 — Cadastro (email, sem SMS, `register/*` por perfil, fornecedor→login auto→`plans/active`+`subscriptions`), models `plan.ts`/`subscription.ts` + `SubscriptionService`, limpeza `Partner`.
3. ✅ **[feito]** Auth Slice 3 — Telas `/esqueci-senha` + `/redefinir-senha` (`forgot`/`reset`) e `authGuard`/`profileGuard` aplicados às rotas privadas (fornecedor→`Supplier`, parceiro→`Influencer`, entregador→`Delivery`).
4. ✅ **[feito]** Módulo 2 — Perfil: `ProfileService` + tela `/perfil` (carrega `GET /profile/me`; edita dados/foto via `PATCH /profile/me` + upload/`DELETE /profile-photo`; endereço via `PATCH /profile/me/address`; cobrança do fornecedor via `PATCH /profile/me/billing-type`; logout).
5. ✅ **[feito]** Delivery Cliente **DC-1 (Catálogo)** — `restaurant.ts` + `DeliveryService` real; T1–T4 integrados (categorias, listagem por `categoryId`, restaurante+cardápio, item+adicionais).
6. ✅ **[feito]** Delivery Cliente **DC-2 (Carrinho & Checkout)** — `food-order.ts`; pagamento Crédito/PIX, endereço do perfil + Express, `POST /food-orders` (carrinho com ids reais).
7. ✅ **[feito]** Delivery Cliente **DC-3 (Acompanhamento)** — status por polling (`GET /food-orders/{id}`, 6 estados) + rastreio `delivery.lat/lng` + cancelar (`PATCH .../cancel`) + tela "meus pedidos" (`GET /food-orders`, rota `/delivery/pedidos`).
8. ✅ **[feito]** Delivery Fornecedor **DF-1 (Restaurante & Cardápio)** — `FornecedorService` real; onboarding (`/fornecedor/restaurante`), gerenciar/adicionar/editar/desativar item, nova categoria, abrir/fechar loja.
9. ✅ **[feito]** Delivery Fornecedor **DF-2 (Pedidos & Faturamento)** — pedidos recebidos (`GET /food-orders`), aceitar/recusar (`respond`), em preparo (`preparing`), payout agregado na home.
10. **[próximo]** Módulo 7 — Entregador (`/deliveries`: aceitar/coletar/localização/entregar + rastreamento).

---

## 🧭 Como retomar (checklist para nova sessão)

1. Ler este arquivo + `blueprint-perfis-e-regras.md` + `inventario-auth.md`.
2. Conferir a working tree: `git status` (mudanças ainda não commitadas ficam aqui; o cliente commita na `integracao`).
3. Ver patches prontos em `patches/`.
4. Continuar do "Próximos passos imediatos" acima.
5. **Nunca** commitar/pushar; entregar patches.

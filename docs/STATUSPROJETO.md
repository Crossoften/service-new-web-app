# 📊 STATUS DO PROJETO — Auditoria & Integração Service App

> **Arquivo mestre de progresso e retomada.** Atualizado a cada passo. Se a sessão renovar/reiniciar,
> **leia este arquivo primeiro** — ele resume o que foi decidido, feito e o que falta.
>
> **Última atualização:** 2026-08-31 · **Fase atual:** 🎉 **Integração Front↔Swagger completa** —
> todas as verticais + **Fase AJ** (telefone/auth + delivery Fase C) concluídas. Pendências só de back-end.
>
> **Base de código:** `origin/main` @ `f4931bf`. **Branch de entrega (cliente):** `integracao`.
> **Back-end:** `service-new-ws` @ `ajustes-gerais`. **Base local:** `http://localhost:8000/v1`.

---

## 🔴 Regras invioláveis (do cliente)

1. **NUNCA** executar `git commit`, `git push`, criar branch/PR/merge. Autoria dos commits é **exclusiva do cliente**.
   Entregas do assistente = **arquivos `.patch`/diff** (um por fatia) + docs **drop-in**, aplicados pelo cliente na `integracao`.
2. **NÃO** alterar back-end. Necessidades de API são **documentadas** em `docs/backend-demandas.md`.
3. Trabalho **incremental, fatia por fatia**. Auditar antes de integrar; validar cada fatia (build + specs isolados).

> ⚠️ **Continuidade:** o container remoto é efêmero (re-clona o repo no start). Os patches entregues ficam com o
> cliente; para retomar com precisão após um reset, o cliente deve manter a `integracao` **empurrada** ao remoto.
> Em 2026-08-31 houve um re-provisionamento; `origin/integracao` (push de 2026-08-17) estava atrás (sem S-5/AJ).

---

## ✅ Decisões travadas

| Tema | Decisão |
|---|---|
| **Arquitetura** | Serviços **hand-written** + **camada de view-model** (pt) sobre os DTOs. **Não** adotar `ng-openapi-gen` (mantém telas mock estáveis). |
| **Identidade** | **Telefone** é a identidade principal (obrigatório, verificado por SMS, E.164). **E-mail é opcional.** |
| **Login** | Campo aceita **e-mail ou telefone** (API decide pelo `@`). `401` genérico. |
| **D1 — Perfis** | 1 perfil por conta (`profileType`). |
| **D2 — Parceiro** | Parceiro = **`Influencer`**. `Partner` removido do código. |
| **D3 — Assinatura** | Verticais de fornecedor exigem assinatura; delivery híbrido (payouts). Onboarding pós-login. |
| **D4 — Entregador** | Repasse por entrega, sem assinatura. |
| **Pagamento (delivery)** | 5 métodos: `CreditCard·DebitCard·Pix·BankSlip·Cash`. `deliveryFee` calculado no servidor. |
| **Sessão** | `guestGuard` bloqueia telas de auth com sessão ativa; `login()` limpa sessão anterior. Logout via perfil. |

---

## 📚 Índice de artefatos (docs/)

| Arquivo | Conteúdo |
|---|---|
| `STATUS-PROJETO.md` | **Este arquivo** — progresso e retomada |
| `relatorio-final-auditoria.md` | Relatório final da auditoria/integração (executivo + por módulo) |
| `api-contract-ref.md` | Referência de contrato (DTOs reais do Swagger) — durável |
| `backend-demandas.md` | Demandas de back-end (BE-01…17, D, F, Q) |
| `blueprint-perfis-e-regras.md` | Perfis, regras de negócio e matriz por vertical |
| `inventario-*.md` | Auditorias detalhadas por módulo (auth, delivery, entregador, parceiro, marketplace, serviços) |

---

## 🗺️ Roadmap & progresso

| Fase / Módulo | Status | Patch(es) |
|---|---|---|
| **Fase 0 — Fundação** (HttpClient, interceptors, session, guards, models, env) | ✅ | `fase-0-fundacao` |
| **1 — Auth** (login, cadastro, recuperação) | ✅ | `auth-slice-1..3` (+ Fase AJ) |
| **2 — Perfil** (`/profile/me`) | ✅ | `modulo-2-perfil` |
| **3/4 — Serviços** (`/services`+`/budgets`+`/works`) | ✅ **S-1…S-5** | `servicos-s1..s5` |
| **5 — Delivery Cliente** (`/restaurants`,`/food-orders`) | ✅ DC-1/2/3 (+AJ-5/6) | `delivery-cliente-dc1..3` |
| **6 — Delivery Fornecedor** (cardápio, pedidos, payout) | ✅ DF-1/2 (+AJ-5/6) | `delivery-fornecedor-df1/2` |
| **7 — Entregador** (`/deliveries` + rastreio) | ✅ E-1/2 | `entregador-e1/e2` |
| **8 — Parceiro/Influencer** (`/referrals/me`, saldo, bancos) | ✅ P-1…5 | `parceiro-p1`, `parceiro-p2-p5` |
| **9 — Marketplace** (`/products`+`/commercial-transactions`) | ✅ M-1…4 | `marketplace-m1`, `marketplace-m3-m4` |
| **10 — Aluguel** (`/rentals`) | ✅ A-1…3 | `aluguel-a1-a3-…` |
| **11 — Transporte** (`/transport-requests`) | ✅ T-1…3 | `transporte-t1-t3-…` |
| **12 — Hospedagem** (`/bookings`) | ✅ H-1…3 | `hospedagem-empregos-…` |
| **13 — Empregos** (`/jobs`) | ✅ E-1…3 | `hospedagem-empregos-…` |
| **Transversal — Chat** (`/chats`, polling) | ✅ | `chat-conversas`, `chat-delivery` |

### Módulos 3/4 — Serviços (fatias)

| Slice | Escopo | Status | Patch |
|---|---|---|---|
| **S-1** | Cliente: catálogo (`GET /services`) + solicitar orçamento (`POST /budgets`) | ✅ | `servicos-s1-catalogo-orcamento` |
| **S-2** | Cliente: orçamentos (`scope=Requested`), aprovar (`…/approve`), responder acréscimo | ✅ | `servicos-s2-orcamentos-cliente` |
| **S-3** | Fornecedor: meus serviços (`/services/my-services`), criar/editar | ✅ | `servicos-s3-fornecedor-servicos` |
| **S-4** | Fornecedor: orçamentos recebidos (`scope=Received`), responder, pedir mais info | ✅ | `servicos-s4-fornecedor-orcamentos` |
| **S-5** | **Trabalhos** (`/works`): cliente (confirmar chegada, garantia, cancelar, pagar) + fornecedor (iniciar, acréscimo, finalizar, cancelar). `WorkService` + `work.ts` | ✅ | `servicos-s5-trabalhos` |

---

## 🔧 Fase AJ — Ajustes pós-auditoria + Delivery Fase C

> Back-end atualizado (`service-new-ws` @ `ajustes-gerais`, 2026-08-26): telefone como identidade principal
> (obrigatório, SMS; e-mail opcional) + Fase C do delivery. Fonte: `ORIENTACOESFRONT.md` + `openapi.json` real.
> Decisão: manter serviços hand-written; aplicar **ajustes direcionados**. `environment.*` (apiBaseUrl localhost)
> fica sob controle local do cliente — não tocamos.

| Fatia | Escopo | Status | Patch |
|---|---|---|---|
| **AJ-1** | **Telefone (base)** — `core/utils/phone.ts`: `phoneToE164`, `maskBRPhone`, `isValidBRPhone`, `nationalDigits`. Função única de conversão exibir↔enviar. | ✅ (11 specs) | `aj1-telefone-e164-util` |
| **AJ-2** | **Login por telefone** — campo aceita e-mail/telefone (E.164 quando sem `@`), label "E-mail ou telefone", máscara; link "não recebeu o código?" → `resend-verification`; `401` genérico. `ResendVerificationDto` + `AuthService.resendVerification`. | ✅ (7 specs) | `aj2-login-telefone` |
| **AJ-3** | **Recuperação de senha** — `forgot {channel(sms\|email), identifier}`; `reset {identifier, code(6), …}`; e-mail/telefone; código 6 dígitos; `identifier` via router state. (verify-code opcional adiado.) | ✅ (6 specs) | `aj3-recuperacao-senha` |
| **AJ-4** | **Cadastro + Verificação SMS** — `email` opcional, `phone` obrigatório (E.164); verificação (step 3) com código **6 dígitos** `verify-account {identifier, code}` + **reenvio c/ contador 60s**; trata `503`/`409`; **bypass aposentado**. `VerifyAccountDto`; `VerifyCodeDto`→`{identifier, code}`. | ✅ (7 specs) | `aj4-cadastro-verificacao-sms` |
| **AJ-5** | **Delivery — pagamento & frete** — `PaymentMethod` → 5 valores (`+DebitCard/Cash`); sacola com as 5 formas; **`deliveryFee` removido** do POST; `confirm-payment` (Cash) no detalhe do pedido do fornecedor; `paymentStatus` no model. **lat/lng não implementado** (contrato sem o campo → **BE-Q7**). | ✅ (6 specs) | `aj5-delivery-pagamento-frete` |
| **AJ-6** | **Delivery — avaliação & cardápio** — avaliação de restaurante (`POST /restaurants/:id/reviews`, média/contagem, 403/409); exclusão de item (`DELETE /restaurants/menu-items/:id` → `deleted` true/false). | ✅ (7 specs) | `aj6-delivery-reviews-cardapio` |

> **Fora de escopo deste app:** admin de faixas de frete (`admin-delivery-fees`) — portal administrativo.
> **Contrato de auth v2 + Fase C** capturados em `api-contract-ref.md`.

---

## ▶️ Ordem de aplicação dos patches (resumo)

Fundação → Auth (1..3) → Perfil → Delivery (DC/DF) + fixes → Entregador → Parceiro → Marketplace → Aluguel →
Transporte → Hospedagem/Empregos → Chat → Serviços (S-1..S-5) → **Fase AJ (AJ-1..AJ-6)**.

> Cada fatia foi entregue como patch individual. A `integracao` do cliente é a fonte da verdade do estado aplicado.

---

## 🧭 Como retomar (checklist para nova sessão)

1. Ler este arquivo + `api-contract-ref.md` + `backend-demandas.md`.
2. Garantir que `origin/integracao` reflete o estado local aplicado (o cliente empurra); senão, basear novas
   fatias no estado que o cliente confirmar.
3. Para gerar patch novo: worktree limpo na base aplicada → editar → `ng build` + specs isolados → `git diff`.
4. **Nunca** commitar/pushar; entregar patch (um por fatia) + docs drop-in.

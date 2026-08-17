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
| **Cadastro fornecedor** | register → **Sucesso → Login** (todos os perfis iguais). Assinatura = **onboarding pós-login** em `/fornecedor/assinatura` (`GET /plans/active` + `POST /subscriptions`). **BE-15 confirmado**: `POST /restaurants` sem assinatura → 403 → Front redireciona aos planos. |
| **Telefone** | **Obrigatório** no Front (cliente/fornecedor/etc.); validação alinhada à mensagem do back (BE-Q2). |
| **Confirmação de conta** | **Ativa**: register → **código por email** → `POST /no-auth/verify-code` → Sucesso → Login. ("mobile" no contrato = este webapp; "web" = portal admin.) Falta rota de reenvio (BE-Q1). |
| **Sessão / troca de conta** | `guestGuard` bloqueia telas de auth com sessão ativa (sem "login por cima de login"); `login()` limpa sessão anterior. Logout via **perfil** — adicionadas rotas `/{fornecedor,parceiro,entregador,fornecedor/servicos}/perfil` (os bottom-navs apontavam para rotas inexistentes → logout inacessível). |

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
| `inventario-entregador.md` | Inventário detalhado do Entregador (auditoria) |
| `inventario-parceiro.md` | Inventário detalhado do Parceiro/Influencer (auditoria) |
| `inventario-marketplace.md` | Inventário detalhado do Marketplace/Compra-Venda (auditoria) |
| `api-contract-ref.md` | **Referência de contrato** (DTOs reais do Swagger) — durável p/ módulos 8–13 |
| `inventario-servicos.md` | Inventário do módulo Serviços (`/services`+`/budgets`+`/works`) + plano de fatias |
| `swagger.json` do cliente (2026-08-03) capturado em `api-contract-ref.md` | — |

---

## 🗺️ Roadmap & progresso

| Fase / Módulo | Status | Patch |
|---|---|---|
| **Fase 0 — Fundação** (HttpClient, interceptors, session, guards, models, env) | ✅ **Concluída** (build ok) | `patches/fase-0-fundacao.patch` |
| **Módulo 1 — Auth** | ✅ **Concluído** (Slices 1–3, build+specs ok) | fatiado (ver abaixo) |
| **Módulo 2 — Perfil** | ✅ **Concluído** (`/profile/me`, endereço, foto, cobrança, logout) | `patches/modulo-2-perfil.patch` |
| Módulos 3/4 — Serviços (`/services` + `/budgets` + `/works`) | 🚧 **Em andamento** (S-1..S-4 ok; **falta S-5 Trabalhos**) | fatiado (ver abaixo) · `inventario-servicos.md` |
| Módulo 5 — Delivery Cliente (`/restaurants`, `/food-orders`) | ✅ **Concluído** (DC-1/2/3) | fatiado (ver abaixo) |
| Módulo 6 — Delivery Fornecedor (`/restaurants/me`, cardápio, pedidos) | ✅ **Concluído** (DF-1/2) | fatiado (ver abaixo) |
| Módulo 7 — Entregador (`/deliveries` + rastreamento) | ✅ **Concluído** (E-1/E-2) | fatiado (ver abaixo) |
| Módulo 8 — Parceiro/Influencer (`/referrals/me`) | ✅ **Concluído** (P-1..P-5) | fatiado (ver abaixo) |
| Módulo 9 — Marketplace: Compra-Venda (`/products` + `/commercial-transactions`) | ✅ **Concluído** (M-1..M-4) | fatiado (ver abaixo) |
| Módulo 10 — Aluguel (`/products?Rent` + `/rentals`) | ✅ **Concluído** (A-1..A-3) | `patches/aluguel-a1-a3-vitrine-solicitacao-gestao.patch` |
| Módulo 11 — Transporte (`/transportations` + `/transport-requests`) | ✅ **Concluído** (T-1..T-3) | `patches/transporte-t1-t3-catalogo-pedidos.patch` |
| Módulo 12 — Hospedagem (`/accommodations` + `/bookings`) | ✅ **Concluído** (H-1..H-3) | `patches/hospedagem-empregos-verticais-finais.patch` |
| Módulo 13 — Empregos (`/jobs` + applications) | ✅ **Concluído** (E-1..E-3) | `patches/hospedagem-empregos-verticais-finais.patch` |
| Transversal — Chat (`/chats`) | ✅ **Concluído** | `patches/chat-conversas.patch` |

> 🎉 **Nada mais congelado:** o Swagger novo (2026-07-31) implementou BE-01…BE-17. Todas as verticais têm backend transacional.
> ✅ **Limpeza feita (Slice 2):** `Partner` removido de `core/models/enums.ts` (`UserProfileType`) e de `PROFILE_HOME_ROUTES` em `auth.ts`.

### Módulos 3/4 — Serviços (fatias)

| Slice | Escopo | Status | Patch |
|---|---|---|---|
| **S-1** | **Cliente: catálogo + solicitar orçamento** — `categoria-servicos` (cats reais) + `listagem-servicos` (`GET /services`, view-model `Prestador`) + `detalhes-prestador` (`GET /services/{id}`) + `requisitos-servico` (→ `POST /budgets`, um por prestador) | ✅ **concluído** (build+specs ok) | `patches/servicos-s1-catalogo-orcamento.patch` |
| **S-2** | **Cliente: orçamentos** — `orcamentos` (`GET /budgets?scope=Requested`, view-model `Orcamento`) + `aprovar-orcamento` (`GET /budgets/{id}` + **aprovar** `PATCH …/approve` → gera trabalho; **responder acréscimo** `…/respond-extra`) | ✅ **concluído** (build+specs ok) | `patches/servicos-s2-orcamentos-cliente.patch` |
| **S-3** | **Fornecedor: serviços** — `listagem-servicos-fornecedor` (`GET /services/my-services`, abas Ativos/Inativos) + `criar-servico` (categoria via dropdown real, tipo pt↔`ServiceType`, upload de imagem → `POST/PATCH /services`) | ✅ **concluído** (build+specs ok) | `patches/servicos-s3-fornecedor-servicos.patch` |
| **S-4** | **Fornecedor: orçamentos** — `orcamentos-fornecedor` (`GET /budgets?scope=Received`, abas por status) + `fazer-orcamento` (**responder** `PATCH /budgets/{id}` com valor/prazo/descrição + **pedir mais info** `…/request-more-information`) | ✅ **concluído** (build+specs ok) | `patches/servicos-s4-fornecedor-orcamentos.patch` |
| **S-5** | Trabalhos (`/works`): start/confirm-arrival/finish/pay/warranty/cancel + `WorkService` | ⏳ Pendente | — |

> Novos `ServiceCatalogService` + models `service.ts`/`budget.ts`. Detalhes/limitações (anexos, urgência) em
> `inventario-servicos.md`. Camada de view-model `Prestador` mantém as telas mock com mínima mudança.

### Transversal — Chat (`/chats`)

Tela de conversa `features/chat/chat` na rota `/chat/:id` (o `chatRoomId` já vem em todos os fluxos).
- Mensagens via `GET /chats/{id}/messages` (ordenadas por data), envio via `POST /chats/{id}/messages`,
  marca lido via `PATCH /chats/{id}/read`. **Polling a cada 10s** (sem WebSocket no contrato).
- Bolhas "minha vs. do outro" por `session.userId` vs `sender.id`.
- Botão de **chat no cabeçalho** dos detalhes de: **negociação** (Marketplace), **aluguel**, **pedido de
  transporte**, **reserva** (Hospedagem) e **pedido de delivery** — cliente (`status-pedido`) e fornecedor
  (`detalhes-pedido-fornecedor`) — todos navegam para `/chat/{chatRoomId}`.
- `ChatService` + model `chat.ts`. Patches: `patches/chat-conversas.patch` + `patches/chat-delivery.patch`.
- **Inbox (lista de conversas):** não há endpoint de listagem no contrato → registrado como **BE-Q5**.

### Módulo 12 — Hospedagem (fatias)

| Slice | Escopo | Status | Patch |
|---|---|---|---|
| **H-1** | **Vitrine** — `categoria-hospedagem` (categorias reais) + `listagem-hospedagem` (`GET /accommodations`) | ✅ **concluído** | `patches/hospedagem-empregos-verticais-finais.patch` |
| **H-2** | **Detalhe + reservar** — `detalhe-hospedagem` (check-in/out/hóspedes, total = noites × diária → `POST /bookings`) | ✅ **concluído** | (mesmo patch) |
| **H-3** | **Minhas reservas** — `minhas-reservas` (`GET /bookings`) + `reserva-detalhe` com ações do anfitrião: **confirmar/recusar**, **check-in**, **concluir**, **cancelar** | ✅ **concluído** | (mesmo patch) |

### Módulo 13 — Empregos (fatias)

| Slice | Escopo | Status | Patch |
|---|---|---|---|
| **E-1** | **Vagas + candidatura** — `listagem-empregos` (`GET /jobs?scope=All`) + `detalhe-vaga` (candidatar `POST /jobs/{id}/apply`; empregador vê candidaturas) | ✅ **concluído** | `patches/hospedagem-empregos-verticais-finais.patch` |
| **E-2** | **Minhas candidaturas** — `minhas-candidaturas` (`GET /jobs/applications/me`) | ✅ **concluído** | (mesmo patch) |
| **E-3** | **Publicar + gerir** — `publicar-vaga` (`POST /jobs`) + `vaga-candidaturas` (empregador **aceita/recusa** — `PATCH /jobs/applications/{id}/respond`) | ✅ **concluído** | (mesmo patch) |

> Novos `AccommodationService`/`JobService` + models. Papéis (hóspede/anfitrião, candidato/empregador) por
> `session.userId`. Entradas no dev-menu: "Minhas Reservas" e "Minhas Candidaturas".

### Módulo 11 — Transporte (fatias)

| Slice | Escopo | Status | Patch |
|---|---|---|---|
| **T-1** | **Vitrine** — `categoria-transporte` (categorias reais `/transportations/categories`) + `listagem-transporte` (`GET /transportations`) | ✅ **concluído** (build+specs ok) | `patches/transporte-t1-t3-catalogo-pedidos.patch` |
| **T-2** | **Detalhe + solicitar** — `detalhe-transporte` (veículo + origem/destino/carga → `POST /transport-requests`) | ✅ **concluído** | (mesmo patch) |
| **T-3** | **Meus pedidos** — `meus-transportes` (`GET /transport-requests`) + `transporte-pedido-detalhe` com ações: **cotar** (transportador), **aceitar/recusar** cotação (solicitante), **iniciar** (`InTransit`), **entregar**, **cancelar** | ✅ **concluído** | (mesmo patch) |

> Novo `TransportService` + models `transportation.ts`/`transport-request.ts`. Fluxo com etapa de **cotação**:
> Solicitado → Cotado → Aceito → Em trânsito → Entregue. Papéis por `session.userId` vs `requester.id`/`provider.id`.

### Módulo 10 — Aluguel (fatias)

| Slice | Escopo | Status | Patch |
|---|---|---|---|
| **A-1** | **Vitrine** — `categoria-aluguel` (categorias reais) + `listagem-aluguel` (produtos alugáveis: filtra `transactionType` ≠ `Sale`) | ✅ **concluído** (build+specs ok) | `patches/aluguel-a1-a3-vitrine-solicitacao-gestao.patch` |
| **A-2** | **Detalhe + solicitar** — `detalhe-aluguel` (produto + datas/valor/condições → `POST /rentals`) | ✅ **concluído** | (mesmo patch) |
| **A-3** | **Meus aluguéis** — `meus-alugueis` (lista `GET /rentals`) + `aluguel-detalhe` com ações por papel: **aceitar/recusar**, **retirada** (`start`), **devolução** (`return`), **cancelar** | ✅ **concluído** | (mesmo patch) |

> Reusa `MarketplaceService` (produtos) + novo `RentalService` (`/rentals`) e `rental.ts`. Locatário/locador
> resolvidos por `session.userId` vs `requester.id`/`provider.id`. Datas via `<input type=date>` → ISO no POST.

### Módulo 9 — Marketplace/Compra-Venda (fatias)

| Slice | Escopo | Status | Patch |
|---|---|---|---|
| **M-1** | **Vitrine** — categorias reais (`GET /products/categories`) + listagem (`GET /products`, filtro por categoria/busca); models `product.ts`, `MarketplaceService` | ✅ **concluído** (build+specs ok) | `patches/marketplace-m1-vitrine-negociacao.patch` |
| **M-2** | **Detalhe + iniciar negociação** — `GET /products/{id}` + "Tenho interesse" (`POST /commercial-transactions`); model `commercial-transaction.ts` | ✅ **concluído** (build+specs ok) | (mesmo patch M-1) |
| **M-3** | **Criar/editar produto** (fornecedor) — `POST/PATCH/DELETE /products` + upload de imagem; modo "Meus produtos" na listagem (`/products/my-products`) | ✅ **concluído** (build+specs ok) | `patches/marketplace-m3-m4-produtos-negociacoes.patch` |
| **M-4** | **Negociações** — lista (`GET /commercial-transactions`) + detalhe com ações por papel: **aceitar/recusar** (vendedor), **pagar** (comprador), **concluir**, **cancelar** | ✅ **concluído** (build+specs ok) | (mesmo patch M-3) |

> Contrato disponível (`api-contract-ref.md`). Todas as telas do marketplace (antes vazias) foram
> **construídas** e ligadas à API. Rotas ativadas: `produtos`, `meus-produtos`, `produto/novo`,
> `produto/editar/:id`, `produto/:id`, `negociacoes`, `negociacao/:id`. Papel comprador/vendedor
> resolvido por `session.userId` vs `buyer.id`/`seller.id`.

### Módulo 8 — Parceiro/Influencer (fatias)

| Slice | Escopo | Status | Patch |
|---|---|---|---|
| **P-1** | **Meu Código** — link de indicação real a partir de `GET /profile/me → referralCode`; copiar/compartilhar (Web Share). Cadastro passa a consumir `?ref=CODIGO` → `referralCode` no `register` | ✅ **concluído** (build+specs ok) | `patches/parceiro-p1-meu-codigo-referral.patch` |
| **P-2** | Home: stats (`referrals/me/summary`) + últimas indicações (`referrals/me`) + link real | ✅ **concluído** | `patches/parceiro-p2-p5-indicacoes-saldo-bancos.patch` |
| **P-3** | Indicações (Todas/Ativas/Inativas) — `referrals/me` (ativa = `Convertido`) | ✅ **concluído** | (mesmo patch) |
| **P-4** | Saldo (`balances/receipts`: saldo do mês + histórico) + bancos (`bank-accounts/me`) | ✅ **concluído** | (mesmo patch) |
| **P-5** | Cadastro de banco (`POST /bank-accounts`) — tipo mapeado p/ `Checking/Savings` | ✅ **concluído** | (mesmo patch) |

> `ReferralsService`, `BalanceService`, `BankAccountService` + models `referral.ts`, `balance.ts`,
> `bank-account.ts`. **`bank-accounts` é conta única** (`/bank-accounts/me`) — a aba "Bancos" exibe 0 ou 1 conta.
> Stats da Home mapeiam direto o summary (downloads=totalReferrals, pagantes=totalPaying,
> comissão=accumulatedCommission, ranking=rankingPosition).

### Módulo 7 — Entregador (fatias)

| Slice | Escopo | Status | Patch |
|---|---|---|---|
| **E-1** | **Home & Disponíveis** — `delivery.ts`; `EntregadorService` real; entregas disponíveis (`available`) + aceitar/recusar; atividades (`/deliveries/me`); ganhos = placeholder (BE-17) | ✅ **concluído** (build+specs ok) | `patches/entregador-e1-home-disponiveis.patch` |
| **E-2** | **Entrega ativa** — detalhe (`GET /deliveries/{id}`) + **coletar** (`pickup`) → **entregar** (`deliver`); envio de **GPS** (`navigator.geolocation` → `PATCH /location`, a cada 15s enquanto PickedUp/OnTheWay) | ✅ **concluído** (build+specs ok) | `patches/entregador-e2-entrega-ativa.patch` |

> Decisões: faturamento = **placeholder "em breve"** (BE-17); **GPS real** (geolocation); endereço de destino **pendente do back** (BE-D2).

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

- ⚠️ **Change detection (zone.js):** o projeto foi criado **zoneless** (sem `zone.js`), o que funcionava com o mock **síncrono** mas **não atualizava a tela** em respostas **assíncronas** (HTTP) — telas ficavam presas em "carregando". **Corrigido reintroduzindo `zone.js`** (`fix-zonejs-change-detection.patch`: `package.json` + `angular.json` polyfills). **Após aplicar esse patch, rode `npm install`.**
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

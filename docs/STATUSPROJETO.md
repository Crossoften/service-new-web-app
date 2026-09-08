# 📊 STATUS DO PROJETO — Auditoria & Integração Service App

> **Arquivo mestre de progresso e retomada.** Atualizado a cada passo. Se a sessão renovar/reiniciar,
> **leia este arquivo primeiro** — ele resume o que foi decidido, feito e o que falta.
>
> **Última atualização:** 2026-09-08 · **Fase atual:** 🎉 Integração completa + verticais do fornecedor (FV-1…FV-5)
> + **Mercado Pago** (MP-1…MP-3) + **Fase Mapa (MAP-1…MAP-3, rastreamento ao vivo)** aplicada + ajustes de layout.
> **Em andamento:** fluxo delivery — **adicionais no cardápio** (back pronto, front a fazer) + melhorias de usabilidade.
>
> **Base de código:** `origin/main` @ `f4931bf`. **Branch de entrega (cliente):** `integracao` (@ `82c2730`).
> **Back-end:** `service-new-ws` @ `ajustes-gerais` (@ `b60afd0`, com Mercado Pago). **Base local:** `http://localhost:8000/v1`.

---

## 🔴 Regras invioláveis (do cliente)

1. **NUNCA** executar `git commit`, `git push`, criar branch/PR/merge. Autoria dos commits é **exclusiva do cliente**.
   Entregas do assistente = **arquivos `.patch`/diff** (um por fatia) + docs **drop-in**, aplicados pelo cliente na `integracao`.
2. **NÃO** alterar back-end. Necessidades de API são **documentadas** em `docs/backend-demandas.md`.
3. Trabalho **incremental, fatia por fatia**. Auditar antes de integrar; validar cada fatia (build + specs isolados).

> ⚠️ **Continuidade:** o container remoto é efêmero (re-clona o repo no start). Os patches entregues ficam com o
> cliente; para retomar com precisão após um reset, o cliente deve manter a `integracao` **empurrada** ao remoto.
> Em 2026-08-31, após um re-provisionamento, o cliente empurrou a `integracao` (`727808f`) com **AJ-1…AJ-6** e
> aplicou o **S-5**. Em 2026-09-03 empurrou o **hub** + correções de criar-serviço (`79c6afd`) — base das FV-1…FV-5.
> Em 2026-09-07 empurrou as FV (`a0e8b8c`); a fase **Mercado Pago** (MP-1…MP-3) e os ajustes (CD-1/NAV-1/AJ-A) foram
> gerados sobre `a0e8b8c` (AJ-A encaixa após MP-1). O back avançou para `b60afd0` (Mercado Pago + `food-orders/:id/pay`).

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
| **Fornecedor multi-vertical** | `Supplier` é genérico (contrato não distingue delivery dos demais). Landing = **hub** (`/fornecedor`); cada vertical tem listagem + form próprios sob `/fornecedor/<vertical>`. |
| **Aluguel × Compra-venda** | No back são o **mesmo recurso** (`products` com `transactionType` Sale/Rent/RentAndSale). **Decisão:** separar **por tela, sem dropdown** — Compra-venda cria `Sale`, Aluguel cria `Rent`; itens `RentAndSale` aparecem nas duas listagens; ao **editar**, o tipo é preservado. |

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
| **3/4 — Serviços** (`/services`+`/budgets`+`/works`) | ✅ **COMPLETO — S-1…S-5 aplicado** | `servicos-s1..s5` |
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

> ✅ **Módulo Serviços FECHADO** (S-1…S-5 aplicados na `integracao`, 2026-08-31). Ciclo completo integrado:
> catálogo → orçamento → aprovação → trabalho → execução → pagamento → garantia, cliente e fornecedor.

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

## 🧩 Correções & melhorias pós-integração

| Item | Escopo | Status | Patch |
|---|---|---|---|
| **Hub do Fornecedor (multi-vertical)** | **Análise:** `profileType` só tem `Client\|Supplier\|Delivery\|Influencer`; o contrato **não distingue** fornecedor-delivery dos demais (`/my-self` e `/profile/me` sem campo de tipo/categoria de fornecedor). O que o fornecedor "é" = o que ele criou (`restaurants/me`, `services/my-services`, …). **Decisão:** modelo **multi-vertical**. **Correção:** novo `HubFornecedorComponent` em `/fornecedor` (landing do Supplier) com cards por vertical; `PROFILE_HOME_ROUTES.Supplier` → `/fornecedor` (a home de delivery segue em `/fornecedor/home`). Corrige o bug de todo fornecedor cair na tela de restaurante. | ✅ (3 specs) | `hub-fornecedor-multivertical` |
| **Bug — criar serviço sem campo Nome** | `criar-servico` validava/enviava `name` mas o HTML **não tinha input de nome** → erro "Informe o nome do serviço" travava antes do endpoint. **Correção:** adicionado o campo Nome (ligado a `[(ngModel)]="nome"`). | ✅ (4 specs) | `AJ-fix-criar-servico-nome` |
| **Layout — campo Categoria (criar serviço)** | `<select>` de categoria vinha com classe `cs-field__disabled` e sem estilo (destoava do padrão). **Correção:** `cs-field__categoria` no padrão dos demais campos, com chevron. | ✅ | `AJ-fix-categoria-layout` |

### Auditoria das verticais do fornecedor (FV-1…FV-5)

> **Causa raiz:** o front integrou só o lado **consumidor** de hospedagem/aluguel/transporte; o back **já expunha**
> o cadastro pelo fornecedor (`POST /accommodations`, `/transportations`, `/products`, todos `@ProfileTypes(Supplier)`
> + assinatura ativa) — faltava a tela. **Nenhuma mudança de back-end foi necessária.**

| Fatia | Escopo | Status | Patch |
|---|---|---|---|
| **FV-1** | **Hospedagem** — `AccommodationService` (`my-accommodations`, criar/atualizar/remover) + `Create/UpdateAccommodationDto`; listagem (abas Ativas/Inativas + FAB "+") + form (categoria, nome, valor, quartos, endereço, descrição, imagem, toggle ativo) + rotas `/fornecedor/hospedagem[/criar]`. | ✅ (7 specs) | `FV-1-hospedagem-fornecedor` |
| **FV-2** | **Transporte** — `TransportService` (`my-transportations`, criar/atualizar/remover) + `Create/UpdateTransportationDto`; listagem + form (categoria, nome, modelo, ano, km, capacidade, valor, descrição, imagem, toggle) + rotas `/fornecedor/transporte[/criar]`. | ✅ (7 specs) | `FV-2-transporte-fornecedor` |
| **FV-3** | **Aluguel** — reusa `MarketplaceService`/`products` com `transactionType: Rent`; listagem filtra Rent+RentAndSale (filtro no cliente) + form travado em `Rent` (preserva tipo ao editar) + rotas `/fornecedor/aluguel[/criar]`. | ✅ (5 specs) | `FV-3-aluguel-fornecedor` |
| **FV-4** | **Compra e Venda** — remove o **dropdown de tipo** do form de produto (fixa `Sale` ao criar; preserva ao editar); listagem `mine` filtra Sale+RentAndSale (vitrine pública inalterada). | ✅ (5 specs) | `FV-4-compra-venda-fornecedor` |
| **FV-5** | **Cards do hub** — Hospedagem/Transporte/Aluguel re-fiados para `/fornecedor/<vertical>` (antes iam a telas do cliente). | ✅ (4 specs) | `FV-5-hub-cards` |

> **Ordem FV:** FV-1 → FV-2 → FV-3 (compartilham `app.routes.ts`); FV-4 e FV-5 aplicam em qualquer ponto.
> Todas as verticais do fornecedor agora têm **listagem + botão "+" + form próprio** no mesmo padrão de Serviços.

> **Follow-ups do hub:** homes de fornecedor dedicadas por vertical (hoje algumas reusam telas compartilhadas
> "meus/reservas"). O atalho "voltar ao hub" foi resolvido na **NAV-1** (aba **Categorias** → `/fornecedor`).

### Mercado Pago (MP-1…MP-3)

> Back atualizado (`service-new-ws` @ `b60afd0`): OAuth de vínculo do fornecedor + `POST /food-orders/:id/pay`
> (checkout). Doc de orientações revisado. Admin "liberar fornecedor" + seed/Twilio/webhooks ficam **fora deste app**.

| Fatia | Escopo | Status | Patch |
|---|---|---|---|
| **MP-1** | **Vínculo OAuth do fornecedor** — `MercadoPagoService` (`status`, `connect-url`, `oauth/callback`) + tela (selo conectado / botão conectar) + rota de callback. | ✅ (9 specs) | `MP-1-vinculo-mercado-pago` |
| **MP-2** | **Pagamento online (cliente)** — `delivery.pagarPedido()` (`POST /food-orders/:id/pay`) + botão "PAGAR AGORA" na tela de status (não-dinheiro + Pending) → checkout; re-consulta via polling; linha de pagamento. | ✅ (9 specs) | `MP-2-pagamento-online-pedido` |
| **MP-3** | **Erros de criação** — `400` "restaurante sem Mercado Pago" na criação do pedido → **saída em dinheiro**. O `409` "fornecedor vencido" das **6 rotas** de criação já era mostrado (todos os callers usam `err.message`; interceptor não desloga em 409) → **sem mudança**. | ✅ (3 specs) | `MP-3-erros-criacao-pedido` |

> ⚠️ **Doc × código:** o doc §8.2 diz `403` para restaurante sem MP na criação; o código real lança `400`
> (`SellerNotLinkedMercadoPagoException extends BadRequestException`). Tratado como **400 + mensagem** (fonte = API real).

### Ajustes de UX / navegação (2026-09-07)

| Fatia | Escopo | Status | Patch |
|---|---|---|---|
| **CD-1** | **Cardápio** — `core/utils/currency.ts` (`maskBRL/formatBRL/parseBRL`, normaliza NBSP); campo Valor com **máscara de moeda**; **upload de imagem** funcional (era stub) com preview. | ✅ (11 specs) | `CD-1-cardapio-ux` |
| **NAV-1** | **Menu inferior do fornecedor** — remove links mortos (`/fornecedor/pedidos`, `/fornecedor/mais`, `/fornecedor/servicos/mais`). Delivery: `Início · Cardápio · Restaurante · Perfil · Categorias(→hub)`; Serviços: `Mais`→`Categorias(→hub)`. Specs dos 2 navs reescritos (nome de classe corrigido). | ✅ (5 specs) | `NAV-1-menu-inferior-fornecedor` |
| **AJ-A** | **Conta de recebimento** sai do hub (card solto) → botão no **Perfil** (só fornecedor) → `/fornecedor/mercado-pago`. **Aplica após MP-1.** | ✅ (6 specs) | `AJ-A-conta-recebimento-para-perfil` |
| **SV-1** | **Listagem de serviços com dados reais** — o card estava 100% mockado (`Joelson Silva`, `● Cliente`, `👍 80/👎 20`). Mapeia `positiveReviews/negativeReviews/completedWorks` (já vinham no DTO) no view-model; card mostra nome/categoria/tipo/preço + avaliações reais; foto deixa de ser avatar de pessoa. | ✅ (3 specs) | `SV-1-listagem-servicos-dados-reais` |
| **PZ-1** | **Padronização dos cadastros** — **máscara de moeda** (via `currency.ts`) no valor dos **5** formulários (serviço, produto, aluguel, hospedagem, transporte); criar-produto alinhado ao padrão gray-bg. **Aplica após CD-1.** | ✅ (18 specs) | `PZ-1-padronizacao-cadastros-fornecedor` |
| **CV-1** | **Compra e Venda — botão adicionar** fora do padrão (era "+" no header) → **FAB flutuante** igual às demais categorias (só no modo "meus produtos"). | ✅ | `CV-1-compra-venda-fab` |
| **CV-2** | **Aviso "nenhuma categoria disponível"** nos 4 cadastros afetados pela BE-Q9 (produto, aluguel, hospedagem, transporte) — evita dropdown vazio silencioso. **Aplica após CD-1+PZ-1.** | ✅ (spec em criar-produto) | `CV-2-aviso-sem-categoria` |
| **CV-3** | **Listagem de produtos com dados reais** — card enriquecido no padrão do de serviços (SV-1): **categoria** + **avaliações reais** (`positiveReviews/negativeReviews` do DTO). Sem mock; já usava nome/tipo/preço reais. | ✅ | `CV-3-listagem-produtos-dados-reais` |
| **PF-1** | **Perfil — usabilidade ver/editar** — seções **Dados** e **Endereço** começam em **modo leitura** (campos desabilitados, valor limpo); botão **Editar** abre o formulário com **Salvar/Cancelar** (Cancelar descarta e recarrega). Email segue read-only; Cobrança/Conta de recebimento mantidos. | ✅ (6 specs) | `PF-1-perfil-ver-editar` |
| **PF-2** | **Perfil — scroll** — `.perfil-container` usava `min-height:100dvh` (conteúdo cortado); trocado para `height:100dvh` + `overflow:hidden` e `.perfil-content` rolável (`overflow-y:auto` + touch + safe-bottom), alinhado ao padrão global `.page-container/.page-content`. | ✅ (só SCSS) | `PF-2-perfil-scroll` |

> **Perfil × dados bancários:** a tela `perfil` **não** gerencia conta bancária (isso fica no fluxo Parceiro/Entregador via `/bank-accounts`). O padrão ver/editar do PF-1 pode ser estendido lá se desejado (não solicitado ainda).

### Fase Mapa / Fase 8.4 (ORIENTACOESFRONT §8.4) — MAP-1 (sem dependências)

> Back atualizado (§8.4): coordenadas no endereço (resolve **BE-Q7**), tempo de entrega, período no repasse
> (resolve **BE-F2**), rastreamento por WebSocket (`/deliveries`), Google Maps no front. Ordem do doc: coordenadas → mapa.

| Fatia | Escopo | Status | Patch |
|---|---|---|---|
| **MAP-1a** | **Período no repasse** — `getPayout(period?)` → `?period=day\|week\|month`; seletor Tudo/Dia/Semana/Mês na home do fornecedor; model ganha `period`. Resolve **BE-F2**. | ✅ (2 specs) | `MAP-1a-repasse-periodo` |
| **MAP-1b** | **Tempo de entrega** — `deliveryTimeMin/MaxMinutes` nos DTOs do restaurante; 2 campos no cadastro (validação 1–480, máx≥mín); vitrine mostra "30-45 min" e **omite quando ausente** (5 telas). | ✅ (9 specs) | `MAP-1b-tempo-entrega` |
| **MAP-1c** | **Coordenadas (encanamento)** — `latitude/longitude` (string) em `Response/UpdateAddressDto`; perfil **preserva** as coords ao salvar; `RestaurantAddressDto` + `address?` nos DTOs do restaurante (prontos p/ MAP-2). | ✅ (7 specs) | `MAP-1c-coordenadas-plumbing` |
| **MAP-2a** | **Base Google Maps (sem dep npm)** — chave em `environment.*` (`googleMapsApiKey`, vazia = mapa off c/ aviso); `GoogleMapsLoaderService` (carrega o SDK JS + `places` sob demanda); componente reutilizável **`<app-mapa-endereco>`** (Places Autocomplete + pino arrastável + clique → emite lat/lng). | ✅ (4 specs) | `MAP-2a-google-maps-base` |
| **MAP-2b** | **Mapa no endereço do perfil** — no modo Editar da seção Endereço, mapa centrado nas coords; buscar/mover o pino preenche lat/lng e o Salvar envia (via MAP-1c). | ✅ (8 specs) | `MAP-2b-perfil-endereco-mapa` |
| **MAP-2c** | **Endereço + mapa no cadastro do restaurante** — nova seção de endereço (CEP/rua/nº/bairro/cidade/UF) + `<app-mapa-endereco>`; envia `address{…, lat, lng}` (só se preenchido); `ResponseRestaurantDto.address?`. Com as duas pontas, **o frete varia** (fecha **BE-Q7** na prática). | ✅ (5 specs) | `MAP-2c-restaurante-endereco-mapa` |
| **MAP-3** | **Rastreamento ao vivo** — `DeliveryTrackingService` (WebSocket `socket.io-client` no namespace `/deliveries`, JWT no handshake; eventos `delivery:location`/`delivery:status`, contrato verificado no back `deliveries.gateway.ts`); componente **`<app-mapa-rastreio>`** (mapa read-only que segue o pino do entregador, fallback textual sem chave/posição); na tela de status do pedido do cliente, o mapa liga quando o pedido está **A caminho** (`OnTheWay`), usando a última posição do polling até o 1º evento ao vivo. **GPS do entregador já existia** na base (`status-entrega` → `PATCH /deliveries/:id/location` a cada 15s, 1º envio muda p/ `OnTheWay`). **Requer MAP-2a** (loader do Maps). Adiciona `socket.io-client` (rodar `npm install` ao aplicar). | ✅ (7 specs) | `MAP-3-rastreio-tempo-real` |

> **Ordem MAP:** 1a → 1b → 1c → 2a → 2b → 2c → **3** (verificado em sequência; chain aplica limpo em `origin/integracao` e builda). **Preencher `googleMapsApiKey`** nos `environment.*` para o mapa carregar; **rodar `npm install`** após aplicar o MAP-3 (nova dep `socket.io-client`).
> **Admin de ícones de categoria** e faixas de frete = portal, fora deste app.

> **Categorias (BE-Q9) — seed pronto:** entregue `catalog-categories.seeds.ts` (drop-in do **back-end**) que semeia
> `ProductCategory`/`AccommodationCategory`/`TransportationCategory` (idempotente, padrão do seed de serviço).
> Não dá para "categoria só no front": `POST /products` valida o `categoryId` no banco e não há rota de criar
> categoria — a correção é semear no back. Aplicado o seed, o dropdown popula e o cadastro funciona nas 3 verticais.

---

### Fase Delivery — usabilidade (benchmark iFood / Zé Delivery)

> Revisão completa do fluxo em `docs/analise-fluxo-delivery.md` (backlog priorizado). **Achado-chave:** o lado do
> **cliente já tinha** seletor de adicionais, sacola e `additionIds` no POST — a lacuna era só a **autoria pelo fornecedor**.

| Fatia | Escopo | Specs | Patch |
|---|---|---|---|
| **ADD-1** | **Adicionais no cardápio (fornecedor)** — no form do item (criar/editar): cadastrar/remover adicionais com nome + preço (máscara BRL). Back **já existia** (`POST /restaurants/menu-items/:id/additions`, `PATCH /restaurants/menu-item-additions/:id`; item já retorna `additions[]`). Item novo entra em modo edição p/ liberar os adicionais (rota precisa do id). Remoção = `isActive:false` (não há DELETE). | ✅ (13) | `ADD-1-adicionais-cardapio` |
| **ADD-2** | **Adicionais no pedido (cliente + cozinha)** — a revisão do cliente agora mostra **quantidade + adicionais por item** (corrige bug antigo que só exibia os adicionais do 1º item, numa seção solta); o detalhe do pedido do fornecedor (cozinha) passa a listar os adicionais e a observação (`Obs.:`) de cada item. Tipado `ResponseFoodOrderItemDto.additions` (era `unknown[]`) → `{id,name,price}[]` (bate com o back). Sem mudança de back. | ✅ (8) | `ADD-2-adicionais-no-pedido` |
| **OBS-1** | **Observação por item (cliente)** — campo "Alguma observação?" na tela do item (`cardapio-item`) → guardado no carrinho (`ItemPedido.observacao`) e enviado como `notes` por item no `POST /food-orders` (omitido quando vazio). Fecha o ciclo: o ADD-2 já exibe a `Obs.:` na cozinha. Back já aceitava `CreateFoodOrderItemDto.notes`. | ✅ (10) | `OBS-1-observacao-item` |
| **CART-1** | **Editar a sacola (cliente)** — cada item ganhou **stepper (− / qtd / +)** e **remover** (lixeira); mostra **quantidade + adicionais + observação por item** (corrige aqui o mesmo bug do item[0] que existia na revisão) e o **subtotal da linha** (preço+adicionais×qtd); **estado vazio** ("Sua sacola está vazia" + voltar) e **CONTINUAR desabilitado** sem itens. Carrinho é client-side (`alterarQuantidade`/`removerItem` no `DeliveryService`). | ✅ (13) | `CART-1-editar-sacola` |
| **SEARCH-1** | **Busca + filtros de restaurante (cliente)** — na listagem: busca por nome (já existia) + **chips de filtro** "Aberto agora" / "Entrega grátis" + **ordenação** (Relevância / Melhor avaliação / Menor taxa / Menor tempo) + botão **Limpar** + selo **Fechado** no card. Filtragem/ordenação client-side sobre `GET /restaurants`. View-model `Restaurante` ganhou `aberto` (`isOpen`) e `tempoMinMinutos` (`deliveryTimeMinMinutes`). Sem mudança de back. | ✅ (16) | `SEARCH-1-busca-filtros-restaurantes` |
| **AJ-cat** | **Correções** — (1) dropdown de ordenação ficava **atrás dos cards** (o `overflow-x` da barra recortava) → barra passou a `flex-wrap` + `z-index`; (2) **imagens de categoria quebradas** (o back **não semeia `iconUrl`** nas categorias de restaurante) → `categoria-grid` ganhou **fallback** (placeholder quando sem ícone ou ao falhar o carregamento) que beneficia todas as telas que usam o grid. | ✅ (4) | `AJ-cat-icones-filtro-zindex` |
| **SEARCH-2** | **Busca global de restaurantes na tela de Buscar** — a barra de busca (que só listava categorias e não fazia nada) agora, ao digitar, lista **restaurantes de todas as categorias** com os mesmos chips + ordenação; sem texto, mostra o grid de categorias. Lógica de filtro/ordenação extraída para util puro **`core/utils/restaurant-search.ts`** (reutilizável). Sem mudança de back. **Independente do AJ-cat** (aplica em qualquer ordem). | ✅ (9) | `SEARCH-2-busca-global-restaurantes` |

> **Próximas fatias sugeridas (🟢, back pronto):** **"pedir novamente"** (histórico) · **avaliar pós-entrega**.
> Cupom/agendamento/gorjeta/push exigem back novo → `backend-demandas.md`.
> **Demanda de back (nova):** semear `iconUrl` nas **categorias de restaurante** (`restaurant-category.seeds.ts` não seta ícone — front já tem fallback, mas os ícones reais melhorariam a tela de Buscar).

---

## ▶️ Ordem de aplicação dos patches (resumo)

Fundação → Auth (1..3) → Perfil → Delivery (DC/DF) + fixes → Entregador → Parceiro → Marketplace → Aluguel →
Transporte → Hospedagem/Empregos → Chat → Serviços (S-1..S-5) → **Fase AJ (AJ-1..AJ-6)** → Hub fornecedor →
correções criar-serviço (nome, categoria) → **verticais do fornecedor (FV-1..FV-5)** →
**Mercado Pago (MP-1..MP-3)** → **UX/nav: CD-1, NAV-1, MP-1→AJ-A** (CD-1/NAV-1 independentes; AJ-A depois do MP-1) →
**SV-1** (indep.) · **CV-1** (indep.) · **CD-1→PZ-1** (mask nos 5 forms) · **CD-1+PZ-1→CV-2** (aviso sem categoria) ·
**CV-3** (indep.) → **PF-1 · PF-2** (perfil, aplicados @ `eec245d`) → **MAP-1a→1b→1c** → **MAP-2a→2b→2c** → **MAP-3** (fase mapa).
**Aplicado @ `290db7c`:** **MAP-1a→…→2c→3** (fase mapa completa; `socket.io-client` instalado via `npm install`).
Pendente de aplicação: **CV-3** (indep.), **AJ-layout** (2 `.scss`), **AJ-maps-key** (chave do Google), **AJ-cat** (ícones+z-index) e **SEARCH-2** (busca global). *(ADD-1/ADD-2/OBS-1/CART-1/SEARCH-1 aplicados; base @ `82c2730`.)*
`origin/integracao` @ `82c2730`.

> **AJ-layout** (`AJ-layout-periodos-scroll-restaurante`): (1) `.home-f-periodos` ganhou `margin: 0 16px` p/ alinhar
> os chips **Tudo|Dia|Semana|Mês** às laterais dos cards; (2) `.rest-container` passou de `min-height` p/ `height: 100dvh`
> + `overflow: hidden` (mesmo padrão de `.page-container`), liberando a rolagem interna do form (endereço/mapa acessíveis).

> **Mapa "indisponível":** é esperado enquanto `googleMapsApiKey` estiver **vazia** nos `environment.*` — o mapa
> renderiza normalmente assim que a chave for preenchida (habilitar **Maps JavaScript API** + **Places API** no Google
> Cloud, com billing; e liberar o domínio nas restrições de referenciador HTTP da chave). Sem chave, cai no fallback textual.

> Cada fatia foi entregue como patch individual. A `integracao` do cliente é a fonte da verdade do estado aplicado.
> **Demandas de back-end recentes:** **BE-Q8** (upload `500` — S3 sem credencial/sem fallback) e **BE-Q9**
> (categorias de produto/hospedagem/transporte **não semeadas** → dropdown vazio; CV-2 dá o aviso, o fix é semear no back).

---

## 🧭 Como retomar (checklist para nova sessão)

1. Ler este arquivo + `api-contract-ref.md` + `backend-demandas.md`.
2. Garantir que `origin/integracao` reflete o estado local aplicado (o cliente empurra); senão, basear novas
   fatias no estado que o cliente confirmar.
3. Para gerar patch novo: worktree limpo na base aplicada → editar → `ng build` + specs isolados → `git diff`.
4. **Nunca** commitar/pushar; entregar patch (um por fatia) + docs drop-in.

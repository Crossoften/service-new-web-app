# 📊 STATUS DO PROJETO — Auditoria & Integração Service App

> **Arquivo mestre de progresso e retomada.** Atualizado a cada passo. Se a sessão renovar/reiniciar,
> **leia este arquivo primeiro** — ele resume o que foi decidido, feito e o que falta.
>
> **Última atualização:** 2026-09-08 · **Fase atual:** 🎉 Integração completa + verticais do fornecedor (FV-1…FV-5)
> + **Mercado Pago** (MP-1…MP-3) + **Fase Mapa (MAP-1…MAP-3, rastreamento ao vivo)** aplicada + ajustes de layout.
> **Em andamento:** fluxo delivery — **adicionais no cardápio** (back pronto, front a fazer) + melhorias de usabilidade.
>
> **Base de código:** `origin/main` @ `f4931bf`. **Branch de entrega (cliente):** `integracao` (@ `24c4486`).
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
| **Garantia de serviços** | (Q-A) garantia aprovada gera **Work de garantia vinculado** rastreável (Opção B) + vira **número no perfil do fornecedor**; (Q-B) recusa é **decisão final** do fornecedor, só **listada no admin**; (Q-C) validade nasce **na conclusão** (`warrantyExpiresAt`); (Q-D) **sem** notificação por ora; (Q-E) garantia **sem custo** (`serviceValue=0`). Execução (Work de garantia) e contador dependem de back novo (BE-W1/BE-W7). |

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
| `auditoria-servicos-orcamentos-garantia.md` | Auditoria 3-fontes de Serviços/Orçamentos/Trabalhos + desenho da **garantia** (decisões Q-A…Q-E, BE-W1…W7) |
| `auditoria-ux-servicos.md` | Auditoria de **UX** de Serviços (cliente+fornecedor) + proposta (menu Atividade, painel fornecedor, chat) e decisões UX-A…C/Q-UX1 |

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
| **AJ-buscar-v2** | **Ajustes na tela de Buscar (v2)** — (1) filtros/ordenação **sempre visíveis** (antes só ao digitar; resultados aparecem com busca **ou** filtro ativo); (2) **fim do endereço mockado** "Rua Tuiucue" — em **`categoria-delivery` E `listagem-delivery`** (as duas telas passavam o mock fixo) + default do `header-busca` limpo; agora mostra o **endereço real do cliente** (`GET /profile/me`), "Adicionar endereço" quando vazio, e tocar leva ao **/perfil** (define com o mapa). ⚠️ **Substitui o `AJ-buscar` (v1), que não chegou a ser aplicado** e não cobria a tela de listagem. | ✅ (15) | `AJ-buscar-v2-filtros-endereco` |
| **REORDER-1** | **Pedir novamente (cliente)** — botão em cada pedido do histórico remonta a sacola pelo **cardápio atual** do restaurante (`repetirPedido` no `DeliveryService`: quantidade + adicionais por id + observação; itens fora do cardápio são ignorados e avisados) e leva à sacola. Sem mudança de back. | ✅ (13) | `REORDER-1-pedir-novamente` |
| **RATE-1** | **Avaliar pós-entrega (cliente)** — quando o pedido fica **`Delivered`**, a tela de status mostra um card de avaliação (estrelas 1–5 + comentário opcional) → `POST /restaurants/:id/reviews` (reusa `avaliarRestaurante`). Trata **409** (já avaliou → esconde o form) e valida a nota. Fecha o ciclo do delivery. Sem mudança de back. | ✅ (9) | `RATE-1-avaliar-pos-entrega` |

> **Próximas fatias sugeridas (🟢, back pronto):** **"pedir novamente"** (histórico) · **avaliar pós-entrega**.
> ✅ **Backlog 🟢 do delivery concluído** (ADD-1/2, OBS-1, CART-1, SEARCH-1/2, REORDER-1, RATE-1). Os itens que
> exigem back novo estão **documentados em `backend-demandas.md`** como **BE-Q10** (cupom) · **BE-Q11** (agendar) ·
> **BE-Q12** (gorjeta) · **BE-Q13** (push) · **BE-Q14** (ícones das categorias de restaurante).
> **Demanda de back (nova):** semear `iconUrl` nas **categorias de restaurante** (`restaurant-category.seeds.ts` não seta ícone — front já tem fallback, mas os ícones reais melhorariam a tela de Buscar).

---

### Fase Descoberta — busca/filtros nas demais verticais (VF-1…)

> Levar a experiência de busca/ordenação do delivery para as **outras verticais** (auditoria em 3 grupos:
> **Grupo A** = mesmo shape de item — produtos/aluguel/transporte/hospedagem; **Serviços** e **Empregos** = bespoke).

| Fatia | Escopo | Specs | Patch |
|---|---|---|---|
| **VF-1** | **Ordenação nas vitrines do Grupo A** (Compra-venda, Aluguel, Transporte, Hospedagem) — cada uma ganhou seletor **Ordenar** (Relevância / Menor preço / Maior preço / Melhor avaliação), aplicado client-side sobre a lista já carregada. Busca por texto já existia (via API). Extraído util puro **`core/utils/item-search.ts`** + componente compartilhado **`<app-ordenacao-itens>`** (reutilizados pelas 4 telas). Sem mudança de back. | ✅ (8) | `VF-1-busca-filtros-verticais-grupoA` |
| **VF-2** | **Ordenação em Serviços** — a listagem de prestadores (que já tinha busca por nome/profissão) ganhou o mesmo **`<app-ordenacao-itens>`**, com ordenação específica do VM `Prestador`: **Melhor avaliação** (gostei − não gostei) e **Menor/Maior preço** (preço opcional vai ao fim). Sem mexer no mapper/back. *(Depende do VF-1 — usa o componente compartilhado.)* | ✅ (2) | `VF-2-servicos-ordenacao` |
| **EMP-1** | **Empregos: listagem antes do cadastro** — no **hub do fornecedor**, "Empregos" ia direto para o formulário de publicar vaga (`/empregos/vaga/nova`), diferente das outras verticais (que abrem uma listagem). Agora abre **"Minhas vagas"** (`/empregos/minhas-vagas`) — a `ListagemEmpregos` ganhou modo `mine` (route data → `scope: 'Mine'`, título "Minhas vagas", botão **+** para publicar). Vitrine pública (`/empregos/vagas`) inalterada. Sem mudança de back. | ✅ (4) | `EMP-1-listagem-antes-do-cadastro` |
| **VF-3** | **Busca + filtros em Empregos** — a tela **não tinha busca nenhuma**; agora tem **busca** (cargo/empresa), **chips por tipo de contrato** (Todos/CLT/PJ/Freelance/Temporário) e chip **"Mais recentes"** (ordena por `createdAt`). Tudo client-side sobre `GET /jobs`. Bespoke (shape distinto), **independente do VF-1**. Sem mudança de back. | ✅ (2) | `VF-3-empregos-busca-filtros` |

> ✅ **Descoberta levada a todas as verticais de vitrine.** (Marketplace/Aluguel/Transporte/Hospedagem via VF-1;
> Serviços via VF-2; Empregos via VF-3.) Melhorias futuras possíveis: filtro por **tipo de serviço** (Online/Presencial/
> Domicílio — exige estender o mapper `Prestador`) e faixa de preço; ficam anotadas como evolução, não bloqueiam.

---

### Fase ORIENTACOESFRONT v3 — alinhamento ao back (item 14…)

> Base: `ORIENTACOESFRONT.md` v3 (doc vivo do back). A **seção 10** dá a ordem sugerida. Começando pelo **item 14**,
> o **único que quebra tela que hoje funciona**. Fatias seguintes (15..24) entram uma a uma, sempre auditando antes.

| Fatia | Escopo | Specs | Patch |
|---|---|---|---|
| **OF-14** | **Serviço sem preço (§8.8)** — `Service.price` virou **opcional** no cadastro e na resposta. Model: `ServiceListItemDto.price?` e `CreateServiceDto.price?`; `UpdateServiceDto` aceita `price: number \| null` (**`null` apaga** o preço). Mappers (`service-catalog`) mapeiam preço ausente para `undefined` (nunca `NaN`) → `ServicoFornecedor.valor?` e `Prestador.preco?`. Tela do **fornecedor**: lista mostra **"Sob orçamento"** (antes caía em `R$ 0,00`); form de criar/editar deixa o **valor opcional** (em branco = sob orçamento; POST omite `price`, PATCH manda `price: null`). Telas do **cliente** (listagem/detalhe de prestador) já **não exibiam** preço — só ordenam (VF-2 já trata preço ausente ao fim). Sem mudança de back. | ✅ (9) | `OF-14-service-price-opcional` |
| **OF-15** | **Estorno de pagamento (§8.7)** — `PaymentStatusEnum` ganhou **`Refunded`** ("entrou e voltou", ≠ `Cancelled` que nunca entrou). Enum `PaymentStatus` + `Refunded`. **Cliente** (`status-pedido`): `pagamentoLabel` passa a distinguir estorno → **"Estornado"** (antes caía no `default` vazio) em vermelho; `podePagar` continua exigindo `Pending` (estornado **não** reabre pagamento). **Fornecedor** (`detalhes-pedido`): a linha "Status do pagamento" (antes só p/ dinheiro) passa a aparecer **também em pagamento online quando estornado** — é caso de suporte (já produziu/entregou e o dinheiro voltou), com label "Estornado" em vermelho. Sem `Record` exaustivo afetado; marketplace/works não exibem `PaymentStatus` cru. Sem mudança de back. | ✅ (17) | `OF-15-payment-refunded` |
| **OF-16** | **`Cancelled` ≠ `Rejected` no orçamento (§8.8)** — `BudgetStatusEnum` ganhou **`Accepted`** e **`Rejected`** (terminais). Enum `BudgetStatus` + `Accepted`/`Rejected`. O VM `StatusOrcamento` (que tinha só 3 estados e jogava `Accepted`/`Rejected` no `default` = "Em andamento", e mostrava `Cancelled` como "Finalizado" verde) foi expandido para **`nao_respondido`/`em_andamento`/`aceito`/`recusado`/`cancelado`**; `statusVm` mapeia cada `BudgetStatus` ao seu estado. Tela de **orçamentos do cliente**: rótulos/cores distintos — **Aceito** (verde), **Recusado** (vermelho), **Cancelado** (cinza); aba "Respondidos" inclui recusado mas **exclui cancelado** (desistir ≠ responder). Só exibição — a **ação de recusa** (`PATCH /budgets/:id/reject`) é o OF-17. Sem mudança de back. | ✅ (4) | `OF-16-budget-status-cancelled-rejected` |

| **OF-17** | **Aceite e recusa de orçamento (§8.8)** — a **rota de recusa** é nova: `PATCH /budgets/:id/reject { rejectReason? }` (só o solicitante, só em `Responded`; erros 400/403/409). Model `BudgetDto` ganhou `acceptedAt`/`rejectedAt`/`rejectReason`; `RejectBudgetDto` novo; `BudgetService.rejeitar(id, dto)`; VM `Orcamento.motivoRecusa` mapeado. Tela de **aprovação do cliente** (`aprovar-orcamento`): botões **APROVAR/RECUSAR** aparecem só quando `Responded` (`podeDecidir`); recusa abre campo de **motivo opcional** → `PATCH …/reject` e volta à lista; orçamento já terminado mostra **banner de desfecho** (Aceito/Recusado/Cancelado) + o motivo, quando recusado. Erros da API (400/403/409) exibidos na tela. Sem mudança de back. | ✅ (6) | `OF-17-budget-accept-reject` |

| **OF-18** | **Gorjeta + cupom na sacola (§8.9)** — 3 campos opcionais entraram no `POST /food-orders`; esta fatia cobre **`tip`** e **`couponCode`** (agendamento `scheduledFor` fica no item 23). Model `CreateFoodOrderDto` ganhou `tip?`/`couponCode?`. Novos **`core/models/coupon.ts`** + **`core/services/coupon.ts`** (`CouponService.validar` → `POST /coupons/validate`). `DeliveryService`: estado de carrinho `gorjeta`/`cupom`, `setGorjeta` (0–1000), `setCupom`, `calcularSubtotal`, `calcularTotal` (subtotal + frete + gorjeta − desconto, nunca negativo); `buildCreateFoodOrderDto` envia `tip` só quando >0 e **só o `couponCode`**. Tela da **sacola**: chips de gorjeta + valor livre; campo de cupom com **Aplicar** (chama `validate`, mostra desconto/descrição ou o erro da API) e Remover; desdobramento Subtotal/Gorjeta/Cupom/Total. **Revisão** mostra o mesmo desdobramento (total já somava via `calcularTotal`). ⚠️ **`validate` é só prévia** — o desconto **não** é enviado como entrada; o back recalcula na criação. Sem mudança de back. | ✅ (12) | `OF-18-sacola-gorjeta-cupom` |

| **OF-19** | **Maquininha própria do restaurante (§8.6)** — o estabelecimento pode cobrar cartão na maquininha dele, na entrega. **Fornecedor**: model `usesOwnCardMachine?` + `UpdateCardMachineDto`; `FornecedorService.atualizarMaquininha` → `PATCH /restaurants/me/card-machine`; na tela do restaurante, seção Maquininha com **termo antes do aceite** (ligar exige `acceptResponsibility:true`; desligar não exige) e status "Ligada". **Cliente**: VM `Restaurante.usaMaquininhaPropria` (de `usesOwnCardMachine`); a **revisão** avisa quando cartão+maquininha ("pago na entrega, sem checkout online"); na **tela de status**, o `pagar()` trata o **400** do `/pay` por pedido fora da plataforma → esconde "Pagar", marca `pagamentoNaEntrega` e avisa. ⚠️ Contrato conferido no back: a rota de confirmação real é **`confirm-payment`** (o doc diz `confirm-cash-payment`) — mantido o existente. Sem mudança de back. | ✅ (7 novos/44 no lote) | `OF-19-maquininha-propria` |

| **OF-20** | **Carteira do entregador (§8.5, item 20)** — `GET /deliveries/me/earnings` ganhou `available` (já ganho, não repassado — o que a plataforma deve) e `paid` (`available + paid = total`). Novo `core/models/earnings.ts`; `EntregadorService.ganhos()` → VM `GanhosEntregador { aReceber, jaPago, dia, semana, mes, total }`. Na **home do entregador**, o card "Ganhos — Em breve" (mock morto `getFaturamento`, BE-17) virou uma **carteira real**: `aReceber` em destaque + já repassado + total (histórico) + aviso "pedidos em dinheiro são pagos na entrega e não entram aqui" (§8.5). Sem mudança de back. | ✅ (5) | `OF-20-carteira-entregador` |

| **OF-21** | **Chave Pix no cadastro bancário (§8.5, item 21)** — `POST`/`PATCH /bank-accounts/me` aceitam `pixKeyType` (`Cpf·Cnpj·Email·Phone·Random`) e `pixKey`, **opcionais e que andam juntos** (um sem o outro = 400). Enum `PixKeyType`; model `Create/Response BankAccountDto` + campos Pix. Form **`novo-banco`** (conta única, usado por parceiro/entregador): dropdown de tipo (com "Nenhuma") + campo da chave, **validação client-side** de que tipo e chave vão juntos (evita o 400), enviados só quando ambos preenchidos (com máscara — o back normaliza); dica "é por onde você recebe seus repasses". Sem mudança de back. | ✅ (4) | `OF-21-pix-cadastro-bancario` |

| **OF-23** | **Agendamento do pedido (`scheduledFor`, §8.9)** — 3º campo opcional do `POST /food-orders`. Model `CreateFoodOrderDto.scheduledFor?` + `ResponseFoodOrderDto.scheduledFor?`. `DeliveryService`: estado `agendamento` no carrinho, `setAgendamento`, envio no `buildCreateFoodOrderDto` só quando definido (ISO). **Cliente** (sacola): seção "Quando entregar" com **Agora / Agendar** + `datetime-local` (mínimo = agora); valida **futuro** antes de continuar e guarda em ISO. **Restaurante**: VM `PedidoFornecedor.agendadoPara` mapeado de `scheduledFor`; **badge "🗓 Agendado para…"** no kitchen list (home-fornecedor) e linha "Agendado para" no detalhe do pedido — separa o que é para já do que é para depois (o campo **não** muda o status). Sem mudança de back. | ✅ (5) | `OF-23-agendamento-pedido` |

| **OF-24** | **Notificações push / PWA (§8.10)** — o back já envia; o trabalho é do navegador. SW já configurado (`provideServiceWorker`). Novos `core/models/push.ts` + `core/services/push.ts` (usa `SwPush`): `publicKey()` → `GET /push/public-key`; `enviarInscricao` → `POST /push/subscriptions` (idempotente por `endpoint`); `removerInscricao` → `DELETE /push/subscriptions` (via `ApiService.deleteBody` novo). `ativar()` **só pede permissão depois de confirmar `publicKey`** — se vier **`null`** (VAPID não configurado), retorna `sem-vapid` **sem tocar na permissão** (não queima o "sim"); trata `indisponivel` (SW off/dev) e `negado`. **Perfil**: seção "Notificações" com botão **Ativar** (gesto do usuário, nunca no load) + status; `sair()` chama `push.desativar()` (cancela a inscrição + `DELETE`) **antes** de deslogar. Sem mudança de back. | ✅ (14 no lote) | `OF-24-push-pwa` |

> ✅ **Fase ORIENTACOESFRONT v3 concluída** (itens 14-24). Só o **item 22** (repasses do admin) não virou código — é
> painel admin, fora deste PWA (ver abaixo). Todo o restante do doc já estava ✅ ou foi coberto.

> **Fora do escopo deste app — item 22 (repasses do admin, §8.5):** as rotas `GET/POST /admin-delivery-payouts…`
> (com `refundedDeliveries`/`refundedAmount` do §8.7) exigem papel de **admin + permissão `Financial`** e vivem num
> **painel administrativo**, que **não existe neste PWA** (não há nenhuma tela `admin` em `features/`). Documentado em
> `backend-demandas.md` (BE-Q15) como tela de painel admin, a ser construída onde o admin operar — não nesta base.

---

## 🛡️ Garantia de serviços — Fatia 1 (respondível, só front)

Primeira fatia da feature de garantia (ver `auditoria-servicos-orcamentos-garantia.md`). **Sem back novo** —
usa o que a API já expõe (`request-warranty`, `respond-warranty`, campos de garantia no `WorkDto`).

| Patch | Escopo |
|---|---|
| **GAR-1** | **(a)** view-models de Work expõem `garantiaStatus`/descrições/datas (`work.ts`) + helpers `garantiaStatusLabel/Class`. **(b)** Fornecedor **responde garantia** em `detalhes-trabalho` (Aprovar/Recusar + justificativa → `PATCH /works/:id/respond-warranty`) — antes o método `responderGarantia()` era órfão. **(c)** Cliente solicita garantia por **modal** (substitui `window.prompt`) em `detalhes-solicitacao`, com gate por validade/pendência, e vê o **status/resposta**. **(d)** Badges de status de garantia (Pendente/Aprovada/Recusada) nas listas `solicitacoes` e `trabalhos-fornecedor`. |

- **Fora desta fatia (próximas):** validade na conclusão (enviar `warrantyExpiresAt` no `finish`); pagamento MP do
  serviço; execução do reparo (Work de garantia) + contador no perfil — estes dois dependem de **BE-W1/BE-W7**.
- **Anexos na solicitação:** adiados junto do upload (bloqueado por **BE-Q8**, S3 sem credencial/fallback).
- Testes: specs de `detalhes-trabalho` e `detalhes-solicitacao` cobrindo aprovar/recusar/solicitar garantia (verdes).
  Falhas pré-existentes de ambiente (Google Maps/título) não relacionadas.

### Pagamento do serviço — checkout Mercado Pago (patch MP-SVC-1)

O back mudou o pagamento de Work para **checkout Mercado Pago** (`POST /works/:id/pay` com corpo `{ payerEmail? }`
→ `{ checkoutUrl, work }`; confirmação assíncrona por webhook). O front estava no **contrato antigo** (seletor de
método + `PayWorkDto` com dados de cartão + mapeamento errado `debito→CreditCard`/`dinheiro→BankSlip`).

| Patch | Escopo |
|---|---|
| **MP-SVC-1** | **(a)** `PayWorkDto` vira `{ payerEmail? }` + `PayWorkResponseDto { checkoutUrl, work }` (`models/work.ts`). **(b)** `WorkService.pagar(id, payerEmail?)` retorna o checkout (`services/work.ts`). **(c)** `pagamento-servico` reescrito: remove o seletor de método (a forma é escolhida no MP), mostra aviso do checkout + detalhes, botão **PAGAR COM MERCADO PAGO** → `window.location.href = checkoutUrl`; gate `podePagar` (Finished + não pago); trata erro "fornecedor sem conta MP" com a mensagem da API. Mesmo padrão do delivery (`status-pedido`). |

- **Confirmação:** o `Work.status` continua `Finished` após pagar; "pago" vem do `Payment` (via webhook) — coberto por
  **BE-W6** (avaliar expor estado "pago" no Work). Sem status de pagamento em tela por ora (o back não expõe no Work).

### Garantia — validade na conclusão (patch GAR-2, Fatia 2)

Decisão Q-C: a validade da garantia nasce **na conclusão**. Antes, o `finish` só enviava `completionDescription`
e o `warrantyExpiresAt` **nunca era definido** pelo front (garantia nunca ficava válida). **Sem back novo**
(`FinishWorkDto.warrantyExpiresAt` já existe).

| Patch | Escopo |
|---|---|
| **GAR-2** | **(a)** `WorkService.prazoGarantiaISO(qtd, unidade, base?)` calcula `warrantyExpiresAt` (ISO) a partir de agora + prazo (Meses/Dias); retorna `undefined` se não houver prazo (garantia opcional). **(b)** `detalhes-trabalho` (step "em andamento"): campo **Tempo de garantia** (número + unidade) ao concluir; `enviarResposta()` envia `warrantyExpiresAt` no `finish`. |

- Habilita a Fatia 1: com `warrantyExpiresAt` setado, `isUnderWarranty` fica `true` na janela e o cliente pode
  **acionar** a garantia (o botão da Fatia 1 depende de `sobGarantia`).
- Testes: `detalhes-trabalho.spec` cobre finish **com** prazo (envia ISO futuro) e **sem** prazo (não envia).

---

## 🧭 Usabilidade — Serviços (fatias UX)

Decisões em `auditoria-ux-servicos.md` (UX-A lançar anexos; **UX-B Atividade unificada**; **UX-C painel do
fornecedor**; Q-UX1 mesma conversa segue no trabalho).

| Patch | Escopo |
|---|---|
| **UX-NAV-CLIENTE (Fatia 1)** | **(a)** `BottomNavClienteComponent` compartilhado (**Início · Atividade · Perfil**; Mensagens entra com **BE-Q5**) — substitui os navs hardcoded em `home`, `solicitacoes`, `orcamentos`. **(b)** Nova tela **`/atividade`**: central cross-vertical que agrega **Serviços** (orçamentos `Pending/Responded/WaitingInformation` + solicitações `em_andamento/em_garantia`, sem jargão) e **Delivery** (pedidos ativos), com filtros Todos/Serviços/Delivery e destaque "Responder" para o que precisa de ação. Cada card leva ao detalhe certo (`aprovar-orcamento`/`detalhes-solicitacao`/`delivery/status`). |

- **Não removido nesta fatia:** as telas `/servicos/solicitacoes` e `/servicos/orcamentos` seguem acessíveis
  (agora com o nav novo, aba Atividade). Aposentá-las (redirect → `/atividade`) fica para fatia posterior.
- **Fora desta fatia:** cards de atividade de Serviços **na home** (Fatia 2, UX-HOME-SERVICOS); nav nas telas
  de categoria/listagem de serviços; painel do fornecedor (Fatia 3).
- Testes: `atividade.spec` (agregação, filtros, esconder terminais, tolerância a falha) + build verde.
  Falhas pré-existentes de ambiente (Maps/título) não relacionadas.

---

## ▶️ Ordem de aplicação dos patches (resumo)

Fundação → Auth (1..3) → Perfil → Delivery (DC/DF) + fixes → Entregador → Parceiro → Marketplace → Aluguel →
Transporte → Hospedagem/Empregos → Chat → Serviços (S-1..S-5) → **Fase AJ (AJ-1..AJ-6)** → Hub fornecedor →
correções criar-serviço (nome, categoria) → **verticais do fornecedor (FV-1..FV-5)** →
**Mercado Pago (MP-1..MP-3)** → **UX/nav: CD-1, NAV-1, MP-1→AJ-A** (CD-1/NAV-1 independentes; AJ-A depois do MP-1) →
**SV-1** (indep.) · **CV-1** (indep.) · **CD-1→PZ-1** (mask nos 5 forms) · **CD-1+PZ-1→CV-2** (aviso sem categoria) ·
**CV-3** (indep.) → **PF-1 · PF-2** (perfil, aplicados @ `eec245d`) → **MAP-1a→1b→1c** → **MAP-2a→2b→2c** → **MAP-3** (fase mapa).
**Aplicado @ `290db7c`:** **MAP-1a→…→2c→3** (fase mapa completa; `socket.io-client` instalado via `npm install`).
Pendente de aplicação: **CV-3** (indep.), **AJ-layout** (2 `.scss`), **AJ-maps-key** (chave do Google), **AJ-buscar-v2** (filtros sempre visíveis + endereço real nas 2 telas — substitui o AJ-buscar não aplicado) e **VF-2/VF-3** + **EMP-1** (Serviços/Empregos + listagem de empregos no hub). *(…/VF-1 aplicados; base @ `24c4486`.)*
`origin/integracao` @ `24c4486`.

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

# Demandas de Back-end — Auditoria (Fluxo + Ata + Swagger)

> Documento consolidado a partir de **três fontes**, na ordem de prioridade do projeto:
> 1. **Documentação funcional** — `fluxoserviceapp.md` (mapa de telas) + **Ata da reunião com o cliente (24/06/2026)**.
> 2. **Swagger/OpenAPI** — `Documentação da API Projeto Service.` (NestJS 10, base `https://homolog.crosoften.com:8029`, prefixo `/v1`).
> 3. **Código Angular** (`service-app`).
>
> **Escopo:** apenas pendências do **Back-end**. Nenhuma alteração de API é feita pelo Front. Correções de FE seguem por patches.
> **Contexto (ata):** projeto ~70% concluído; os 30% restantes = integração FE↔BE + testes. Cadastro real ainda desativado (tudo simulável).

---

## 📌 Pendências abertas — topo vivo (atualizado 2026-10-27)

> **Update de 27/10 (fim do dia) — BE entregou as 5 demandas; front consumiu.**
> O back (`swagger.json` + `ORIENTACOES-FRONT-27-10.md`) resolveu tudo o que estava aberto nesta rodada e o front já
> está ligado:
> - **`BE-INFLUENCER-CODE-1` ✅** — `referralCode` passou a ser gerado na 1ª leitura de `/referrals/me(/summary)`. Front já lê de lá (nada a mudar).
> - **`BE-DELIVERY-ROUTE-1` ✅** — coordenadas vêm em `foodOrder.restaurant.address` (coleta) e `foodOrder.deliveryAddress` (entrega). Front: novo `MapaRotaComponent` (Directions coleta→entrega) + endereços escritos + fallback quando faltam coords. Depende de ops: **Directions API** habilitada na chave (SEC-1).
> - **`BE-BOOK-REJECT-1` / `BE-RENT-REJECT-1` ✅** — `rejectReason` obrigatório na recusa (`respond`) e retornado. Front: motivo obrigatório no diálogo + exibição do motivo.
> - **`BE-COMM-REJECT-1` ✅** — `rejectReason` devolvido na negociação. Front: exibe no detalhe (sem mudança no envio).
> - **Delivery — comissão por pedido (produto novo):** aviso de assinatura + `{X}%` na criação do restaurante, lendo `deliveryCommissionRate` do perfil (0 é válido). Painel de payouts (`/restaurants/me/payouts`) já era consumido na `home-fornecedor`.
> - **Pendente só ops: `SEC-1`** (restringir a chave do Maps + habilitar Directions API).

> **Update de 27/10 — recebimento do fornecedor (Mercado Pago) ✅ resolvido pelo BE, front ligado.**
> `GET /profile/me` passou a trazer **`mercadoPagoLinked: boolean`** no perfil de fornecedor
> (`f5f6ce82-swagger.json`). `false` = nenhum cliente consegue pagar nada dele — **nada bloqueia** (ele assina e
> publica normalmente), só o **recebimento** não funciona. Front: **aviso persistente** na `home-fornecedor`
> enquanto `mercadoPagoLinked === false`, levando ao vínculo (tela `/fornecedor/mercado-pago`, que já usava
> `GET /v1/mercado-pago/connect-url` → `POST /v1/mercado-pago/oauth/callback`); e indicador de status
> (conectado × pendente) na seção "Conta de recebimento" do perfil. `ResponseProfileDto` ganhou
> `mercadoPagoLinked?`. O push/WhatsApp ao assinar sem vínculo é responsabilidade do BE (fora do front).

> **Update de 27/10 (varredura geral — entregador) — nova demanda `BE-COURIER-AVAILABILITY-1`.**
> A `home-entregador` tinha um toggle **Ativo/Inativo** (status operacional) que só mexia num campo local
> (`statusOperacional`), sem nenhuma chamada à API — o entregador marcava "Inativo" achando que tinha ficado
> offline, mas o back nunca ficava sabendo e as corridas continuavam chegando. **Não há endpoint de
> disponibilidade do entregador no Swagger** (`/v1/deliveries/available` lista *corridas* disponíveis, não o
> status do entregador; `UpdateProfileDto` não tem campo de disponibilidade; "Online" no Swagger é só
> `ServiceTypeEnum`). **Decisão de front:** o toggle foi mantido visível porém **desabilitado** com aviso
> "Controle de disponibilidade em breve", para não dar falsa sensação de ter saído de operação.
> **Demanda de BE:** expor disponibilidade do entregador — p.ex. `PATCH /v1/deliveries/me` `{ isAvailable }`
> (ou campo `isAvailable`/`isOnline` no perfil do entregador) retornando o estado atual, e **filtrar a fila de
> corridas por esse estado**. Quando existir, o front liga o toggle a esse endpoint.
>
> **✅ RESOLVIDO pelo BE (27/10, `dca2e47a-swagger.json`) — front já ligado.** Contrato confirmado no swagger:
> - Alternar: `PATCH /v1/deliveries/me/availability` com `{ isAvailable: boolean }` (`UpdateCourierAvailabilityDto`),
>   respondendo `ResponseCourierAvailabilityDto { isAvailable }` — o front usa o estado da resposta, sem reconsultar.
> - Estado inicial: `isAvailable` em `GET /profile/me` (só no perfil de entregador; ausente → assume disponível).
> - Indisponível: `GET /deliveries/available` devolve fila vazia (não erro) e `PATCH /deliveries/{id}/accept` responde
>   **409 com mensagem pronta** — a tela já exibe `err.message`, então o aviso aparece sem código extra.
> - Entregadores já existentes começam disponíveis.
>
> **Front:** `home-entregador` lê `isAvailable` do perfil, o toggle **saiu do desabilitado** e agora faz o PATCH
> (`EntregadorService.definirDisponibilidade`); ao voltar a disponível, recarrega a fila. `ResponseProfileDto`
> ganhou `isAvailable?`. Nada mais pendente nesta demanda.

> **Update de 27/10 (varredura geral — conclusão).** Varri todas as jornadas (cliente, fornecedor, entregador,
> parceiro e as verticais aluguel/hospedagem/transporte/empregos/marketplace/chat) atrás de afordâncias mortas,
> estados ausentes e navegação quebrada. **Só gerou UMA demanda de back: `BE-COURIER-AVAILABILITY-1`** (acima).
> Todo o resto foi **correção de front** (entregue por patches `varredura-R1…R5`), sem tocar em contrato de API:
> - **Identidade real** no header de telas que mostravam nome/foto fixos (`status-entrega`, `trabalhos-entregador`,
>   `home-parceiro`) — passam a ler `GET /profile/me`.
> - **Estados ausentes** (carregando/erro/vazio) em telas que setavam os campos mas nunca os renderizavam, fazendo
>   erro de API aparecer como "lista vazia": `home-fornecedor`, `listagem-servicos-fornecedor`,
>   `trabalhos-fornecedor`, `detalhes-trabalho`, `home-parceiro`, `saldo`, `listagem-servicos` e `categoria-hospedagem`.
> - **Anexos do cliente** em `detalhes-trabalho`: o botão de download era morto e a `fileUrl` era descartada no
>   mapeamento — agora é link direto (`fileUrl` absoluta da API, usada como está).
> - **Exclusão com confirmação** no cardápio (`gerenciar-cardapio`), alinhando ao padrão de produtos/vagas.
> - **Afordâncias mortas removidas** (filtros sem handler, itens de menu sem destino, FAB de anexo, botões REVISÃO/
>   AJUDA/sinos pontuais) e **"Ver mais" do fornecedor** tornado funcional (expande a lista in-place, já que não há
>   tela de lista de pedidos). **Nada no back.**

> **Update de 27/10 — auditoria de jornadas (cliente↔fornecedor):**
> - Serviços §2.1 (fornecedor pede mais informações) e §2.2 (cliente responde) — **resolvidos no front** (feedback/loading no pedido; cliente vê o pedido no detalhe e responde pela sala de chat do orçamento).
> - Hospedagem §2.3 (recusa de reserva) — **aberta demanda de back `BE-BOOK-REJECT-1`**: a recusa precisa aceitar/retornar um **motivo** (hoje `RespondBookingDto` só tem `status`). Decisão do cliente: **justificativa obrigatória** → o front fica bloqueado até o contrato existir. Ver seção abaixo.
> - Compra-venda e Aluguel (recusa) — **confirmação antes de recusar/cancelar entregue** (componente compartilhado). A justificativa estruturada abre as demandas `BE-RENT-REJECT-1` (aluguel, sem campo de motivo) e `BE-COMM-REJECT-1` (compra-venda aceita `message` mas não devolve). Ver seção abaixo.
> - As duas demandas de serviços (`BE-SRV-URL-1`, `BE-SRV-MEDIA-1`) foram **resolvidas** (branch `ajustes-gerais`, `e4fb1a4`) — ver tabela de resolvidos.

> **Update de 26/10:** resolvido o **CORP** que travava a exibição de mídia (ver tabela de resolvidos).

> **Update do back em 19/10** (branch `ajustes-gerais`, commit `05ad788`; `swagger.json` + `ORIENTACOESFRONT.md`
> atualizados): **todos os bloqueios de backend foram resolvidos ou já estão no contrato.**
>
> **Update do front em 21/10:** as **4 fatias de front** do contrato de 19/10 estão **todas entregues e verdes**
> (ver tabela abaixo). **Não resta item de front conhecido** — só o item de ops **SEC-1**. As seções
> **BE-01…BE-13** mais abaixo são **históricas** (já entregues); ficam como registro.
>
> **Varredura do §8 em 23/10:** auditei o `ORIENTACOESFRONT.md` §8.1–8.14 inteiro contra o código. **Todos os
> fluxos de cliente / fornecedor / entregador estão implementados e batem com o contrato** (8.5 carteira/repasse
> do entregador, 8.6 maquininha, 8.7 estorno `Refunded`, 8.8 orçamento aceite/recusa/sem-preço, 8.9 sacola
> agendamento/gorjeta/cupom, 8.10 push, 8.11 garantia, 8.12 chat, 8.14 upload). O único conjunto faltante são as
> **telas de admin** (`admin-delivery-payouts`, `admin-delivery-fees`, `admin-categories`, `admin-coupons`,
> `admin-providers/:id/subscriptions/grant`) — **decidido 23/10: admin é app separado, fora do escopo deste PWA.**
> Divergência de doc localizada: §8.6 cita `confirm-cash-payment`, mas swagger e código usam o correto
> `confirm-payment` (código certo, doc com typo).

### ✅ Resolvido no back (não bloqueia mais)

| Item | Desfecho (19/10) |
|---|---|
| **BE-FILE-URL-1** | **Config, não código.** Era `URL_INTEGRATION` no `.env` com o texto-modelo `your-ngrok-url…` — a API monta a `fileUrl` a partir dessa var **no momento do upload**. Corrigido e validado ponta a ponta. ⚠️ A URL fica gravada na linha no upload: **corrigir a var conserta uploads novos, não os antigos** (há `scripts/corrigir-urls-placeholder.sql` p/ reparar linhas velhas). Se mídia quebrar em outro ambiente → olhar `URL_INTEGRATION` primeiro (no servidor do cliente, quem define é o DevOps). |
| **BE-ADS-VIDEO-1** | **Disponível.** `videoUrl`/`videoKey` existem em produto, hospedagem e transporte (12 DTOs: create/update/response/list), espelhando `imageUrl`/`imageKey`. Ver §8.14. |
| **Upload S3** | Validado contra o bucket real: imagem por `POST /v1/upload/one-file` e `/many-files` (10 MB; png/jpg/jpeg/webp/pdf); vídeo por `presign → S3 → confirm` (200 MB). **Bucket privado — leitura sempre por `GET /v1/files/{fileKey}`**, nunca pela URL do S3. Erros: 413 (acima do teto), 400 (imagem no presign), 403 (token de confirmação forjado). |
| **BE-NUM-1** | **Não era bug de back.** `POST /services`, `/budgets`, `/jobs`, `/restaurants` respondem 201 com `number` enviado como número. A causa dos 400 era um **processo velho ocupando a porta 8000** (`node dist/src/main` de um `start:prod` esquecido) servindo código antigo. Se voltar: `lsof -i :8000`. |
| **BE-ROUTE-1** | **Não era bug de back.** O artefato `swagger.json` exportado não aplicava o `setGlobalPrefix` → dizia `/subscriptions/catalog` em vez de `/v1/subscriptions/catalog`. O swagger novo já traz o prefixo `/v1` nas 195 rotas. |
| **BE-W1 / BE-W7 / BE-CHAT-1 / BE-Q5** | **Já estavam no contrato** (garantia-execução + contador; chat no Budget; inbox/não-lidos). Prontos para o front consumir. |
| **BE-CORP-1** (26/10) | **Resolvido.** As imagens não renderizavam no front: o `GET /v1/files/*` vinha com `Cross-Origin-Resource-Policy: same-origin` (padrão do Helmet). Como front e API ficam em origens diferentes (`localhost:4200`×`:8000`, e domínios distintos em homolog), o navegador baixava o arquivo (200) mas bloqueava o uso em `<img>` (abria só em aba direta). Back passou a responder `Cross-Origin-Resource-Policy: cross-origin`. ⚠️ **Vale para todos os ambientes** — manter `cross-origin` em homolog/produção, senão a mídia volta a não renderizar. |
| **BE-SRV-URL-1** (27/10) | **Resolvido** (branch `ajustes-gerais`, commit `e4fb1a4`). O validador da URL de arquivo foi corrigido em **3 DTOs** (imageUrl do serviço, fileUrl do anexo de trabalho e fileUrl do anexo de orçamento). Diagnóstico ajustado pelo back: **IP sempre passou; só host sem ponto (`localhost`) falhava.** Nada a fazer no front — segue enviando a `fileUrl` absoluta que a própria API emite. |
| **BE-SRV-MEDIA-1** (27/10) | **Resolvido** (branch `ajustes-gerais`, commit `e4fb1a4`). O serviço passou a ter **capa** (`imageUrl`/`imageKey`), **vídeo** (`videoUrl`/`videoKey`) e **galeria** (`images: [{fileUrl, fileKey, sortOrder?}]`, até 10). Galeria só volta no **detalhe** (`GET /services/:id`), não na lista. **PATCH substitui** a galeria (manda sempre a lista final; omitir = inalterada, `[]` = esvazia). Teto de 10 barrado no front (acima disso o back responde 400). Imagens removidas são apagadas do storage. Front entregue: cadastro (capa+vídeo+galeria) e exibição no detalhe do cliente. |
| **Foto de perfil — remover** (27/10) | **Resolvido (front).** `DELETE /v1/profile-photo` exige a `fileKey` da foto atual na **query string** (`?fileKey=...`); sem ela respondia `400 "A chave do arquivo deve ser um texto."`. O front passou a enviar a `fileKey`. (O avatar na home também passou a exibir a foto, não só a inicial.) |

### ✅ Front entregue (contrato de 19/10 — auditado e verde em 21/10)

| Fatia | O quê | Onde ficou |
|---|---|---|
| **U3d — vídeo em anúncios** | Upload + exibição de vídeo no cadastro de produto, hospedagem e transporte (`videoUrl/videoKey`). | `VideoUploadComponent` nas 3 telas de cadastro + exibição nos 4 detalhes. |
| **Garantia — execução + contador (BE-W1/W7)** | Reparo de garantia como `Work` vinculado (`isWarranty`/`parentWorkId`/`warrantyWorks`) + contador no perfil. | Badge "Garantia" em lista e detalhe (cliente e fornecedor); link original↔reparo; reparo esconde pagar/adicional e bloqueia garantia-de-garantia; `budgetId` tratado como opcional; contador `warrantiesCompleted/warrantiesTotal` ("X de Y atendidas") em `perfil` e `detalhes-prestador`. |
| **Chat pré-aceite (BE-CHAT-1)** | Chat no nível do orçamento (Budget), antes do aceite. | `budget.chat.id` mapeado para `chatId` nos 4 mapeadores; botão de chat em `aprovar-orcamento` (cliente), `fazer-orcamento` e `orcamentos-fornecedor` (fornecedor); mesma sala no Budget e no Work (`budget.chat.id === work.chat.id`). |
| **BE-Q5 (inbox)** | Inbox de conversas além do badge de não-lidos. | Tela `/mensagens` (`MensagensComponent`) consome `GET /chats` via `ChatService.inbox()` e abre `/chat/:id`; badge `unread-count` via `ChatUnreadStore` em bottom-nav, hub, home, atividade e mensagens. |
| **Serviços §2.1 — fornecedor pede info** (27/10) | Feedback ao pedir mais informações. | `fazer-orcamento`: valida mensagem, estado de envio (anti-duplo-clique), erro mantém o modal e o texto; no sucesso volta à lista com aviso "Solicitação de informações enviada ao cliente". |
| **Serviços §2.2 — cliente responde** (27/10) | Encerrar a jornada do pedido de informações. | `aprovar-orcamento` exibe o thread `informationRequests` (pergunta do prestador) e, em `WaitingInformation`, oferece "Responder pelo chat" reusando a sala do orçamento (BE-CHAT-1). |
| **Compra-venda / Aluguel — confirmação de recusa** (27/10) | Ação destrutiva sem confirmação (§5). | Novo componente compartilhado `ConfirmDialogComponent`; `negociacao-detalhe` e `aluguel-detalhe` pedem confirmação antes de recusar/cancelar (anti-clique-acidental); status terminal segue visível no detalhe. Justificativa estruturada depende de BE (BE-RENT-REJECT-1 / BE-COMM-REJECT-1). |
| **Hospedagem / Transporte / Delivery — confirmação de recusa/cancelamento** (27/10) | Mesma ação destrutiva sem confirmação (§5). | `ConfirmDialogComponent` aplicado em `reserva-detalhe` (recusar/cancelar), `transporte-pedido-detalhe` (recusar cotação/cancelar), `detalhes-pedido-fornecedor` (recusar pedido = cancelar) e `status-pedido` (cancelar pedido do cliente). Cobertura de confirmação agora consistente em todas as categorias. |
| **Entregador — ajustes de UI** (27/10) | Card roxo vazando; menu com rotas mortas; avatar não aparecia. | `he-carteira` ganhou o gutter lateral dos demais cards; removidos os itens de menu "Mais" e "Orçamentos" (rotas inexistentes), restando Home/Trabalhos/Perfil; header da `home-entregador` passou a carregar nome e foto reais via `GET /profile/me` (antes era placeholder fixo). Rota no mapa depende de `BE-DELIVERY-ROUTE-1`. |
| **Motivo da recusa** (27/10) | Recusa com justificativa + exibição. | Diálogo `ConfirmDialogComponent` ganhou campo de motivo; `reserva-detalhe` e `aluguel-detalhe` **exigem** o motivo e enviam `rejectReason` no `respond`; reserva, aluguel e `negociacao-detalhe` **exibem** o "Motivo da recusa" quando `Rejected`. |
| **Rota do entregador** (27/10) | Mapa coleta→entrega. | Novo `MapaRotaComponent` (Google Maps Directions) em `status-entrega`; lê `foodOrder.restaurant.address` (coleta) e `foodOrder.deliveryAddress` (entrega); mostra endereços escritos e cai em fallback quando faltam coordenadas. Depende de ops: Directions API habilitada (SEC-1). |
| **Delivery — comissão por pedido** (27/10) | Aviso de assinatura + `{X}%` na criação do restaurante. | `restaurante-fornecedor` lê `deliveryCommissionRate` de `GET /profile/me` (0 é válido) e mostra o aviso (itens; frete/gorjeta fora; pago na entrega sem retenção). Payouts (`/restaurants/me/payouts`) já consumido na `home-fornecedor`. |
| **Planos — layout + fluxo** (27/10) | Tela de planos redesenhada + quando aparece. | `assinatura-fornecedor`: 3 cards de plano (dinâmicos do catálogo), destaque "MAIS VANTAJOSO" (menor preço/mês), benefícios, nota sucinta de delivery, "Assinar depois" (`?novo=1`). **Fluxo:** 1º acesso do fornecedor sem assinatura abre os planos uma vez (gatilho no `hub-fornecedor`, flag por dispositivo); paywall por categoria já era automático via `errorInterceptor` (403 "assinatura ativa" + `categoryId`) — ver `BE-PAYWALL-403-1`. |
| **Influencer — link/código de indicação** (27/10) | Link não gerava; título; código de quem indicou ia no campo errado. | `meu-codigo` passou a ler o `referralCode` de `GET /referrals/me/summary` (fallback `/referrals/me`), como a home do parceiro — o `profile/me.referralCode` pode vir vazio p/ influencer; título da tela "Código" → **"Meu link"**. **Correção de regra:** o código de quem indicou (link `?ref=` **e** campo "Código do influencer") agora vai em **`inviteCode`** (contrato: "código de convite do influencer que indicou"); antes o link mandava em `referralCode` (que é o código *próprio* do usuário) → a indicação por link não era atribuída. O cadastro do fornecedor já usa `/register/supplier` (RegisterBaseDto) com `inviteCode`. |

### ✅ Demandas de back (27/10) — RESOLVIDAS

> Todas as demandas abaixo foram **resolvidas pelo back** no fim de 27/10 (`swagger.json` novo +
> `ORIENTACOES-FRONT-27-10.md`) e **consumidas pelo front** (ver topo vivo). Ficam como registro do que foi pedido.
> Único pendente é de **ops: `SEC-1`**.

- **BE-INFLUENCER-CODE-1** ✅ (27/10, influencer — **confirmado e resolvido**) — **o back não gera/retorna o `referralCode` do influencer.**
  O campo está no contrato (`ResponseMyReferralsSummaryDto.referralCode`, `ResponseMyReferralsDto.referralCode`,
  `ResponseProfileDto.referralCode` nullable), mas **nenhuma resposta real o traz**. Evidência (influencer logado, 27/10):
  - `GET /v1/referrals/me` → `{"referrals":[],"totalRecords":0}` (sem `referralCode`);
  - `GET /v1/referrals/me/summary` → `{"totalReferrals":0,"totalPaying":0,"accumulatedCommission":0,"rankingPosition":1,"commissionRate":null,"effectiveCommissionRate":10}` (**sem `referralCode`**).
  **Impacto:** o influencer **não tem link de indicação** (a tela "Meu link" fica no estado vazio) e, por consequência,
  ninguém consegue se cadastrar indicado por ele. O front já está pronto (lê o campo e trata o vazio). **Pedido ao back:**
  gerar o `referralCode` do influencer (na aprovação/ativação da conta, ou sob demanda) e **retorná-lo** em
  `GET /referrals/me/summary` (e, idealmente, também em `/referrals/me` e `profile/me`). *Bloqueia o link de indicação do influencer.*

- **BE-BOOK-REJECT-1** 🔴 (27/10, auditoria de jornadas §2.3) — **recusa de reserva precisa de motivo.**
  Hoje `PATCH /v1/bookings/{id}/respond` recebe só `RespondBookingDto { status: 'Confirmed' | 'Rejected' }` e o
  `ResponseBookingDto` tem `rejectedAt` mas **não tem `rejectReason`** (ao contrário de orçamento, que já tem `rejectReason`
  no reject). A decisão do cliente é que a **justificativa da recusa seja obrigatória** e fique registrada/visível para o
  hóspede. **Pedido ao back:**
  1. `RespondBookingDto` aceitar `rejectReason?: string` (obrigatório quando `status = 'Rejected'`; validar no back).
  2. `ResponseBookingDto` passar a retornar `rejectReason` para o hóspede ver o motivo no detalhe/lista da reserva.
  3. Persistir o motivo junto da transição para `Rejected`.
  **Enquanto não existir:** o front **não** implementa a recusa com justificativa (ficaria sem onde gravar o motivo).
  A comunicação da recusa segue possível pela **sala de chat da reserva** (`chatRoomId`, já existe), mas sem registro
  estruturado. *Bloqueia a entrega da fatia §2.3.*
- **BE-RENT-REJECT-1** 🔴 (27/10, auditoria de jornadas — aluguel) — **mesma lacuna da reserva, agora no aluguel.**
  `PATCH /v1/rentals/{id}/respond` recebe só `RespondRentalDto { status }` e `ResponseRentalDto` não tem `rejectReason`
  (só `cancelReason`, usado no cancelamento). **Pedido:** espelhar o BE-BOOK-REJECT-1 — `rejectReason?` no respond
  (obrigatório quando `Rejected`) e retornar no `ResponseRentalDto`. **Enquanto não existir:** front não grava motivo; a
  recusa já ganhou **confirmação** (entregue) e a comunicação segue pelo chat do aluguel.
- **BE-COMM-REJECT-1** 🟡 (27/10, auditoria de jornadas — compra e venda) — **o motivo da recusa não volta para o comprador.**
  `RespondCommercialTransactionDto` já aceita `message?` na recusa, mas `ResponseCommercialTransactionDto` **não devolve**
  esse texto (tem `rejectedAt`, não o motivo). **Pedido:** retornar o motivo da recusa (ex.: `rejectReason`/`rejectMessage`)
  para exibir ao comprador no detalhe. **Enquanto não existir:** a recusa já ganhou **confirmação** (entregue); o motivo pode
  ser enviado pelo chat da negociação.

- **BE-DELIVERY-ROUTE-1** 🔴 (27/10, entregador — rota no mapa) — **falta coordenada de coleta e de entrega para traçar a rota.**
  Hoje a tela do entregador em corrida (`status-entrega`) mostra só um **placeholder** ("Mapa disponível em breve"); não há
  rota no mapa. O entregador **já envia** a própria posição (`PATCH /v1/deliveries/{id}/location` → `currentLat/currentLng`),
  mas os DTOs de entrega/pedido **não trazem os dois pontos da rota**:
  - `ResponseDeliveryDto` tem só `currentLat/currentLng` (posição do entregador);
  - `ResponseFoodOrderRestaurantDto` (coleta) e `ResponseFoodOrderUserDto`/endereço de entrega (destino) **não têm
    `lat`/`lng` nem endereço**. O back **já conhece os dois pontos** (calcula o frete pela distância restaurante↔cliente),
    só não os expõe.
  **Pedido ao back:** incluir no `ResponseDeliveryDto` (ou no `ResponseFoodOrderDto`):
  1. **Coleta (restaurante):** `pickupLat`/`pickupLng` (+ endereço legível, se possível).
  2. **Entrega (cliente):** `dropoffLat`/`dropoffLng` (+ endereço de entrega legível).
  Com isso o front traça a rota (Google Maps Directions: coleta → entrega) e sobrepõe o marcador vivo do entregador
  (`currentLat/currentLng`, que já existe). **Depende também de ops (`SEC-1`)**: a chave do Google Maps precisa ter a
  **Directions API** habilitada e restrita por ambiente. *Bloqueia a feature de rota do entregador.*

> ✅ Serviços: `BE-SRV-URL-1` e `BE-SRV-MEDIA-1` **resolvidos** (ver tabela "Resolvido no back"). Sem demanda de serviços em aberto.

### 🔎 Verificar com o back (paywall de assinatura)

- **BE-PAYWALL-403-1** 🟡 (27/10, assinatura — **a confirmar**) — **padronizar o 403 de "assinatura ativa" nas ações gated.**
  O front leva o fornecedor à tela de planos **automaticamente** via `errorInterceptor`: em qualquer `403` cuja mensagem
  contém **"assinatura ativa"**, redireciona para `/fornecedor/assinatura`, pré-selecionando a categoria quando o corpo do
  erro traz **`categoryId`**. Isso já funciona para **criar restaurante** (o back já responde esse 403). **Verificar se as
  demais ações gated respondem o mesmo 403 padronizado** (mesma frase "assinatura ativa" + `categoryId` no corpo), senão o
  paywall não dispara nelas:
  - **Anunciar** aluguel / venda / transporte (criar anúncio na vertical);
  - **Responder orçamento** (fornecedor) e **aceitar pedido/corrida** (reserva/aluguel/transporte/negociação/food-order).
  **Pedido ao back:** confirmar (ou padronizar) que essas rotas, quando o fornecedor não tem assinatura ativa **daquela
  categoria**, respondem `403` com a frase **"assinatura ativa"** e, de preferência, `categoryId` no corpo. *Sem isso, o
  front não tem como saber que foi bloqueio de assinatura (não vamos adivinhar por outras pistas).*

### ⏳ Pendente (ops — fora do código)

- **SEC-1** — restringir a chave do Google Maps no GCP (referrer HTTP + por API; chave por ambiente). *Segue pendente do lado do cliente/DevOps.*

### 🚪 Fora do escopo deste front (app separado)

- **Área de admin / back-office** — repasses (`admin-delivery-payouts`), taxas de entrega (`admin-delivery-fees`),
  categorias (`admin-categories` + upload de imagem), cupons (`admin-coupons`), concessão de assinatura
  (`admin-providers/:id/subscriptions/grant`). *Decidido 23/10: vive em outro projeto; este PWA é só
  cliente/fornecedor/entregador.*

> ✅ **Já entregue e em produção** (não refazer): domínios de delivery/aluguel/transporte/hospedagem/empregos, Mercado Pago (vínculo + pagamento), fase Mapa (coordenadas + rastreamento), seeds de categorias (BE-Q9), estorno/`Refunded`, maquininha própria, Pix no cadastro bancário, push/VAPID.

---

## 🐞 Bugs ativos (encontrados na integração)

### BE-NUM-1 — Campos numéricos do corpo recusados: contrato diz `number`, validação exige **string numérica** 🔴

**Impacto: SISTÊMICO.** Trava **todos os endpoints de criação**, nos **dois perfis** (cliente e fornecedor),
inclusive telas que o Front **não alterou**. Confirmado em `POST /services`, `POST /budgets` e `POST /jobs`
(e por consequência afeta `POST /subscriptions`, `/food-orders`, `/bookings`, `/rentals`,
`/transport-requests`, `/commercial-transactions` — qualquer DTO com campo numérico no corpo).

**Sintoma C — `POST /v1/jobs` (publicar vaga)** — tela que o Front não mexeu:
```json
// enviado: { "title": "Titulo 4", "type": "CLT", "value": 1000, "requirements": "…", "description": "…" }
{ "message": "Requisição inválida.", "error": "Bad Request", "statusCode": 400 }
```
`value: 1000` é `number` (como o Swagger declara) → recusado. É a mesma falha da numérica-string.

**Sintoma A — `POST /v1/services` (cadastrar serviço):**

```json
{ "message": "Validation failed (numeric string is expected)", "error": "Bad Request", "statusCode": 400 }
```
Corpo enviado (bate com `CreateServiceDto` do Swagger — `name`/`type`/`categoryId` obrigatórios):
```json
{ "name": "…", "type": "Online", "categoryId": 2, "price": 150 }
```

**Sintoma B — `POST /v1/budgets` (pedir orçamento), contas distintas:**

```json
{ "message": "Requisição inválida.", "error": "Bad Request", "statusCode": 400 }
```
Corpo enviado (bate com `CreateBudgetDto` — só `serviceId` obrigatório):
```json
{ "serviceId": 2, "description": "[Normal] teste" }
```

**Diagnóstico.** Nos dois casos o Front envia os campos numéricos como **`number`**, exatamente como o
Swagger declara (`categoryId: number`, `price: number`, `serviceId: number`, com `example: 1`/`150`/`3`).
A mensagem *"numeric string is expected"* é a do `ParseIntPipe`/`@IsNumberString` do NestJS — ou seja, a
validação real espera uma **string numérica** (`"2"`), não o número `2`. O contrato publicado e a
validação **divergem**. (No `/budgets` a mesma falha provavelmente aparece mascarada como
`"Requisição inválida."` por um filtro de exceção genérico.)

**O que o Back precisa fazer (uma das duas):**

1. **(Recomendado) Alinhar a validação ao Swagger** — aceitar `number` nos campos numéricos do corpo
   (`@IsNumber()`/`@Type(() => Number)` em vez de `@IsNumberString()`/`ParseIntPipe` em body). Assim o
   Front não muda nada.
2. **Ou** assumir string numérica de fato e **regenerar o Swagger** (`npm run swagger:generate`) para os
   campos virarem `type: string`. Aí o Front passa a enviar string — mas isso contradiz os `example`
   atuais e é menos idiomático para JSON.

**Além disso, no `/budgets`:** o `400` devolve texto genérico (`"Requisição inválida."`). Trocar por
`message` específico (o array do `class-validator`) — sem isso o Front não consegue dizer ao usuário o
que falhou. E, se a recusa for regra de negócio (fornecedor sem assinatura da categoria — §8.3), o
correto é **`409`** com mensagem pronta, não `400`.

> **Enquanto o Back não alinha:** dá pra destravar o Front **temporariamente** enviando os IDs/valores
> numéricos como string (`String(categoryId)`, `String(serviceId)`, `String(price)`). É um *workaround*
> que **contradiz o Swagger** e deve ser **revertido** assim que a validação aceitar `number`. Só aplico
> se o cliente pedir.

### BE-ROUTE-1 — `GET /v1/subscriptions/catalog` cai no handler de `:id` (route ordering) 🔴

**Sintoma — abrir "Minhas assinaturas" (fornecedor):**
```json
// GET /v1/subscriptions/catalog  (sem params)
{ "message": "Validation failed (numeric string is expected)", "error": "Bad Request", "statusCode": 400 }
```

**Diagnóstico.** O Front chama `GET /subscriptions/catalog` (rota literal, **sem** parâmetro numérico) — é
exatamente o endpoint publicado no Swagger. A mensagem *"numeric string is expected"* é do `ParseIntPipe`
de `GET /subscriptions/:id`: ou seja, `catalog` está sendo **capturado pelo handler `:id`**. É o clássico
*route ordering* do NestJS — as rotas **literais** (`catalog`, `current`, `my-subscriptions`) precisam ser
declaradas **antes** de `@Get(':id')` no controller, senão `:id` engole `"catalog"` (que não é numérico).

**O que o Back precisa fazer:** no `SubscriptionsController`, mover `@Get('catalog')`, `@Get('current')` e
`@Get('my-subscriptions')` para **antes** de `@Get(':id')`. Vale conferir o mesmo padrão em outros
controllers com rota literal + `:id` (ex.: works, budgets, services). É distinto do BE-NUM-1 (aqui é
roteamento, não validação de tipo) — não some só corrigindo os DTOs.

### BE-ADS-VIDEO-1 — Anúncios não têm onde guardar vídeo 🟠

**Contexto.** A §8.14 liberou upload de vídeo (3 passos → `fileUrl`/`fileKey`). No Front o serviço de
upload de vídeo já existe (`UploadService.enviarVideo`) e as telas de **conclusão de trabalho**, **garantia**
e **chat** já anexam vídeo. Falta cobrir os **anúncios** — mas eles **não têm campo de vídeo no contrato**:

| DTO | Campos de mídia hoje |
|---|---|
| `CreateProductDto` (produto e **aluguel** — reusa produto) | `imageUrl`, `imageKey` |
| `CreateAccommodationDto` (hospedagem) | `imageUrl`, `imageKey` |
| `CreateTransportationDto` (transporte) | `imageUrl`, `imageKey` |

Só imagem única; **não há** `videoUrl`/`videoKey` nem array de mídia. Sem campo, o Front não tem onde
gravar o vídeo — a tela de anúncio com vídeo **depende do back**.

**Pedido ao back (uma das duas abordagens):**
1. **Simples (espelha a imagem):** adicionar `videoUrl?` + `videoKey?` nos DTOs de criação/edição
   **e nas respostas** (list + detalhe) de produto, hospedagem e transporte (aluguel sai de graça por
   reusar produto). Um vídeo por anúncio.
2. **Genérico (se quiser múltiplas mídias):** um array `mediaFiles: [{ fileUrl, fileKey, type }]` por
   anúncio, cobrindo imagem(ns) + vídeo(s).

Recomendo a **(1)** por ser consistente com o `imageUrl`/`imageKey` atual e resolver o caso de uso
(1 vídeo de apresentação). Assim que o campo existir (DTOs + entidade + GET devolvendo), a tela do Front
é um acréscimo pequeno (o upload já está pronto) — me avisem que entrego a fatia.

### BE-FILE-URL-1 — `fileUrl` do upload vem com **host placeholder** (`your-ngrok-url…`) → nenhuma mídia renderiza 🔴

**Impacto: SISTÊMICO.** Afeta **toda imagem/vídeo enviado** (todas as verticais: transporte, produto,
hospedagem, cardápio, chat, conclusão de trabalho…), não só transporte. Foi *descoberto* no cadastro de
transporte, mas a causa é o serviço de upload.

**Sintoma:** ao anexar uma imagem no cadastro (ex.: transporte), o upload **conclui sem erro**, mas a foto
aparece **quebrada** no preview e na listagem.

**Causa confirmada (diagnóstico em tela, 2026-10-05).** O `POST /v1/upload/one-file` responde `200` com
`{ id, fileUrl, fileKey }`, mas o **`fileUrl` aponta para um host que não existe** — é o **texto-modelo do
`.env`**, nunca substituído pela URL pública real:

```
fileUrl: https://your-ngrok-url.ngrok-free.app/v1/files/1791230853240-Captura-de-Tela-….png
fileKey: 1791230853240-Captura-de-Tela-….png
```

`your-ngrok-url.ngrok-free.app` é literal (placeholder), então `<img src>`/`<video src>` falham em qualquer
tela. (Confirmado: o `<img>` dispara `error`, sem mensagem de erro de upload.)

**Auditoria do Front (sem mudança necessária):** o cliente Angular está correto ponta a ponta — faz
`POST /v1/upload/one-file` (campo `file`, como o Swagger pede), recebe `{fileUrl, fileKey}` e usa `fileUrl`
direto no `<img>`/`<video>` (como manda o §8.14). O front **não monta** essa URL; ele apenas reflete a que o
back devolve.

**Correção (back / infra):**
1. Configurar a **variável de base pública** usada para montar `fileUrl` (algo como `APP_URL` / `PUBLIC_URL` /
   `FILES_BASE_URL`) com a **URL real e acessível** (a URL atual do ngrok, ou o domínio de homolog/produção) —
   hoje está com o placeholder `https://your-ngrok-url.ngrok-free.app`.
2. Garantir que a rota de **servir o arquivo** exista e seja **pública** (sem exigir `Authorization`, pois a
   tag `<img>` não envia token). O Swagger documenta `GET /v1/one-file/download/{id}` e `GET /v1/one-file/{id}`,
   mas o `fileUrl` aponta para **`/v1/files/{fileKey}`** — confirmar que essa rota realmente serve o binário
   (ou ajustar o `fileUrl` para a rota correta).

> Enquanto o back não corrigir, dá para destravar **temporariamente no front** reescrevendo o host da `fileUrl`
> (trocar o placeholder pela base real do `environment.apiBaseUrl`), mas é gambiarra — assim que o back devolver
> a URL certa, o ideal é o front **não** mexer. Me avisem se querem esse workaround temporário.

---

## 🎯 Ordem de serviço — Backend (comece por aqui)

> **Estado do front (2026-09-23):** todas as fatias de UX/jornada que **não dependem de back** foram entregues e
> aplicadas na `integracao` (garantia respondível + validade, pagamento MP do serviço, menu/Atividade do cliente
> como índice por categoria, painel + urgência do fornecedor, chat real). O que falta no produto **depende do
> back-end** — esta é a fila priorizada. Cada item aponta para a especificação detalhada neste doc.

| Prioridade | Item | O que é | Spec | Destrava no front |
|---|---|---|---|---|
| 1 | **BE-W1** | Execução da garantia: `respondWarranty(Approved)` cria **Work de garantia** vinculado (`parentWorkId`, `serviceValue=0`) | §"BE-W1 — Especificação" (abaixo) | Rastreio do reparo de garantia |
| 2 | **BE-W7** | Agregado **contador de garantias** por fornecedor (total/concluídas/em aberto) | §"BE-W7 — Especificação" | "Garantias totais/atendidas" no perfil (hoje hardcoded 0) |
| 3 | **BE-Q5** | **Inbox de chats + não-lidos** (ver spec refinada abaixo) | §"BE-Q5 (refinada)" | Aba **Mensagens** do cliente, card "nova mensagem" no hub, badges de não-lido (E2E-2b/3a/3b) |
| 4 | **BE-CHAT-1** | **Chat no nível do Budget** (conversar antes de aprovar o orçamento) | §"BE-CHAT-1" (abaixo) | Chat pré-aceite em `aprovar-orcamento`/`fazer-orcamento` |
| 5 | **BE-Q8** | `POST /upload/one-file` sem credencial S3/fallback → `500` | `backenddemandas.md` (BE-Q8, detalhado) | Anexos reais (pedido de orçamento, conclusão, etc.) |

**Decisões de produto** (recomendações **registradas** em §"Decisões de produto (Q-F/Q-G/Q-H)"; a impl. pode
seguir por elas): **Q-F** → chat **próprio** do reparo · **Q-G** → **bloquear** reparo-de-reparo · **Q-H** →
"atendida" = **reparo concluído** · **Q-UX1** → chat do orçamento **segue** no Work (decidido).

### BE-Q5 (refinada) — Inbox de chats + não-lidos 🔴
Hoje só há `GET /chats/{id}/messages`, `POST .../messages`, `PATCH .../read` e `GET /chats/context/{type}/{refId}`.
**Falta**, para o front surfaçar conversas e "nova mensagem":
- **`GET /v1/chats`** (ou `/chats/me`) — lista paginada das conversas do usuário, cada uma com: contraparte
  (nome/foto), **contexto** (`Work`/`Budget`/`CommercialTransaction`/…) + `referenceId`, **última mensagem**
  (texto + data) e **`unreadCount`**.
- **`GET /v1/chats/unread-count`** — total de não-lidos (barato), para os badges do menu/hub/botão de chat.

### BE-CHAT-1 — Chat no nível do orçamento (Budget) 🟠
Hoje o `ChatRoom` só nasce quando o orçamento é aprovado (vira `Work`), então **não há como conversar durante a
fase de orçamento**. O `ChatContextType` já prevê `Budget`.
- **Criar/expor** um `ChatRoom` de contexto **`Budget`** quando o orçamento é criado (ou no 1º "pedir mais
  informações"), e devolver **`chat.id`** em `ResponseBudgetDto` e `ResponseBudgetListItemDto`.
- **Ao aprovar** (Budget → Work), **manter a mesma conversa** (revincular ao `Work` ou copiar o histórico) —
  **decisão Q-UX1 já tomada: a conversa continua**. Assim o chat iniciado no orçamento segue no trabalho.
- **Front pronto para consumir:** basta o `chat.id` no Budget para ligar o botão de chat em `aprovar-orcamento`
  (cliente) e criar a entrada em `fazer-orcamento`/`orcamentos-fornecedor` (fornecedor).

---

## Legenda de prioridade

| Prioridade | Significado |
|---|---|
| 🔴 Crítica | Bloqueia uma vertical/jornada inteira; sem isso não há integração. |
| 🟠 Alta | Funcionalidade prevista (fluxo/ata) sem contrato; impacto direto na jornada. |
| 🟡 Média | Lacuna/inconsistência que degrada UX/robustez, com contorno possível. |
| ⚪ Baixa | Ajuste de qualidade/documentação do contrato. |

## Modelo de análise por vertical

Cada vertical do produto precisa de **3 camadas**. O Swagger cobre bem a **camada 1** (catálogo) de quase tudo,
mas falta a **camada 2 (transação/pedido/reserva com ciclo de vida)** e a **camada 3 (chat)** em várias.

| Vertical | 1. Catálogo | 2. Transação | 3. Chat |
|---|---|---|---|
| Serviços | ✅ `/services` | ✅ `/budgets`→`/works` | ✅ `/chats` (`Work`/`Budget`) |
| Compra e Vender | ✅ `/products` | ✅ `/commercial-transactions` (`Product`) | ✅ `/chats` (`CommercialTransaction`) |
| Aluguel | ✅ `/products?transactionType=Rent` | ❌ **falta** (BE-04) | ❌ **falta** (BE-08) |
| Transporte | ✅ `/transportations` | ❌ **falta** (BE-05) | ❌ **falta** (BE-08) |
| Hospedagem | ✅ `/accommodations` | ❌ **falta** (BE-06) | ❌ **falta** (BE-08) |
| Delivery | ❌ **falta** (BE-01) | ❌ **falta** (BE-01) | ❌ **falta** (BE-08) |
| Empregos | ❌ **falta** (BE-07) | ❌ **falta** (BE-07) | ❌ **falta** (BE-08) |
| Entregador | perfil `Delivery` existe | ❌ **falta** (BE-03) | — |

## Resumo das demandas

| # | Demanda | Prioridade |
|---|---|---|
| BE-01 | Domínio de **Delivery** (restaurantes, cardápio, pedido, status) | 🔴 Crítica |
| BE-02 | **Cobrança híbrida** do delivery (assinatura OU comissão por estabelecimento) | 🔴 Crítica |
| BE-03 | **Entregador**: pedidos de entrega + **rastreamento/geolocalização** (mapa) | 🔴 Crítica |
| BE-04 | **Aluguel**: entidade transacional (período, valor, condições, status) | 🟠 Alta |
| BE-05 | **Transporte**: pedido de transporte (origem/destino/carga, orçamento, status) | 🟠 Alta |
| BE-06 | **Hospedagem**: reserva (check-in/out, calendário, pagamento, status) | 🟠 Alta |
| BE-07 | **Empregos**: domínio completo (empregador + profissional) | 🟠 Alta |
| BE-08 | Ampliar **`ChatContextType`** para as verticais sem chat | 🟠 Alta |
| BE-09 | **Negociação** além de `Product` (ou fluxos próprios por vertical) | 🟡 Média |
| BE-10 | **Indicações do usuário logado** (hoje só no admin) | 🟠 Alta |
| BE-11 | Ambiguidade **Partner × Influencer** | 🟠 Alta |
| BE-12 | Confirmar identificador de **login (email × telefone)** | 🟠 Alta |
| BE-13 | Qualidade de contrato (reset senha, `birthDate`, logout) | ⚪ Baixa |

---

> ⚠️ **Seção histórica (BE-01…BE-13).** Estas demandas são da auditoria inicial e a **maioria já foi
> entregue** e está integrada no front (delivery, aluguel, transporte, hospedagem, empregos, chat…).
> Mantidas como registro. As pendências vivas estão no **topo** (📌 Pendências abertas). Os emojis de
> prioridade aqui refletem o estado **na época da auditoria**, não o atual.

## BE-01 — Domínio de Delivery inexistente 🔴

**Fontes:** fluxo (Delivery cliente e fornecedor marcados "completos" no FE); ata (delivery é foco estratégico —
monetização, benchmarking iFood/Rappi, toggle categorias×restaurantes).
**Swagger:** nenhuma entidade de restaurante, cardápio, item, sacola ou pedido de comida.

**Contrato esperado (mínimo):**

| Método | Rota sugerida | Objetivo |
|---|---|---|
| `GET` | `/v1/restaurants` (`categoryId`,`search`,`take`,`skip`) | Listar restaurantes ativos |
| `GET` | `/v1/restaurants/{id}` | Restaurante + categorias de cardápio + itens |
| `GET` | `/v1/menu-items/{id}` | Item + adicionais |
| `POST` | `/v1/food-orders` | Criar pedido (itens, adicionais, endereço, entrega, pagamento) |
| `GET` | `/v1/food-orders/{id}` | Status (`recebido/preparo/caminho/entregue`) |
| `GET`+`POST/PATCH/DELETE` | `/v1/restaurants/me/menu` | Gestão de cardápio (fornecedor) |
| `GET`+`PATCH /{id}/status` | `/v1/restaurants/me/orders` | Fila de pedidos (fornecedor) |

**Decisão de produto:** telas de delivery **congeladas como mock** no FE até o contrato existir. Prioridade **máxima** de backend (ata).

---

## BE-02 — Cobrança híbrida do delivery 🔴

**Fonte (ata):** cada restaurante escolhe **Assinatura OU Comissão (%)**, negociado individualmente pelo gestor;
demais serviços = **somente assinatura**.
**Swagger:** existe `billingType = None|Subscription|Commission` e `PATCH /v1/profile/me/billing-type`, além de
`platformFeeRate` por categoria de serviço. Porém **não há** cálculo/registro de comissão sobre pedidos de delivery
(depende de BE-01) nem vínculo "estabelecimento → modelo de cobrança negociado".

**Contrato esperado:** definição do `billingType` por fornecedor de delivery + regra de **comissão por pedido**
(percentual configurável por estabelecimento) e relatório de repasse.

**Impacto:** sem isso a monetização central do delivery não fecha.

---

## BE-03 — Entregador: pedidos de entrega + rastreamento 🔴

**Fontes:** fluxo (perfil Entregador "completo" no FE: aceitar/recusar, status em 4 etapas); ata (cliente acompanha
**trajetória do entregador no mapa**, similar a apps de transporte).
**Swagger:** perfil `Delivery` existe no `profileType`, mas **não há** pedido de entrega, atribuição, mudança de etapa
nem **geolocalização em tempo real**.

**Contrato esperado:**

| Método | Rota sugerida | Objetivo |
|---|---|---|
| `GET` | `/v1/deliveries/available` | Pedidos disponíveis para o entregador |
| `PATCH` | `/v1/deliveries/{id}/accept` · `/reject` | Aceitar/recusar |
| `PATCH` | `/v1/deliveries/{id}/status` | Etapas (a caminho / retirado / entregue / concluído) |
| `POST` | `/v1/deliveries/{id}/location` | Enviar posição do entregador (tempo real) |
| `GET` | `/v1/deliveries/{id}/tracking` | Cliente acompanha trajetória (mapa) |

**Nota técnica:** rastreamento em tempo real exige canal (WebSocket/SSE) — definir com o time de API. Depende de BE-01.

---

## BE-04 — Aluguel: entidade transacional 🟠

**Fontes:** fluxo (cliente: solicitar aluguel com período/valor/condições → status → chat; fornecedor: cadastrar item,
solicitações, aceitar/recusar/negociar).
**Swagger:** `/products?transactionType=Rent` cobre só o **catálogo**. Não há entidade de **aluguel** (período de
locação, valor por período, condições, disponibilidade, ciclo de vida do contrato).

**Contrato esperado:** `POST/GET/PATCH /v1/rentals` com `productId`, período (`startDate/endDate`), valor,
condições, e status (`Requested/Accepted/Active/Returned/Cancelled`) + fila de solicitações do locador.

---

## BE-05 — Transporte: pedido de transporte 🟠

**Fontes:** fluxo (solicitar transporte: origem/destino/carga → orçamento → status/mapa → chat).
**Swagger:** `/transportations` é só **catálogo de veículos** (+reviews). Não há **pedido de transporte**.

**Contrato esperado:** `POST/GET/PATCH /v1/transport-requests` com origem, destino, descrição da carga, orçamento
(resposta do transportador), status (`Requested/Quoted/Accepted/InTransit/Delivered/Cancelled`) e localização.

---

## BE-06 — Hospedagem: reserva 🟠

**Fontes:** fluxo (cliente: selecionar período → revisão → pagamento → confirmação → status → chat; fornecedor:
reservas recebidas, aceitar/recusar, calendário de disponibilidade). **Hospedagem não existe nas rotas atuais do FE.**
**Swagger:** `/accommodations` (+reviews) é só **catálogo**. Não há **reserva/booking**.

**Contrato esperado:** `POST/GET/PATCH /v1/bookings` com `accommodationId`, `checkIn/checkOut`, hóspedes, valor total,
pagamento, status (`Requested/Confirmed/CheckedIn/Completed/Cancelled`) + **calendário de disponibilidade** por hospedagem.

---

## BE-07 — Empregos: domínio completo 🟠

**Fontes:** fluxo (dois lados — **Empregador**: vagas, candidatos, chat; **Profissional**: perfil, propostas, chat).
**Swagger:** nenhuma entidade de vaga/candidatura/proposta.

**Contrato esperado:** `/v1/jobs` (+`/categories`,`/{id}`), `POST /v1/jobs/{id}/apply`, `GET /v1/jobs/me/applications`,
gestão de vagas do empregador e propostas do profissional, com status e chat.

---

## BE-08 — Ampliar `ChatContextType` 🟠

**Problema:** `ChatContextType` só aceita **`Budget | Work | CommercialTransaction`**. O fluxo prevê **chat** em
aluguel (locador), transporte (transportador), hospedagem (anfitrião), delivery e empregos.
**Contrato esperado:** ampliar o enum (ex.: `Rental`, `TransportRequest`, `Booking`, `FoodOrder`, `Job`) e permitir
`GET /v1/chats/context/{contextType}/{referenceId}` para esses contextos (depende de BE-04…BE-07).

---

## BE-09 — Negociação além de Produto 🟡

**Problema:** `commercial-transactions.referenceType` só tem **`"Product"`**. Se a negociação/proposta for reaproveitada
para outras verticais (ex.: aluguel), o enum precisa ampliar; caso contrário, cada vertical terá seu fluxo próprio
(BE-04…BE-07). **Decisão de arquitetura pendente com o time de API.**

---

## BE-10 — Indicações do usuário logado 🟠

**Fontes:** fluxo (Parceiro: home com stats de indicações, "Meu Código", "Indicações" com abas Todas/Ativas/Inativas);
ata (compartilhamento nativo WhatsApp/Telegram para indicar).
**Swagger:** indicações só existem no **admin** (`/admin-users/referrals`, `/admin-influencers/{id}/referrals`). O
`/profile/me` traz `referralCode`, mas não os indicados nem a comissão do próprio usuário.
**Contrato esperado:** `GET /v1/referrals/me` (lista de indicados + status) e `GET /v1/referrals/me/summary`
(`referralCode`, totais, comissão acumulada, ranking).

---

## BE-11 — Ambiguidade Partner × Influencer 🟠

**Problema:** o "Parceiro" do app (indicar → comissão) está modelado na API como **`Influencer`**, mas há também o
perfil **`Partner`** com cadastro próprio (`/no-auth/register/partner`) e papel funcional não documentado.
**Pergunta ao time de API:** "Parceiro" do fluxo = `Partner` ou `Influencer`? Se distintos, qual a jornada de cada um?

---

## BE-12 — Confirmar identificador de login (email × telefone) 🟠

**Conflito entre fontes:** o **fluxo (doc funcional)** diz **"Login: telefone + senha"**; o **Swagger** implementa
**email + senha**; a **ata** é neutra (discute auto-preenchimento de código "SMS ou e-mail", não o identificador).
**Decisão atual (a validar com o cliente):** Front migra para **email + senha** conforme a API. **Sem verificação SMS no
web** (o Swagger diz que `verify-code` é "somente mobile"). Se o cliente exigir **login/registro por telefone + SMS**,
isso vira demanda de backend (login por telefone, envio e verificação de SMS).

---

## BE-13 — Qualidade de contrato ⚪

- **`ResetPasswordDto.password` com `maxLength: 8`** (`POST /v1/no-auth/reset`): impede redefinir senhas > 8 caracteres,
  divergindo do cadastro. Alinhar a política de senha entre cadastro e reset.
- **`birthDate` como `type: object`** (`RegisterBaseDto`, `UpdateUserDto` etc.): declarar `type: string, format: date` (ISO 8601).
- **Sem rota de logout/invalidação de token**: `POST /v1/logout` (opcional; hoje logout será só client-side).

---

## Reconciliação — ORIENTACOESFRONT v3 (itens 14-24) ✅

> **2026-09-22.** O back publicou a **v3** do contrato (`ORIENTACOESFRONT.md` v3). Vários itens antes listados como
> "demanda de back" **já foram implementados** e o front integrou cada um na fase **OF-14…OF-24**. Fecham aqui.
>
> ⚠️ **Fonte da confirmação = doc v3.** O clone local do back em `ajustes-gerais` (auditado nesta sessão) **ainda não
> tem** vários desses campos/rotas (`usesOwnCardMachine`, `card-machine`, `scheduledFor`, `couponCode`, `tip`,
> `/coupons/validate`, `/push/*`, `pixKey`). Ou seja, o **deploy** descrito pelo doc está **à frente** desse branch;
> a integração seguiu o **contrato do doc** (fonte da verdade). Se um ambiente antigo devolver 404 nessas rotas, é
> porque ainda não subiu a v3.

| Área (doc) | O que o back entregou | Front |
|---|---|---|
| §8.8 | `Service.price` opcional (serviço sob orçamento) | **OF-14** |
| §8.7 | `PaymentStatusEnum` + `Refunded` (≠ `Cancelled`) | **OF-15** |
| §8.8 | `BudgetStatusEnum` + `Accepted`/`Rejected` (≠ `Cancelled`) | **OF-16** |
| §8.8 | `PATCH /budgets/:id/reject` + `acceptedAt`/`rejectedAt`/`rejectReason` | **OF-17** |
| §8.9 | Cupom (`POST /coupons/validate`, `couponCode`) — **BE-Q10** | **OF-18** |
| §8.9 | Gorjeta (`tip`) — **BE-Q12** | **OF-18** |
| §8.6 | Maquininha própria (`PATCH /restaurants/me/card-machine`, `usesOwnCardMachine`) | **OF-19** |
| §8.5 | Carteira do entregador (`available`/`paid` em `/deliveries/me/earnings`) | **OF-20** |
| §8.5 | Chave Pix (`pixKeyType`/`pixKey` em `/bank-accounts/me`) | **OF-21** |
| §8.9 | Agendamento (`scheduledFor`) — **BE-Q11** | **OF-23** |
| §8.10 | Push/PWA (`/push/public-key`, `/push/subscriptions`) — **BE-Q13** | **OF-24** |

> **Detalhes de contrato notados na integração:**
> - A rota de confirmação de pagamento em dinheiro é **`PATCH /food-orders/:id/confirm-payment`** (o doc §8.6 escreve
>   `confirm-cash-payment`, mas o controller usa `confirm-payment` — mantido o existente).
> - **BE-Q14** (ícones das categorias de restaurante) fica **parcial/por design**: o app resolve por slug (offline-first);
>   só categoria criada pelo admin depois do release precisa de `iconUrl`, e isso é da tela de admin. Ver `backenddemandas.md`.
> - **Item 22** (repasses do admin) **não** virou tela aqui — é painel administrativo, fora deste PWA. Ver **BE-Q15** abaixo.

---

## BE-Q15 — Repasses do entregador: tela de painel admin (§8.5, item 22) 🟡

As rotas de repasse já existem no back (§8.5) e **não** exigem trabalho de back-end novo:

```
GET  /v1/admin-delivery-payouts/pending          (lista por entregador: nome, telefone, valor devido,
                                                   nº de entregas, data da mais antiga, bankAccount)
POST /v1/admin-delivery-payouts { courierId, expectedAmount }   (registra repasse já pago por fora;
                                                   201 ok · 409 sem saldo/saldo divergente · 403 sem Financial)
GET  /v1/admin-delivery-payouts?courierId=42     (histórico de um entregador)
```

- Exigem papel **admin + permissão `Financial`** (403 esconde a tela do admin sem permissão).
- `pending` traz `refundedDeliveries`/`refundedAmount` (§8.7) — destacar a linha quando `> 0` (não bloqueia o repasse).
- Entregador sem `bankAccount` = sem para onde enviar → marcar a linha.
- **Onde construir:** essas telas pertencem a um **painel administrativo/financeiro**, que **não existe neste PWA**
  (`service-app` não tem nenhuma feature `admin`). Devem ser feitas no portal do admin — não nesta base do cliente.
  Registrado aqui para rastreio; o front do cliente/fornecedor/entregador não muda por causa disso.

---

## BE-W1…BE-W7 — Garantia e pagamento de Trabalhos (auditoria Serviços/Orçamentos/Trabalhos) 🔴

> Levantadas na auditoria do módulo (`docs/auditoria-servicos-orcamentos-garantia.md`), back `@ b60afd0`.
> Decisões de produto **Q-A…Q-E travadas** pelo cliente (ver nota ao fim da seção e §6 do doc).

| ID | Demanda | O que falta no back | Depende de |
|---|---|---|---|
| **BE-W1** | **Execução da garantia.** Aprovar garantia (`PATCH /works/:id/respond-warranty` com `Approved`) só grava `warrantyRequestStatus`; **não** reabre o Work, não cria reparo, não muda status, não cobra, não agenda. `Approved` e `Rejected` rodam o mesmo update. | Modelar a execução do reparo: **(A)** reabertura do Work (novo status `WarrantyInProgress` + endpoints iniciar/concluir reparo) **ou (B, recomendado)** criar **Work de garantia** vinculado (`parentWorkId`, `serviceValue=0`, ciclo próprio). Efeito colateral no `respondWarranty(Approved)`. | **Q-A** |
| **BE-W2** | **Notificação de garantia.** `requestWarranty`/`respondWarranty` não disparam WhatsApp/chat (ao contrário de start/finish/cancel). | Notificar cliente no `respond` e fornecedor no `request` (mesmo padrão de start/finish). | **Q-D** |
| **BE-W3** | **Validade da garantia estruturada.** Front nunca envia `warrantyExpiresAt`; "tempo de garantia" vira texto. Se a validade for definida **na resposta do orçamento**, `UpdateBudgetDto` **não tem** campo de garantia. | Se produto escolher "garantia no orçamento": adicionar campo de garantia em `UpdateBudgetDto` e propagar ao criar o Work. Se "na conclusão": **nada a fazer** (`FinishWorkDto.warrantyExpiresAt` já existe). | **Q-C** |
| **BE-W4** | **Histórico de garantia (slot único).** Colunas no próprio `Work`; nova solicitação sobrescreve a anterior, sem histórico de múltiplos acionamentos. | Se produto exigir múltiplos acionamentos: tabela `WarrantyRequest[]` (ou reaproveitar Work-filho da Opção B). | **Q-A/Q-E** |
| **BE-W5** | **Recusa de garantia sem mediação.** Recusa do fornecedor é final; não há trilha para o admin mediar. | Se produto exigir mediação: estado/rota de contestação + superfície no **portal admin** (fora deste PWA). | **Q-B** |
| **BE-W6** | **Status do Work não reflete pagamento; `Cash` sem caminho.** Após `Paid` (webhook MP), `Work.status` continua `Finished`; "pago" só existe no `Payment` (`referenceType=Work`). `PaymentMethodEnum.Cash` existe mas Work só paga via Mercado Pago (exige provider com conta MP vinculada). | Confirmar se o Work deve expor um estado "pago/concluído-pago" (ou o front junta por `Payment`). Confirmar se haverá pagamento manual/dinheiro para Work ou se é **só MP**. Acréscimo aprovado após pagamento **não re-cobra** (`request-extra` liberado em quase todo status). | **Q-E** |
| **BE-W7** | **Contador de garantias no perfil do fornecedor.** Produto quer exibir no perfil quantas garantias o fornecedor teve — **concluídas ou não**. Front mostra "Garantias totais/atendidas" **hardcoded 0**; o back **não expõe** agregado. | Expor agregado por provider: **total solicitadas**, **concluídas** (Work de garantia `Finished`), **em aberto/recusadas**. Incluir no perfil/`ResponseServiceDto` ou endpoint próprio. Base: Works de garantia (BE-W1) + `respondWarranty` recusados. | ✅ **Q-A** |

> **Decisões travadas (cliente):** Q-A → **Opção B** (Work de garantia vinculado, `serviceValue=0`) + contador no
> perfil (BE-W7); Q-B → recusa **final**, só **listar no admin** (BE-W5, sem contestação); Q-C → validade **na
> conclusão** (`FinishWorkDto.warrantyExpiresAt`, **sem back** — BE-W3 dispensada); Q-D → **sem** notificação
> (BE-W2 adiada); Q-E → **sem custo**. Prioridade de back: **BE-W1** (execução) e **BE-W7** (contador).

> **Nota front (sem back):** a **Fatia 1** de front "garantia respondível" (mapear `warrantyRequestStatus`/descrições
> + tela de resposta do fornecedor `respond-warranty` + modal de solicitação do cliente) foi entregue e **não depende**
> destas demandas — usa o que o back já expõe. O reparo (**BE-W1**) e o contador (**BE-W7**) exigem back novo.

---

## BE-W1 — Especificação: execução da garantia (Opção B, Work de garantia vinculado) 🔴

> **Alvo:** `service-new-ws` (módulo `works`), Prisma/MySQL. Baseado no código auditado `@ b60afd0`
> (`works.service.ts`, `schema.prisma`). Decisões travadas: Q-A **Opção B**, Q-E **sem custo**, Q-B recusa final.
> **Regra de ouro:** um reparo em garantia é um **novo `Work`** ligado ao original — reaproveita todo o ciclo
> (`start`/`confirm-arrival`/`finish`/`cancel`) sem endpoints novos. Nada de reabrir o Work original.

### 1. Schema (`Work`) — colunas novas
| Coluna | Tipo | Observação |
|---|---|---|
| `parentWorkId` | `Int?` | FK auto-relacional para o Work original. **Presente ⇒ é um Work de garantia.** |
| `isWarranty` | `Boolean @default(false)` | Redundante com `parentWorkId != null`, mas explícito p/ filtro/badge (recomendado). |
| `budgetId` | `Int?` **@unique** | **Tornar opcional.** Hoje é `Int @unique` obrigatório; o Work de garantia **não tem budget**. Em MySQL o `@unique` permite múltiplos `NULL`, então continua válido. |

Relações Prisma sugeridas:
```prisma
model Work {
  // ...
  parentWorkId  Int?
  parentWork    Work?   @relation("WorkWarranty", fields: [parentWorkId], references: [id])
  warrantyWorks Work[]  @relation("WorkWarranty")
  isWarranty    Boolean @default(false)
  budgetId      Int?    @unique   // era obrigatório
  budget        Budget? @relation(fields: [budgetId], references: [id])
}
```

### 2. `respondWarranty(user, id, { status, description })` — efeito colateral
Hoje só grava `warrantyRequestStatus/warrantyResponseDescription/warrantyRespondedAt`. Passa a, **em transação**:
- **`status = Rejected`** → mantém o comportamento atual (só registra; nada é criado). Fica consultável no admin (**BE-W5**).
- **`status = Approved`** → registra a resposta **e cria um `Work` de garantia**:
  - `parentWorkId = <work original>.id`, `isWarranty = true`, `budgetId = null`;
  - `serviceId/requesterId/providerId` **copiados** do Work original;
  - `status = Pending` (inicia um ciclo próprio: o fornecedor vai `start` → `finish`);
  - `serviceValue = 0`, `totalValue = 0` (**Q-E — sem custo**);
  - `details` = algo como `"Reparo em garantia do trabalho #<id> — <warrantyRequestDescription>"`;
  - **anexos**: copiar os `WorkFile` do pedido de garantia (`type = WarrantyRequest`) para o novo Work como `Requester` (opcional, recomendado);
  - **chat**: criar um `ChatRoom` próprio para o Work de garantia (mesmo padrão de `create`/`approve`) **ou** reutilizar o chat do Work pai — **decisão de produto Q-F** (recomendo chat próprio p/ isolar a conversa do reparo).

### 3. Travas / regras
- **Idempotência:** `respondWarranty` já exige `warrantyRequestStatus === Pending`; manter, para não criar dois Works de garantia p/ o mesmo acionamento.
- **Sem cobrança:** `pay` deve **recusar** Work com `isWarranty = true` ou `amount === 0` (hoje `amount = totalValue || serviceValue`; com 0 o checkout MP não faz sentido). Retornar erro claro.
- **Garantia de garantia:** bloquear `requestWarranty` quando o Work já é `isWarranty = true` (não encadear reparo de reparo) — ou permitir, **decisão Q-G** (recomendo bloquear no MVP).
- **`request-extra` no Work de garantia:** como é sem custo, bloquear `request-extra` em Work `isWarranty` (senão reintroduz cobrança). 
- **Listagem/rotas:** nenhuma rota nova. O Work de garantia aparece em `GET /works` (provider `Received`, requester `my-requests`) como qualquer trabalho.

### 4. Contrato de resposta (DTOs)
Expor nos `ResponseWorkDto` / `ResponseWorkListItemDto`:
- `parentWorkId?: number` e `isWarranty: boolean` (front badgea "Garantia" e liga pai↔filho);
- opcional: no Work **pai**, um resumo `warrantyWorks: { id, status }[]` (ou `warrantyWorkId`) para navegar do original ao reparo.

### 5. Filtro (opcional, melhora UX de listagem)
Aceitar `?isWarranty=true|false` em `GET /works` para o front separar "trabalhos" de "reparos em garantia" nas abas, se o produto quiser. Sem isso, o front distingue pelo campo `isWarranty` no item.

---

## BE-W7 — Especificação: contador de garantias no perfil do fornecedor 🔴

> **Objetivo (Q-A):** o perfil do fornecedor exibe **quantas garantias** ele teve — **concluídas ou não**.
> Hoje o front mostra "Garantias totais/atendidas" **hardcoded 0** (`ServiceCatalogService.mapDetail`), pois o
> back **não expõe** agregado. Fonte natural do dado: os acionamentos de garantia (`warrantyRequestStatus` nos
> Works) + os **Works de garantia** criados por BE-W1.

### 1. Agregados por `providerId`
| Campo sugerido | Definição (SQL/Prisma) |
|---|---|
| `warrantiesTotal` | nº de **acionamentos** de garantia recebidos = `count(Work where providerId = X and warrantyRequestStatus != null)` |
| `warrantiesApproved` | `count(... and warrantyRequestStatus = Approved)` |
| `warrantiesRejected` | `count(... and warrantyRequestStatus = Rejected)` |
| `warrantiesCompleted` | reparos concluídos = `count(Work where providerId = X and isWarranty = true and status = Finished)` |
| `warrantiesInProgress` | reparos em aberto = `count(Work where providerId = X and isWarranty = true and status in (Pending, InProgress))` |

> "Concluídas ou não" = `warrantiesTotal` (todas), com `warrantiesCompleted` como "atendidas/resolvidas".
> Mapeamento p/ o front (G20): `garantiasTotais = warrantiesTotal`, `garantiasAtendidas = warrantiesCompleted`
> (ou `warrantiesApproved`, **decisão Q-H** — "atendida" = reparo concluído vs. garantia aprovada).

### 2. Onde expor
- **Perfil do fornecedor** (`ResponseProfileDto` de `GET /profile/me`) — para o próprio fornecedor ver seu histórico.
- **Perfil público do prestador** consumido pelo cliente: o front usa **`GET /services/:id`** (`detalhes-prestador`)
  e a tela de aprovação de orçamento. Expor o agregado em `ResponseServiceDto` (ex.: bloco `provider.stats` ou
  campos `providerWarranties*`). Assim as telas que hoje mostram 0 passam a mostrar o número real **sem rota nova**.

### 3. Notas de implementação
- Pode ser **calculado on-the-fly** (queries `count` agrupadas) — volume baixo, não precisa desnormalizar.
- Cuidado para **não contar reparos de reparo** em dobro caso Q-G permita encadear (filtrar `parentWorkId` de 1º nível).
- Sem BE-W1, dá para expor **parcialmente** já: `warrantiesTotal/Approved/Rejected` saem só dos `warrantyRequestStatus`
  (não dependem do Work de garantia). `warrantiesCompleted/InProgress` só fazem sentido depois de BE-W1.

---

## Decisões de produto (Q-F/Q-G/Q-H) — recomendações registradas

> Recomendações do time de front (aguardam ratificação do cliente; a implementação do back pode seguir por elas).

- **Q-F — Chat do reparo de garantia → ✅ recomendação: CHAT PRÓPRIO.**
  O Work de garantia (Opção B) tem **seu próprio `ChatRoom`**, separado do trabalho original.
  *Por quê:* é um novo `Work` com ciclo próprio — um chat dedicado isola a conversa do reparo (evita
  poluir o histórico do atendimento original), mantém o padrão "cada Work tem seu chat" e simplifica a
  regra (a criação do chat de garantia usa o mesmo caminho de `create`/`approve`). O vínculo pai↔filho
  (`parentWorkId`) já permite navegar entre as duas conversas se necessário.

- **Q-G — Reparo de reparo → ✅ recomendação: BLOQUEAR no MVP.**
  `requestWarranty` deve **recusar** quando o alvo já é um Work `isWarranty = true`.
  *Por quê:* evita recursão/aninhamento e complexidade de contador; a garantia cobre o **serviço original**.
  Se o próprio reparo falhar, o tratamento é operacional (novo contato/nova solicitação sobre o trabalho
  original enquanto na janela), não uma garantia aninhada. Reavaliar só se o produto pedir explicitamente.

- **Q-H — "Garantia atendida" no perfil → ✅ recomendação: REPARO CONCLUÍDO.**
  O número de destaque "atendidas" = **`warrantiesCompleted`** (Work de garantia `Finished`), não apenas
  "aprovadas". *Por quê:* para o cliente que olha o perfil, "atendida" significa **problema resolvido**
  (o reparo foi feito), o que é o sinal de confiança real — "aprovada" só indica intenção. Sugestão de
  exibição: número principal = **atendidas/total** (`warrantiesCompleted` / `warrantiesTotal`); expor
  `warrantiesApproved`/`InProgress` como detalhe secundário se o layout quiser.

---

## 🔒 Segurança / Infra

### SEC-1 — Chave do Google Maps embutida no front e sem restrição aparente 🟠

**Onde:** `src/environments/environment.ts` **e** `src/environments/environment.development.ts` trazem a mesma
chave **hardcoded**:

```ts
googleMapsApiKey: 'AIzaSyAngtAtWYaK0dnC29uK9WfchOPj37Xtb4o',
```

**Contexto.** A chave do *Google Maps JavaScript API* é **pública por natureza** (o navegador precisa dela), então
estar no bundle não é, por si só, uma falha. O risco real é **abuso de cota/custo**: sem restrição, qualquer um pode
copiar a chave e gerar faturamento na conta do projeto.

**Ação recomendada (Ops/GCP, não é mudança de API):**
1. No **Google Cloud Console → APIs & Services → Credentials**, restringir a chave por **HTTP referrer**
   (domínios do PWA: produção + homolog) e por **API** (apenas *Maps JavaScript API* + *Places*, que é o que o
   `google-maps-loader` carrega).
2. Idealmente **chaves distintas** por ambiente (dev/homolog/prod) — hoje `environment.ts` e
   `environment.development.ts` compartilham a mesma.
3. Se a chave atual já circulou sem restrição, considerar **rotacioná-la** após aplicar as restrições.

**Front:** nada a fazer no código — o `GoogleMapsLoaderService` já degrada graciosamente quando a chave está vazia
(`disponivel=false`, `load()` rejeita, UI cai no fallback textual; coberto por teste desde o `build-fix-2`).

---

## Observações (sem ação obrigatória de back-end)

- **Serviços gerais = assinatura** (ata) → coberto por `/plans` + `/subscriptions`.
- **Gestão de ícones/imagens pelo admin** (ata) → coberto pelo Portal Gerencial (`/admin-categories` com `iconUrl/iconKey`); fora do PWA.
- **Preços como string** nas respostas (`"350.00"`) e `number` nos requests → o Front trata a conversão.
- **Auto-preenchimento de código de verificação** (ata) → recurso **nativo mobile** (iOS/Android); não se aplica ao PWA web.

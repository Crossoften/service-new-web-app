# Demandas de Back-end — Auditoria (Fluxo + Ata + Swagger)

> Documento consolidado a partir de **três fontes**, na ordem de prioridade do projeto:
> 1. **Documentação funcional** — `fluxoserviceapp.md` (mapa de telas) + **Ata da reunião com o cliente (24/06/2026)**.
> 2. **Swagger/OpenAPI** — `Documentação da API Projeto Service.` (NestJS 10, base `https://homolog.crosoften.com:8029`, prefixo `/v1`).
> 3. **Código Angular** (`service-app`).
>
> **Escopo:** apenas pendências do **Back-end**. Nenhuma alteração de API é feita pelo Front. Correções de FE seguem por patches.
> **Contexto (ata):** projeto ~70% concluído; os 30% restantes = integração FE↔BE + testes. Cadastro real ainda desativado (tudo simulável).

---

## 🐞 Bugs ativos (encontrados na integração)

### BE-NUM-1 — Campos numéricos do corpo recusados: contrato diz `number`, validação exige **string numérica** 🔴

**Impacto:** trava **duas jornadas centrais** — cliente pedir orçamento e fornecedor cadastrar serviço.

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

## Observações (sem ação obrigatória de back-end)

- **Serviços gerais = assinatura** (ata) → coberto por `/plans` + `/subscriptions`.
- **Gestão de ícones/imagens pelo admin** (ata) → coberto pelo Portal Gerencial (`/admin-categories` com `iconUrl/iconKey`); fora do PWA.
- **Preços como string** nas respostas (`"350.00"`) e `number` nos requests → o Front trata a conversão.
- **Auto-preenchimento de código de verificação** (ata) → recurso **nativo mobile** (iOS/Android); não se aplica ao PWA web.

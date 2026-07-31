# Demandas de Back-end — Auditoria (Fluxo + Ata + Swagger)

> Documento consolidado a partir de **três fontes**, na ordem de prioridade do projeto:
> 1. **Documentação funcional** — `fluxoserviceapp.md` (mapa de telas) + **Ata da reunião com o cliente (24/06/2026)**.
> 2. **Swagger/OpenAPI** — `Documentação da API Projeto Service.` (NestJS 10, base `https://homolog.crosoften.com:8029`, prefixo `/v1`).
> 3. **Código Angular** (`service-app`).
>
> **Escopo:** apenas pendências do **Back-end**. Nenhuma alteração de API é feita pelo Front. Correções de FE seguem por patches.
> **Contexto (ata):** projeto ~70% concluído; os 30% restantes = integração FE↔BE + testes. Cadastro real ainda desativado (tudo simulável).

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
| BE-11 | **Partner × Influencer** → unificar em `Influencer` (D2) | 🟠 Alta |
| BE-12 | Confirmar identificador de **login (email × telefone)** | 🟠 Alta |
| BE-13 | Qualidade de contrato (reset senha, `birthDate`, logout) | ⚪ Baixa |
| BE-14 | **Autorização por `profileType`** nos endpoints | 🔴 Crítica |
| BE-15 | **Assinatura como pré-condição** de operação do fornecedor | 🟠 Alta |
| BE-16 | **Cobrança por vertical** (assinatura geral × delivery híbrido) | 🟠 Alta |
| BE-17 | **Repasse** para entregador e parceiro/influencer | 🟠 Alta |

> **Decisões de negócio travadas (blueprint §10):** D1 = 1 perfil por conta · D2 = Parceiro é `Influencer` ·
> D3 = assinatura em todas as verticais de fornecedor (delivery híbrido) · D4 = entregador por repasse, sem assinatura.

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

## BE-11 — Partner × Influencer → unificar em `Influencer` 🟠

**Decisão (D2):** o "Parceiro" do app é o perfil **`Influencer`** (indicação/comissão). 
**Problema:** a API mantém **dois** perfis — `Partner` (cadastro `/no-auth/register/partner`) e `Influencer` — com
papéis sobrepostos.
**Contrato esperado:** depreciar/esclarecer o perfil `Partner`; direcionar o cadastro de "parceiro" do app para
`Influencer` (ou consolidar os dois no backend). O Front passa a mapear **parceiro → `Influencer`**.

---

## BE-12 — Confirmar identificador de login (email × telefone) 🟠

**Conflito entre fontes:** o **fluxo (doc funcional)** diz **"Login: telefone + senha"**; o **Swagger** implementa
**email + senha**; a **ata** é neutra (discute auto-preenchimento de código "SMS ou e-mail", não o identificador).
**Decisão atual (a validar com o cliente):** Front migra para **email + senha** conforme a API. **Sem verificação SMS no
web** (o Swagger diz que `verify-code` é "somente mobile"). Se o cliente exigir **login/registro por telefone + SMS**,
isso vira demanda de backend (login por telefone, envio e verificação de SMS).

---

## BE-14 — Autorização por `profileType` nos endpoints 🔴

**Fonte:** blueprint §8 (perfil define o que pode fazer).
**Problema:** o Swagger só exige `bearerAuth`; **não há gating por perfil** documentado. Um `Client` poderia,
pelo contrato, criar serviço/produto/hospedagem; um não-fornecedor poderia acessar rotas de provedor.
**Contrato esperado:** aplicar autorização por `profileType` — ex.: apenas `Supplier` em `POST /services|/products|
/transportations|/accommodations` e nos `my-*` de oferta; apenas `Client` nos fluxos de consumo/pagamento;
apenas `Delivery` nos pedidos de entrega; apenas `Influencer` nas indicações. Retornar `403` fora do perfil.

**Impacto:** sem isso, as regras de perfil do produto não são garantidas pelo backend (risco de segurança/negócio).

---

## BE-15 — Assinatura como pré-condição de operação do fornecedor 🟠

**Decisão (D3).** **Problema:** não há regra que exija **assinatura ativa** para o `Supplier` publicar/receber demanda.
**Contrato esperado:** bloquear operações de oferta quando não houver assinatura ativa (checar `subscriptions/current`),
com resposta clara (ex.: `403` + motivo) para o Front orientar a contratação.

---

## BE-16 — Modelo de cobrança por vertical do fornecedor 🟠

**Decisão (D3 + ata).** **Regra:** **todas** as verticais de fornecedor exigem **assinatura**; **delivery** admite
**assinatura OU comissão (%)** por estabelecimento (BE-02).
**Contrato esperado:** vincular o `billingType`/regra de cobrança ao contexto do fornecedor e, no delivery, permitir a
escolha por estabelecimento + cálculo de comissão por pedido.

---

## BE-17 — Repasse para entregador e parceiro/influencer 🟠

**Decisão (D4).** **Problema:** entregador (`Delivery`) e parceiro (`Influencer`) **recebem** sem vender catálogo,
mas não há regra de repasse ligada a eles.
**Contrato esperado:** repasse por **entrega concluída** (entregador) e por **indicação convertida** (influencer),
refletidos em `balances/*` e conta bancária, **sem assinatura** para esses perfis.

---

## BE-13 — Qualidade de contrato ⚪

- **`ResetPasswordDto.password` com `maxLength: 8`** (`POST /v1/no-auth/reset`): impede redefinir senhas > 8 caracteres,
  divergindo do cadastro. Alinhar a política de senha entre cadastro e reset.
- **`birthDate` como `type: object`** (`RegisterBaseDto`, `UpdateUserDto` etc.): declarar `type: string, format: date` (ISO 8601).
- **Sem rota de logout/invalidação de token**: `POST /v1/logout` (opcional; hoje logout será só client-side).

---

## Observações (sem ação obrigatória de back-end)

- **Serviços gerais = assinatura** (ata) → coberto por `/plans` + `/subscriptions`.
- **Gestão de ícones/imagens pelo admin** (ata) → coberto pelo Portal Gerencial (`/admin-categories` com `iconUrl/iconKey`); fora do PWA.
- **Preços como string** nas respostas (`"350.00"`) e `number` nos requests → o Front trata a conversão.
- **Auto-preenchimento de código de verificação** (ata) → recurso **nativo mobile** (iOS/Android); não se aplica ao PWA web.

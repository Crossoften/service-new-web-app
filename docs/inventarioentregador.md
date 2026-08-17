# Inventário Detalhado — Entregador (Módulo 7)

> Auditoria da vertical **Entregador** (courier): entender → mapear telas → mapear endpoints →
> comparar Front × API → classificar divergências. **Sem código** — base para os patches.
>
> **Situação:** Front **100% mock** via `core/services/entregador.ts`. Back-end tem o domínio
> `/deliveries/*` (aceitar → coletar → localização → entregar).

---

## 1. Jornada

```
Home (ganhos + entrega pendente + atividades)
  ├─ Entregas disponíveis → aceitar/recusar
  └─ Entrega ativa: aceitar → coletar no restaurante → (enviar localização) → entregar ao cliente
```

## 2. Telas atuais (3) — mock (`EntregadorService`)

| # | Rota | Componente | Estado atual |
|---|---|---|---|
| E1 | `/entregador/home` | `HomeEntregadorComponent` | faturamento (dia/semana/mês) + **1 pedido pendente** + atividades recentes |
| E2 | `/entregador/trabalhos` | `TrabalhosEntregadorComponent` | histórico de atividades (mock) |
| E3 | `/entregador/entrega/:id` | `StatusEntregaComponent` | status da entrega, botão **avançar status** (caminho→retirado→a_caminho→entregue) — local |

## 3. Endpoints da API — `/deliveries`

| Ação | Método + rota | Request | Response |
|---|---|---|---|
| Entregas **disponíveis** | `GET /v1/deliveries/available` | — | `ResponseFindAllDeliveryDto` |
| **Minhas** entregas | `GET /v1/deliveries/me` | — | `ResponseFindAllDeliveryDto` |
| Detalhe da entrega | `GET /v1/deliveries/{id}` | — | `ResponseDeliveryDto` |
| **Aceitar** | `PATCH /v1/deliveries/{id}/accept` | — | `ResponseDeliveryDto` |
| **Recusar** (já aceita → volta à fila) | `PATCH /v1/deliveries/{id}/reject` | — | `ResponseDeliveryDto` |
| **Coletar** no restaurante | `PATCH /v1/deliveries/{id}/pickup` | — | `ResponseDeliveryDto` |
| **Entregar** ao cliente | `PATCH /v1/deliveries/{id}/deliver` | — | `ResponseDeliveryDto` |
| **Localização** (tempo real) | `PATCH /v1/deliveries/{id}/location` | `UpdateDeliveryLocationDto` `{lat, lng}` | `ResponseDeliveryDto` |

### 3.1 DTOs-chave

- **`ResponseDeliveryDto`**: `id`, `status` ∈ `Pending·Accepted·Rejected·PickedUp·OnTheWay·Delivered·Cancelled`, `courierId?`, `currentLat?`, `currentLng?`, `locationUpdatedAt?`, `foodOrder` (o pedido — `ResponseFoodOrderDto`), `acceptedAt?·rejectedAt?·pickedUpAt?·deliveredAt?·cancelledAt?`, `createdAt`, `updatedAt`.
- **`ResponseFindAllDeliveryDto`**: `{ deliveries[], currentPage, totalPages, totalRecords }`.
- **`UpdateDeliveryLocationDto`**: `{ lat: number, lng: number }`.

## 4. Mapeamento de status (mock → API)

| Ação do entregador | API status | Transição |
|---|---|---|
| (disponível) | `Pending` | — |
| Aceitar | `Accepted` | `PATCH /accept` |
| Coletar | `PickedUp` | `PATCH /pickup` |
| A caminho | `OnTheWay` | via `PATCH /location` (envio de GPS) |
| Entregar | `Delivered` | `PATCH /deliver` |
| Recusar | `Rejected` | `PATCH /reject` (volta à fila) |

## 5. Divergências classificadas

| # | Divergência | Categoria | Ação |
|---|---|---|---|
| E-a | 1 "pedido pendente" mock × `GET /deliveries/available` (fila real) | Front | listar disponíveis + aceitar/recusar |
| E-b | Status local (avançar) × `accept/pickup/deliver` reais | Front | botões por status real |
| E-c | Atividades mock × `GET /deliveries/me` (histórico/ativas) | Front | consumir minhas entregas |
| E-d | **Faturamento** dia/semana/mês × **não há endpoint** de ganhos do entregador | **Back** | BE-17 — expor `GET /deliveries/me/earnings` (ou em `/balances`) |
| E-e | **Endereço de destino** não vem no pedido/entrega (`foodOrder` sem endereço; delivery só tem GPS do courier) | **Back** | BE-D2 — o entregador precisa do endereço do cliente para entregar |
| E-f | Envio de **localização (GPS)** não existe no Front × `PATCH /location` | Front | capturar geolocalização e enviar periodicamente (na entrega ativa) |
| E-g | Rastreamento é **polling** (sem WebSocket) | — | envio a cada X s enquanto `PickedUp/OnTheWay` |

## 6. Demandas de back-end (novas/relacionadas)

| # | Gap | Status |
|---|---|---|
| BE-17 | Sem relatório de **ganhos do entregador** (a Home mostra faturamento) | ⚠️ expor `GET /v1/deliveries/me/earnings` (ou `/balances/*`) |
| BE-D2 | Pedido/entrega **sem endereço de destino** — o entregador não sabe para onde levar | ❗ incluir endereço de entrega no `foodOrder`/`delivery` |

## 7. Plano de fatiamento (proposto)

| Slice | Escopo | Endpoints |
|---|---|---|
| **E-1 — Home & Disponíveis** | `DeliveryCourierService`; entregas disponíveis (`available`) + aceitar/recusar; minhas entregas/atividades (`me`); faturamento = placeholder até BE-17 (E1, E2) | `GET /deliveries/available`, `GET /deliveries/me`, `PATCH accept/reject` |
| **E-2 — Entrega ativa** | detalhe (`{id}`) + fluxo aceitar→coletar→entregar; **envio de localização** (GPS via `navigator.geolocation` → `PATCH /location`) enquanto ativo (E3) | `GET /deliveries/{id}`, `PATCH pickup/deliver/location` |

## 8. Pendências que precisam da sua decisão

| Item | Decisão |
|---|---|
| **E-d — Faturamento** | Exibir placeholder ("em breve") até o back expor ganhos (BE-17), ou remover o card por ora? |
| **E-e — Endereço de destino** | Confirmar com o back como o entregador recebe o endereço do cliente (BE-D2) — hoje não vem. |
| **E-f — GPS** | Enviar a localização real do navegador (`navigator.geolocation`) periodicamente na entrega ativa? (pede permissão do usuário) |

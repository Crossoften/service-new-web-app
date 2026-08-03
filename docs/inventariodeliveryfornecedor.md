# Inventário Detalhado — Delivery (Fornecedor)

> Auditoria da vertical **Delivery Fornecedor** (visão do restaurante): entender → mapear telas →
> mapear endpoints → comparar Front × API → classificar divergências. **Sem código** — base para os patches.
>
> **Situação:** Front **100% mock** via `core/services/fornecedor.ts`. Back-end já tem o domínio completo
> (`/restaurants/*`, `/restaurants/menu-*`, `/food-orders/*/respond|preparing`, `/restaurants/me/payouts`).

---

## 1. Jornada

```
Home (faturamento + pedidos recebidos + abrir/fechar loja)
  ├─ Pedido recebido → aceitar/recusar → em preparo   (courier cuida de "a caminho/entregue")
  ├─ Cardápio → item (criar/editar) → categorias/adicionais
  └─ Faturamento → payout (repasse por comissão)
```

## 2. Telas atuais (4) — todas mock (`FornecedorService`)

| # | Rota | Componente | Estado atual |
|---|---|---|---|
| F1 | `/fornecedor/home` | `HomeFornecedorComponent` | faturamento (dia/semana/mês) + lista de pedidos + toggle aberto/fechado (**local**) |
| F2 | `/fornecedor/cardapio` | `GerenciarCardapioComponent` | lista de itens (mock, categoria = string) |
| F3 | `/fornecedor/cardapio/novo` · `/editar/:id` | `AddCardapioComponent` | form item (nome, descrição, valor, categoria, imagem) → `salvarItem` local |
| F4 | `/fornecedor/pedido/:id` | `DetalhesPedidoFornecedorComponent` | detalhe + **troca livre de status** (recebido→…→entregue/cancelado) local |

## 3. Endpoints da API — Delivery Fornecedor

| Ação | Método + rota | Request | Response |
|---|---|---|---|
| Meu restaurante | `GET /v1/restaurants/me` | — | `ResponseRestaurantDto` (com `menuCategories→items→additions`) |
| Criar restaurante | `POST /v1/restaurants` | `CreateRestaurantDto` | `CreateRestaurantResponseDto` |
| Atualizar restaurante | `PATCH /v1/restaurants/{id}` | `UpdateRestaurantDto` | `ResponseRestaurantDto` |
| Criar categoria de cardápio | `POST /v1/restaurants/menu-categories` | `CreateMenuCategoryDto` | `ResponseMenuCategoryDto` |
| Editar categoria | `PATCH /v1/restaurants/menu-categories/{id}` | `UpdateMenuCategoryDto` | `ResponseMenuCategoryDto` |
| Criar item | `POST /v1/restaurants/menu-items` | `CreateMenuItemDto` | — |
| Editar item | `PATCH /v1/restaurants/menu-items/{id}` | `UpdateMenuItemDto` | — |
| Criar adicional | `POST /v1/restaurants/menu-items/{id}/additions` | `CreateMenuItemAdditionDto` | — |
| Editar adicional | `PATCH /v1/restaurants/menu-item-additions/{id}` | `UpdateMenuItemAdditionDto` | — |
| Pedidos recebidos | `GET /v1/food-orders?status&take&skip` | — | `ResponseFindAllFoodOrderDto` ¹ |
| Detalhe do pedido | `GET /v1/food-orders/{id}` | — | `ResponseFoodOrderDto` |
| **Aceitar/Recusar** | `PATCH /v1/food-orders/{id}/respond` | `RespondFoodOrderDto` `{status: Accepted\|Cancelled}` | `ResponseFoodOrderDto` |
| **Marcar em preparo** | `PATCH /v1/food-orders/{id}/preparing` | — | `ResponseFoodOrderDto` |
| Payout/repasse | `GET /v1/restaurants/me/payouts` | — | `ResponseRestaurantPayoutDto` |

¹ **`GET /food-orders` serve os dois lados** — o summary diz "pedidos do usuário logado (**cliente ou restaurante**)".
Logado como `Supplier`, retorna os pedidos do restaurante. (Reaproveita `DeliveryService.getMeusPedidos`.)

### 3.1 DTOs-chave (⚠️ `price` é **number** no create, **string** no response)

- **`CreateRestaurantDto`** (obrig. `name`, `categoryId`): + `description?`, `imageUrl?`, `imageKey?`.
- **`UpdateRestaurantDto`**: `name?`, `description?`, `imageUrl?`, `imageKey?`, `categoryId?`, **`isOpen?`**, **`isActive?`**.
- **`CreateMenuCategoryDto`** (obrig. `name`): + `sortOrder?`.
- **`CreateMenuItemDto`** (obrig. `name`, `price`(**number**), `menuCategoryId`): + `description?`, `imageUrl?`, `imageKey?`.
- **`CreateMenuItemAdditionDto`** (obrig. `name`): + `price?`(number).
- **`RespondFoodOrderDto`**: `status` ∈ `Accepted | Cancelled`.
- **`ResponseRestaurantPayoutDto`**: `billingType`, `commissionRate?`, `totalOrders`, `totalItemsValue`, `totalCommission`, `netAmount` (agregado, **sem dia/semana/mês**).

## 4. Divergências classificadas

| # | Divergência | Categoria | Ação |
|---|---|---|---|
| DF-a | Cardápio plano (categoria = string) × API estruturada (`menuCategories→items→additions` com ids) | Front | criar categorias reais; item usa `menuCategoryId` numérico |
| DF-b | `salvarItem` local × `POST/PATCH /menu-items` (`price` **number**) | Front | integrar create/edit |
| DF-c | `removerItem` local × **não há DELETE** de item na API | Back+Front | soft-delete via `PATCH isActive=false` (**decisão**) → BE-F1 |
| DF-d | Status do pedido: troca livre (5 estados) × fornecedor só faz `respond`(Accepted/Cancelled) + `preparing` | **Negócio** | limitar ações a Aceitar/Recusar/Em preparo (courier cuida do resto) |
| DF-e | Faturamento dia/semana/mês × payout **agregado** | **Negócio+Back** | exibir agregado (totalOrders, totalItemsValue, totalCommission, netAmount) → periodização = BE-F2 |
| DF-f | Home assume restaurante existente × precisa `GET /restaurants/me` (404 → **criar**) | Front | onboarding: criar restaurante (`POST /restaurants`) se não houver |
| DF-g | Abrir/fechar loja local × `PATCH /restaurants/{id}` `{isOpen}` | Front | persistir toggle |
| DF-h | Imagens (restaurante/item) | Front | upload via `/upload/one-file` → `imageUrl/imageKey` |

## 5. Demandas de back-end (novas)

| # | Gap | Sugestão |
|---|---|---|
| BE-D5 | `GET /restaurants/categories` retorna **sem `iconUrl`** (grid do cliente fica sem ícone) | incluir `iconUrl`, ou o Front usa ícones locais por `slug` (fallback) |
| BE-F1 | Sem **DELETE** de item/categoria/adicional de cardápio | expor DELETE **ou** confirmar soft-delete por `isActive` |
| BE-F2 | Payout é **agregado** (sem recorte por período) | opcional: `GET /restaurants/me/payouts?period=day\|week\|month` |

## 6. Plano de fatiamento (proposto)

| Slice | Escopo | Endpoints |
|---|---|---|
| **DF-1 — Restaurante & Cardápio** | `RestaurantService`; `GET /restaurants/me` (+criar se 404); gerenciar/adicionar/editar item; categorias; abrir/fechar (`isOpen`); soft-delete (F2, F3) | `/restaurants/me`, `POST /restaurants`, `PATCH /restaurants/{id}`, `menu-categories`, `menu-items` |
| **DF-2 — Pedidos & Faturamento** | pedidos recebidos (`GET /food-orders`), detalhe + aceitar/recusar/preparo (F1, F4); payout (F1) | `GET /food-orders`, `.../respond`, `.../preparing`, `/restaurants/me/payouts` |

## 7. Pendências que precisam da sua decisão

| Item | Decisão |
|---|---|
| **DF-c — Remover item** | Soft-delete (`isActive=false`, "Desativar") ou aguardar DELETE (BE-F1)? |
| **DF-d — Status do pedido** | Limitar o fornecedor a **Aceitar / Recusar / Em preparo** (courier cuida de a caminho/entregue)? |
| **DF-e — Faturamento** | Exibir o **payout agregado** (troca dia/semana/mês) ou aguardar periodização (BE-F2)? |
| **DF-f — Onboarding** | Incluir o fluxo **criar restaurante** quando `GET /restaurants/me` não existir? |

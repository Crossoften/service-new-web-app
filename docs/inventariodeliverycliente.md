# Inventário Detalhado — Delivery (Cliente)

> Auditoria da vertical **Delivery Cliente** (fluxo do consumidor): entender → mapear telas →
> mapear endpoints → comparar Front × API → classificar divergências. **Sem código** — base para os patches.
>
> **Situação:** o fluxo do Front está **100% mock** (via `core/services/delivery.ts`). O back-end
> já tem o domínio transacional completo (`/restaurants`, `/food-orders`).

---

## 1. Objetivo e jornada

Permitir que o **cliente** navegue por restaurantes, monte um pedido (itens + adicionais), escolha
pagamento/endereço e **finalize** o pedido, acompanhando o status em tempo (quase) real.

```
/delivery (categorias) → /delivery/listagem/:cat (restaurantes) → /delivery/restaurante/:id (cardápio)
  → /delivery/item/:id (item + adicionais) → /delivery/sacola (carrinho + pagamento)
  → /delivery/endereco (endereço + entrega) → /delivery/revisao (revisão) → /delivery/status/:id (acompanhamento)
```

---

## 2. Telas atuais (8) — todas mock

| # | Rota | Componente | Estado atual |
|---|---|---|---|
| T1 | `/delivery` | `CategoriaDeliveryComponent` | **18 categorias hardcoded** (labels + ícones locais) |
| T2 | `/delivery/listagem/:categoria` | `ListagemDeliveryComponent` | `DeliveryService.getRestaurantes()` → `RESTAURANTES_MOCK` (ignora a categoria); busca local |
| T3 | `/delivery/restaurante/:id` | `RestauranteComponent` | `getRestaurante(id)` mock; abas por categoria do cardápio |
| T4 | `/delivery/item/:id` | `CardapioItemComponent` | `getItem()`; quantidade + **adicionais mock (4 fixos)** |
| T5 | `/delivery/sacola` | `SacolaComponent` | carrinho em memória; **pagamento: credito/debito/pix/dinheiro** |
| T6 | `/delivery/endereco` | `EnderecoEntregaComponent` | **endereço hardcoded**; opção de entrega Padrão/Express (mock) |
| T7 | `/delivery/revisao` | `RevisaoPedidoComponent` | revisão; `finalizarPedido()` gera **id aleatório** (mock) |
| T8 | `/delivery/status/:id` | `StatusPedidoComponent` | **progresso falso** (`setInterval` a cada 5s); dados do restaurante hardcoded |

**Camada mock:** `core/services/delivery.ts` — interfaces `Restaurante/CategoriaCardapio/ItemCardapio/Adicional/Pedido`
(em português) + `RESTAURANTES_MOCK`, carrinho em memória (`pedidoAtual`), `calcularTotal()`, `finalizarPedido()`.
Já tem comentários `// Futuramente: this.http.get(...)` — foi desenhada para virar integração.

---

## 3. Endpoints da API — Delivery Cliente

| Ação | Método + rota | Auth | Request | Response |
|---|---|---|---|---|
| Categorias de restaurante | `GET /v1/restaurants/categories` | — | — | `ResponseRestaurantCategoryDto` |
| Listar restaurantes | `GET /v1/restaurants?categoryId&take&skip` | 🔒 | — | `ResponseFindAllRestaurantDto` (paginado) |
| Restaurante + cardápio | `GET /v1/restaurants/{id}` | 🔒 | — | `ResponseRestaurantDto` (com `menuCategories→items→additions`) |
| Criar pedido | `POST /v1/food-orders` | — ¹ | `CreateFoodOrderDto` | `CreateFoodOrderResponseDto` |
| Listar meus pedidos | `GET /v1/food-orders?status&take&skip` | — ¹ | — | `ResponseFindAllFoodOrderDto` |
| Detalhe/rastreio do pedido | `GET /v1/food-orders/{id}` | — ¹ | — | `ResponseFoodOrderDto` |
| Cancelar pedido | `PATCH /v1/food-orders/{id}/cancel` | — ¹ | `CancelFoodOrderDto` `{cancelReason}` | `ResponseFoodOrderDto` |

¹ As rotas de `food-orders` não declaram `bearerAuth` explícito no contrato, mas a regra "**Apenas clientes podem
realizar pedidos**" (BE-14) implica sessão. O `authInterceptor` já anexa o token quando houver — **confirmar com a API**
se o pedido exige Bearer (provável).

### 3.1 DTOs-chave

- **`ResponseRestaurantDto`**: `id, name, description?, imageUrl?, isActive, isOpen, category(RestaurantCategory), userId, menuCategories[], createdAt, updatedAt`.
- **`ResponseMenuCategoryDto`**: `id, name, sortOrder, items[]`.
- **`ResponseMenuItemDto`**: `id, name, description?, price(**string**), imageUrl?, isActive, menuCategoryId, additions[]`.
- **`ResponseMenuItemAdditionDto`**: `id, name, price(**string**), isActive`.
- **`CreateFoodOrderDto`** (obrig.: `restaurantId`, `paymentMethod`, `items`): `paymentMethod` ∈ `CreditCard|Pix|BankSlip`; `deliveryFee?`(number), `notes?`; `items[]` = `CreateFoodOrderItemDto {menuItemId, quantity, notes?, additionIds[]}`.
- **`ResponseFoodOrderDto`**: `id, status, itemsValue, deliveryFee, totalValue, platformFeeRate?, commissionAmount?, paymentMethod, notes?, cancelReason?, chatRoomId, restaurant, customer, items[], delivery?, acceptedAt?, cancelledAt?, deliveredAt?, createdAt, updatedAt`.
  - `status` ∈ `Received | Accepted | Preparing | OnTheWay | Delivered | Cancelled`.
  - `delivery` (`ResponseFoodOrderDeliveryDto`): `id, status, courierId, currentLat, currentLng, locationUpdatedAt` → **rastreio no mapa por polling**.
  - `items` (`ResponseFoodOrderItemDto`): `id, menuItemId, name, quantity, unitPrice, notes, additions`.

---

## 4. Matriz de Cobertura — Delivery Cliente

| Tela / Ação | Endpoint | Status | Observação |
|---|---|---|---|
| Categorias (T1) | `GET /restaurants/categories` | 🔴 **Mock** | trocar 18 labels fixas pelas categorias reais (`id/name/slug/iconUrl`) |
| Listagem (T2) | `GET /restaurants?categoryId&take&skip` | 🔴 **Mock** | filtro real por `categoryId` + paginação; **sem `search` na API** |
| Restaurante+cardápio (T3) | `GET /restaurants/{id}` | 🔴 **Mock** | menu real `menuCategories→items→additions` |
| Item + adicionais (T4) | (do restaurante) | 🔴 **Mock** | adicionais reais do item; guardar `menuItemId`/`additionIds` no carrinho |
| Sacola/pagamento (T5) | — (monta `CreateFoodOrderDto`) | 🔴 **Mock** | mapear pagamento p/ enum da API (ver D5) |
| Endereço/entrega (T6) | — | 🟠 **Divergente** | pedido **não recebe endereço**; usa endereço do perfil (Módulo 2). Express/Padrão não existe na API (D6) |
| Revisão/finalizar (T7) | `POST /food-orders` | 🔴 **Mock** | criar pedido real |
| Acompanhamento (T8) | `GET /food-orders/{id}` (polling) | 🔴 **Mock** | status real (6 estados) + rastreio `delivery.lat/lng` |

---

## 5. Divergências classificadas

| # | Divergência | Categoria | Ação |
|---|---|---|---|
| D1 | Categorias hardcoded (18) × `GET /restaurants/categories` | Front | consumir categorias reais |
| D2 | `getRestaurantes()` ignora categoria; sem paginação × `?categoryId&take&skip` | Front | filtro + paginação reais |
| D3 | Modelo mock (pt) × `ResponseRestaurantDto` (menuCategories→items→additions) | Front | novos models espelhando a API |
| D4 | `preco: number` × `price: **string**` (todo dinheiro é string) | Front | tratar string→number na exibição |
| D5 | Pagamento FE `credito/debito/pix/dinheiro` × API `CreditCard/Pix/BankSlip` | **Negócio** | `credito→CreditCard`, `pix→Pix`; **`debito` e `dinheiro` não existem** (decisão) |
| D6 | Endereço/opção de entrega mock × API não recebe endereço; `deliveryFee` é número | **Negócio+Back** | usar endereço do perfil; definir origem da `deliveryFee` e se há "Express" |
| D7 | `finalizarPedido()` id aleatório × `POST /food-orders` | Front | criar pedido real |
| D8 | Status falso (4, `setInterval`) × API 6 estados + polling | Front | mapear estados; polling do `GET /food-orders/{id}` |
| D9 | Adicionais mock (4 fixos) × `item.additions[]` reais | Front | usar adicionais do item; enviar `additionIds[]` |
| D10 | `notes` (item e pedido) não coletadas | Front (UX) | opcional: observações no item/pedido |
| D11 | `chatRoomId` no pedido ignorado | Front | liga ao módulo de Chat (futuro) |
| D12 | Campos de restaurante inexistentes na API (ver §6) | **Back** | avaliação, tempo de entrega, logo, taxa fixa |

---

## 6. Demandas de back-end (gaps do Delivery Cliente)

| # | Gap | Necessidade | Sugestão |
|---|---|---|---|
| BE-D1 | `ResponseRestaurantDto` **não tem** `avaliação`, `tempo de entrega`, `logo`, `taxa de entrega fixa` | UI atual mostra esses campos | incluir `rating`, `estimatedTime`, `logoUrl`, `deliveryFee` no restaurante — **ou** remover da UI |
| BE-D2 | `POST /food-orders` **não recebe endereço** de entrega | saber para onde entregar | confirmar que usa o endereço do perfil; suportar múltiplos endereços? |
| BE-D3 | `paymentMethod` só `CreditCard/Pix/BankSlip` | UI oferece débito e dinheiro | confirmar métodos válidos; se dinheiro na entrega é suportado |
| BE-D4 | `deliveryFee` é enviado pelo **cliente** no `CreateFoodOrderDto` | quem calcula o frete? | idealmente o back calcula/valida o frete (evitar cliente definir) |

> Estas entram como **BE-D1…BE-D4** em `docs/backend-demandas.md` (não bloqueiam a integração — a maioria é UI/decisão).

---

## 7. Mapeamento de campos (mock → API)

| Mock (pt) | API | Nota |
|---|---|---|
| `Restaurante.nome` | `name` | |
| `Restaurante.descricao` | `description` | |
| `Restaurante.imagem`/`logo` | `imageUrl` | logo separado não existe (BE-D1) |
| `Restaurante.avaliacao`/`tempo`/`taxaEntrega` | — | não existem (BE-D1) |
| `CategoriaCardapio` | `ResponseMenuCategoryDto` | `nome→name`, ordena por `sortOrder` |
| `ItemCardapio.preco` | `price` (string) | `Number(price)` na exibição |
| `Adicional.preco` | addition `price` (string) | idem |
| `ItemPedido {item, quantidade, adicionais}` | `CreateFoodOrderItemDto {menuItemId, quantity, additionIds[]}` | guardar ids reais no carrinho |

## 8. Mapeamento de status (T8)

| API | FE atual | UI sugerida |
|---|---|---|
| `Received` | recebido | Pedido recebido |
| `Accepted` | — | Confirmado *(novo)* |
| `Preparing` | preparo | Em preparo |
| `OnTheWay` | caminho | A caminho *(+ mapa via `delivery.lat/lng`)* |
| `Delivered` | entregue | Entregue |
| `Cancelled` | — | Cancelado *(novo)* |

---

## 9. Plano de fatiamento (proposto)

| Slice | Escopo | Endpoints |
|---|---|---|
| **DC-1 — Catálogo** | models + `DeliveryService` real; categorias reais (T1); listagem por `categoryId`+paginação (T2); restaurante+cardápio (T3); item+adicionais (T4) | `GET /restaurants/categories`, `GET /restaurants`, `GET /restaurants/{id}` |
| **DC-2 — Carrinho & Checkout** | carrinho com ids reais; sacola/pagamento (T5, mapear enum); endereço via perfil (T6); revisão + `POST /food-orders` (T7) | `POST /food-orders` (+ `GET /profile/me` p/ endereço) |
| **DC-3 — Acompanhamento** | status real por polling (T8), 6 estados; rastreio `delivery.lat/lng`; cancelar pedido; "Meus pedidos" (`GET /food-orders`) | `GET /food-orders/{id}`, `GET /food-orders`, `PATCH /food-orders/{id}/cancel` |

---

## 10. Pendências que precisam da sua decisão (antes dos patches)

| Item | Decisão necessária |
|---|---|
| **D5 — Pagamento** | Manter só `CreditCard`+`Pix` (remover débito/dinheiro do web) ou pedir suporte no back (BE-D3)? |
| **D6 — Endereço/Frete** | Endereço do pedido vem do **perfil** (Módulo 2)? Manter opção "Express/Padrão" (não existe na API)? Quem define `deliveryFee` (BE-D4)? |
| **BE-D1 — Campos do restaurante** | Remover avaliação/tempo/logo/taxa da UI **ou** aguardar back incluir? (sugiro remover da UI por ora e documentar a demanda) |
| **Auth do pedido** | Confirmar se `POST /food-orders` exige Bearer (provável). |

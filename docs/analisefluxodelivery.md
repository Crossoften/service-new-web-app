# 🍔 Revisão do fluxo de Delivery — benchmark iFood / Zé Delivery

> Auditoria do fluxo atual (fornecedor + cliente) contra os padrões de mercado, com **backlog priorizado**.
> Base: `origin/integracao` @ `290db7c`. Fonte: mapeamento das telas + auditoria do back `service-new-ws`.
> Legenda de esforço: 🟢 front-only (back pronto) · 🟡 front + ajuste pequeno · 🔴 depende de back novo.

---

## 1. Estado atual (o que já existe)

**Cliente:** categorias → lista de restaurantes → restaurante (cardápio por categoria) → item (quantidade + adicionais)
→ sacola (forma de pagamento) → endereço → revisão → status (stepper + mapa ao vivo + pagar online/dinheiro + chat)
→ histórico de pedidos.

**Fornecedor:** home (repasse por período) · restaurante (cadastro + endereço/mapa + tempo de entrega) ·
cardápio (itens CRUD + **adicionais — ADD-1**) · pedidos recebidos (aceitar/recusar/preparo/confirmar pagamento) · Mercado Pago.

**Entregador:** home · trabalhos · entrega (coleta/entrega + GPS ao vivo).

O esqueleto do fluxo está **completo e integrado**. O que falta são refinamentos de usabilidade que o mercado consolidou.

---

## 2. Backlog priorizado

### 🎯 Prioridade ALTA — completam algo que já existe pela metade

| Id | Item | O quê | Esforço |
|---|---|---|---|
| **ADD-1** | **Adicionais no cardápio (fornecedor)** — ✅ **feito** | O cliente já tinha o seletor de adicionais, mas o fornecedor não tinha como cadastrá-los. Criado no form do item (criar/editar). | 🟢 |
| **ADD-2** | **Mostrar adicionais no pedido** | Hoje `revisao-pedido` (cliente) e `detalhes-pedido-fornecedor` (cozinha) **não exibem** os adicionais escolhidos, e `ResponseFoodOrderItemDto.additions` está tipado como `unknown[]`. A cozinha precisa ver "X-Burguer + Bacon" para preparar certo. Tipar e renderizar. | 🟢 |
| **OBS-1** | **Observação por item** | iFood/Zé deixam o cliente escrever "sem cebola" no item. O back já aceita (`CreateFoodOrderItemDto.notes`), o modelo do front também — falta o campo na tela `cardapio-item`. | 🟢 |
| **CART-1** | **Editar a sacola** | Conferir/garantir: alterar quantidade e remover item na sacola (padrão de mercado). Carrinho é client-side, então é front puro. | 🟢 |

### 🔎 Prioridade MÉDIA — descoberta e recompra

| Id | Item | O quê | Esforço |
|---|---|---|---|
| **SEARCH-1** | **Busca + filtros de restaurante** | A lista não tem busca nem filtros (aberto agora, tempo de entrega, categoria, avaliação). Dá pra fazer client-side sobre `GET /restaurants`. | 🟢/🟡 |
| **REORDER-1** | **Pedir novamente** | No histórico, repetir um pedido com 1 toque (staple iFood). Reusa `GET /food-orders/{id}` → monta a sacola. | 🟢 |
| **RATE-1** | **Avaliar após a entrega** | Já existe envio de avaliação na tela do restaurante; falta o **gatilho** pós-entrega (quando `Delivered`, oferecer avaliar o pedido). | 🟡 |
| **EMPTY-1** | **Estados vazios/erro caprichados** | Sacola vazia, sem restaurantes, falha de rede — mensagens e ilustrações no padrão do resto do app. | 🟢 |

### 🧾 Prioridade a DEFINIR — dependem de back-end novo

| Id | Item | O quê | Esforço |
|---|---|---|---|
| **COUPON-1** | **Cupons / promoções** | Não há entidade de cupom no back (sem `Coupon`/`discount` no schema). Precisa modelar no back antes do front. | 🔴 |
| **SCHED-1** | **Agendar pedido** | `FoodOrder` não tem `scheduledFor`. Back primeiro. | 🔴 |
| **TIP-1** | **Gorjeta ao entregador** | Sem campo de gorjeta no pedido. Back primeiro. | 🔴 |
| **PUSH-1** | **Notificação de status (PWA push)** | Avisar "saiu para entrega" fora do app. Exige service worker + Web Push + suporte no back. | 🔴 |

---

## 3. Recomendação de sequência

1. **ADD-1** ✅ (feito) → **ADD-2** (mostrar adicionais no pedido) → **OBS-1** (observação por item) → **CART-1** (editar sacola).
   Esses quatro fecham o fluxo de montagem do pedido no padrão iFood, e são todos 🟢 (back pronto).
2. Depois: **SEARCH-1**, **REORDER-1**, **RATE-1**, **EMPTY-1** (descoberta + recompra + acabamento).
3. Os 🔴 (cupom, agendamento, gorjeta, push) entram como **demandas de back-end** (`docs/backend-demandas.md`) para
   priorização conjunta — não dá para fazer só no front.

> Cada item vira uma fatia (patch) individual, auditada (build + specs), como no restante do projeto.

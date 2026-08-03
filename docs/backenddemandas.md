# Demandas de Back-end — STATUS pós-implementação

> Cruzamento das demandas (BE-01…BE-17) com o **Swagger atualizado**. O time de back-end implementou
> a grande maioria. Este documento vira um **tracker de status**.
>
> **Última atualização:** 2026-07-31 (Swagger novo).

## Resumo

| # | Demanda | Endpoint(s) entregues | Status |
|---|---|---|---|
| BE-01 | Delivery domínio | `/restaurants`, `/restaurants/menu-*`, `/food-orders` | ✅ Implementado |
| BE-02 | Cobrança híbrida delivery | `billingType`, `/restaurants/me/payouts`, `commissionAmount` no pedido | ✅ Implementado |
| BE-03 | Entregador + rastreamento | `/deliveries/*` (accept/reject/pickup/**location**/deliver) | ✅ Implementado |
| BE-04 | Aluguel transacional | `/rentals/*` | ✅ Implementado |
| BE-05 | Transporte pedido | `/transport-requests/*` | ✅ Implementado |
| BE-06 | Hospedagem reserva | `/bookings/*` | ✅ Implementado |
| BE-07 | Empregos | `/jobs/*` (+ apply, applications) | ✅ Implementado |
| BE-08 | ChatContextType ampliado | +`Rental,TransportRequest,Booking,FoodOrder,Job` | ✅ Implementado |
| BE-09 | Negociação além de Product | entidades próprias por vertical | ✅ Resolvido por design |
| BE-10 | Indicações do usuário | `/referrals/me`, `/referrals/me/summary` | ✅ Implementado |
| BE-11 | Partner × Influencer | `Partner` removido; Influencer é o perfil de indicação | ✅ Resolvido |
| BE-12 | Login email × telefone | mantido email (decisão) | ✅ N/A |
| BE-13 | Qualidade de contrato | `/logout` criado; reset `minLength 8/maxLength 32` | 🟡 Falta `birthDate` (ainda `type:object`) |
| BE-14 | Autorização por `profileType` | 403 explícitos nas rotas de delivery/food-order/deliveries | ✅ Implementado |
| BE-15 | Assinatura como pré-condição do fornecedor | não indicado no contrato | ⚠️ Verificar com a API |
| BE-16 | Cobrança por vertical | delivery híbrido (payouts) | ✅ Implementado |
| BE-17 | Repasse entregador/influencer | payouts (restaurante) + comissão (influencer); entregador não explícito | 🟡 Parcial |

## Pendências remanescentes (para o time de API)

1. **BE-15 — Assinatura como pré-condição.** Confirmar se um `Supplier` sem assinatura ativa é bloqueado ao
   publicar/receber demanda (checagem em `subscriptions/current`), com `403` + motivo para o Front orientar.
2. **BE-17 — Repasse ao entregador.** Existe payout do restaurante (`/restaurants/me/payouts`) e comissão do
   influencer (`/referrals/me/summary`), mas **não há** relatório/repasse de ganhos do **entregador**
   (por entrega concluída). Sugerir `GET /v1/deliveries/me/earnings` ou incluir em `/balances/*`.
3. **BE-13 (resíduo) — `birthDate`.** Ainda declarado como `type: object`; declarar `type: string, format: date`.

## Delivery Cliente — gaps levantados na auditoria (BE-D1…BE-D4)

| # | Gap | Status |
|---|---|---|
| BE-D1 | `ResponseRestaurantDto` sem `avaliação`, `tempo de entrega`, `logo`, `taxa fixa` (a UI mostra) | ⚠️ decisão: incluir no back **ou** remover da UI |
| BE-D2 | `POST /food-orders` não recebe endereço de entrega | ⚠️ confirmar uso do endereço do perfil / múltiplos endereços |
| BE-D3 | `paymentMethod` só `CreditCard/Pix/BankSlip` (UI tem débito e dinheiro) | ⚠️ confirmar métodos válidos |
| BE-D4 | `deliveryFee` é enviado pelo **cliente** no pedido | ⚠️ ideal o back calcular/validar o frete |

> Detalhes e mapeamentos em `docs/inventario-delivery-cliente.md`.

## Delivery Fornecedor — gaps levantados na auditoria (BE-D5, BE-F1, BE-F2)

| # | Gap | Status |
|---|---|---|
| BE-D5 | `GET /restaurants/categories` retorna sem `iconUrl` (grid do cliente sem ícone) | ⚠️ incluir `iconUrl` ou Front usa fallback local por `slug` |
| BE-F1 | Sem `DELETE` de item/categoria/adicional de cardápio | ⚠️ expor DELETE **ou** confirmar soft-delete por `isActive` |
| BE-F2 | Payout do restaurante é agregado (sem recorte por período) | ⚠️ opcional: `?period=day\|week\|month` |

> Detalhes em `docs/inventario-delivery-fornecedor.md`.

## Dúvidas/ajustes — rodada de correções (BE-Q1…BE-Q3)

| # | Ponto | Status |
|---|---|---|
| BE-Q1 | **Confirmação de conta** (SMS/email) no web **não existe** — só `verify-code` (mobile) e `forgot/reset` (senha). O cadastro cria a conta direto (`status: Pending/Active`). | ❓ Confirmar: o web precisa de confirmação por email/SMS? Se sim, expor endpoint. Hoje o Front cadastra → Sucesso → Login. |
| BE-Q2 | **Telefone** passou a ser **obrigatório no Front** (cliente/fornecedor/etc.). No contrato, `phone` é opcional em `RegisterBaseDto`. | ❓ Confirmar se o back deve tornar `phone` obrigatório também (hoje valida formato quando enviado: "Informe um telefone válido no formato brasileiro."). |
| BE-Q3 | **Assinatura do fornecedor** (planos + `POST /subscriptions`) foi movida para **onboarding pós-login** (o login automático no cadastro era frágil). Relaciona-se ao **BE-15** (assinatura como pré-condição). | ❓ Confirmar o momento/obrigatoriedade da assinatura (bloqueia publicar antes de assinar?). |

## Observações

- **Autorização por perfil (BE-14)** aparece nas rotas novas (ex.: "Apenas clientes podem realizar pedidos",
  "Apenas o restaurante do pedido pode respondê-lo", "Apenas o entregador responsável..."). O Front deve
  respeitar isso com os guards por `profileType`.
- **Rastreamento em tempo real:** `/deliveries/{id}/location` é polling (PATCH lat/lng + `locationUpdatedAt`).
  Não há WebSocket declarado — o Front fará polling do `/deliveries/{id}` / `/food-orders/{id}` para o mapa.

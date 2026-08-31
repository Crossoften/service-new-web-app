# Referência de Contrato (Swagger) — durável

> Extraído do `openapi.json` real do back (`service-new-ws` @ `ajustes-gerais`) + swagger anterior.
> **Fonte da verdade.** Base local: `http://localhost:8000/v1` (homolog: `https://homolog.crosoften.com:8029/v1`).
> Paginação `take`+`skip` → `{ <chave>, currentPage, totalPages, totalRecords }`. Dinheiro: **response = string**, **create = number**.

## Auth v2 — Telefone como identidade

Telefone normalizado a **E.164** pelo back (envie no formato que quiser; recomendado E.164). Código = **6 dígitos**.

- `POST /v1/login` → **LoginUserDto** `{ email*, password* }`. O campo **`email` aceita e-mail OU telefone** (a API decide pelo `@`). → **ResponseLoginDto** `{ token, id, role?, profileType? (Client|Supplier|Delivery|Influencer), adminPermissions? }`. `401` = `"Acesso não autorizado."` (senha errada, inexistente **e conta `Pending`** — indistinguíveis).
- `POST /v1/no-auth/register/{client|supplier|delivery|influencer}` → **RegisterBaseDto** `{ name* (3–120), phone* (E.164), password* (8–32), confirmPassword*, acceptedTerms* (true), email? (OPCIONAL), birthDate? (YYYY-MM-DD), inviteCode?, referralCode?, socialMedias? }` → `201` **RegisterUserResponseDto** `{ message, user{ id, name, email(nullable), phone, role, profileType, status ("Pending") } }`. SMS automático; **`503`** se o SMS falhar (nada gravado → pode repetir); `409` genérico se telefone/e-mail já existem.
- `POST /v1/no-auth/verify-account` → **VerifyAccountDto** `{ identifier* (telefone), code* (6) }` → `200 {message}` · `404 "Usuário ou código inválido."` (sempre igual).
- `POST /v1/no-auth/resend-verification` → **ResendVerificationDto** `{ identifier* }` → `200` (mesmo sem envio; reenvio invalida o código anterior; expira em 4h).
- **Recuperação de senha:** `POST /v1/no-auth/forgot` **ForgotDto** `{ channel* ('sms'|'email'), identifier* }` → `200`; `POST /v1/no-auth/verify-code` **VerifyCodeDto** `{ identifier*, code* (6) }` (opcional); `POST /v1/no-auth/reset` **ResetPasswordDto** `{ identifier*, code* (6), password* (8–32), confirmPassword* }`.
- Verificação de **conta** (`verify-account`) e código de **recuperação** (`verify-code`) são fluxos **separados**.

## Delivery — Fase C

- `POST /v1/food-orders` → **CreateFoodOrderDto** `{ restaurantId*, paymentMethod*, notes?, items* }`. **`deliveryFee` removido** (servidor calcula por distância). `PaymentMethodEnum` = `CreditCard | DebitCard | Pix | BankSlip | Cash`. Coordenadas do endereço (lat/lng) ainda **sem campo no contrato** → **BE-Q7**.
- `PATCH /v1/food-orders/:id/confirm-payment` (sem corpo) — só `Cash`, pelo entregador designado ou dono do restaurante; idempotente; outros métodos → `400`. Cartão/Pix/Boleto ficam `paymentStatus: Pending`.
- `POST /v1/restaurants/:id/reviews` `{ rating* (1–5), comment? (≤2000) }` — só quem tem pedido entregue (`403`), 1 por cliente (`409`). Restaurante passa a trazer `ratingAverage?` (ausente se 0) + `ratingCount`.
- `DELETE /v1/restaurants/menu-items/:id` → `{ deleted: boolean }`: `true` = apagado; `false` = **desativado** (item já usado em pedidos). Mostrar a mensagem da API.
- Admin (portal, fora deste app): `admin-delivery-fees` (faixas `minKm`/`maxKm`/`type` Fixed|Percent/`value`).

## Serviços — Trabalhos (`/works`)

Fluxo pós-orçamento aprovado. `WorkStatusEnum` = `Pending | InProgress | Finished | Cancelled`. `WorkScopeEnum` = `Requested | Received`.

- `POST /works` **CreateWorkDto** `{ budgetId*, details?, serviceDate?, warrantyExpiresAt?, serviceValue?: number, totalValue?: number, providerFiles? }` (fornecedor, a partir do orçamento aprovado).
- `GET /works` (query: `scope, status, search, serviceId, take, skip`) → `{ works: ResponseWorkListItemDto[], … }`. **Fornecedor** usa `scope=Received`.
- `GET /works/my-requests` (mesma query) → mesma resposta. **Cliente** usa este.
- `GET /works/{id}` → **ResponseWorkDto**. `PATCH /works/{id}` · `DELETE /works/{id}`.
- `PATCH /works/{id}/start` (fornecedor inicia) · `PATCH /works/{id}/confirm-arrival` (cliente).
- `PATCH /works/{id}/finish` **FinishWorkDto** `{ completionDescription*, serviceDate?, serviceValue?: number, totalValue?: number, warrantyExpiresAt?, completionFiles? }`.
- `POST /works/{id}/pay` **PayWorkDto** `{ method* (CreditCard|Pix|BankSlip), holderName?, cardBrand?, cardNumber? }`.
- `POST /works/{id}/request-warranty` `{ description*, files? }` (cliente) · `PATCH /works/{id}/respond-warranty` `{ status* (Approved|Rejected), description? }` (fornecedor).
- `PATCH /works/{id}/request-extra` `{ description*, value*: number }` (fornecedor) · `PATCH /works/{id}/respond-extra` `{ status* (Approved|Rejected) }` (cliente).
- `PATCH /works/{id}/cancel` `{ cancelReason* }`.

**ResponseWorkDto** (principais): `{ id, status, details?, completionDescription?, cancelReason?, serviceDate?, startedAt?, arrivalConfirmedAt?, finishedAt?, cancelledAt?, warrantyExpiresAt?, warrantyRequestStatus? (Pending|Approved|Rejected), extraRequestValue?: string, extraRequestStatus? (Pending|Approved|Rejected), isUnderWarranty, chat?{id}, serviceValue?: string, totalValue?: string, budgetId, budget{id}, serviceId, service{id,name}, requesterId, requester{...}, providerId, provider{...}, files[], createdAt, updatedAt, payment?{id,method,status,cardLast4?} }`.

## Módulo 8 — Parceiro / Influencer

- `GET /referrals/me` → `{ referralCode?, referrals: MyReferralDto[], totalRecords }`; `GET /referrals/me/summary` → stats da Home.
- `GET /balances/overview` · `GET /balances/receipts` → `{ currentMonthBalance: string, recentReceipts: [...] }`.
- Dados bancários (**conta única**): `POST /bank-accounts` `{ bankName, accountType (Checking|Savings), agency, account, cpf }`; `GET/PATCH/DELETE /bank-accounts/me`.

## Módulo 9 — Marketplace / Compra-Venda

- `GET /products` (query `search,name,categoryId,userId,transactionType,isActive,take,skip`) → `{ products[], … }`; `GET /products/categories`; `GET /products/my-products`; `GET/POST/PATCH/DELETE /products[/{id}]`; `POST /products/{id}/reviews`.
- `POST /commercial-transactions` `{ referenceType:'Product', referenceId, requestedAmount: number, title?, description?, file* }`; `GET /commercial-transactions` (status/participantRole); `PATCH …/respond` `{ status (Accepted|Rejected), agreedAmount?: number }`; `POST …/pay`; `PATCH …/complete|cancel`.

## Verticais 10–13 (resumo)

- **Aluguel** (`/rentals`): `CreateRentalDto {productId, startDate, endDate, price, conditions?}`; status Requested|Accepted|Rejected|Active|Returned|Cancelled; ações respond/start/return/cancel.
- **Transporte** (`/transportations` + `/transport-requests`): status Requested|Quoted|Accepted|Rejected|InTransit|Delivered|Cancelled; ações quote/respond/start/deliver/cancel.
- **Hospedagem** (`/accommodations` + `/bookings`): status Requested|Confirmed|Rejected|CheckedIn|Completed|Cancelled; ações respond/check-in/complete/cancel.
- **Empregos** (`/jobs` + applications): type CLT|PJ|Freelance|Temporary; `POST /jobs/{id}/apply`; `GET /jobs/applications/me`; `PATCH /jobs/applications/{id}/respond`.

## Chat (transversal — negociações têm `chatRoomId`)

- `GET /chats/context/{contextType}/{referenceId}` (contextType ∈ Budget|Work|CommercialTransaction|Rental|TransportRequest|Booking|FoodOrder|Job); `GET /chats/{id}`; `GET/POST /chats/{id}/messages`; `PATCH /chats/{id}/read`.
- ⚠️ **Sem endpoint de inbox** (BE-Q5).

## Notas de contrato relevantes

- `PaymentMethodEnum` = 5 valores (delivery); `PayWorkDto`/negociações aceitam `CreditCard|Pix|BankSlip`.
- Endereço do cliente **sem lat/lng** no contrato (BE-Q7).
- Códigos `verify-account`/`verify-code` = 6 dígitos, 4h, reenvio invalida o anterior.

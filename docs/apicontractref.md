# Referência de Contrato (Swagger) — módulos restantes

> Extraído do `swagger.json` completo fornecido pelo cliente em **2026-08-03**. Fonte da verdade.
> Base: `https://homolog.crosoften.com:8029/v1`. Paginação: `take`+`skip` (1-based) → resposta
> `{ <chave>, currentPage, totalPages, totalRecords }`. Dinheiro em **response = string**, em **create = number**.

## Módulo 8 — Parceiro / Influencer

### Indicações (`Indicações`)
- `GET /referrals/me` → **ResponseMyReferralsDto**: `{ referralCode?, referrals: MyReferralDto[], totalRecords }`
  - **MyReferralDto**: `{ id, status: string ("Convertido" | "Aguardando Pagamento"), commissionAmount?: number, paidAt?: string, createdAt, referredUser }`
  - **ReferredUserDto**: `{ id, name, email, phone?, profileType (Client|Supplier|Delivery|Influencer), status (Active|Pending|Inactive), registeredAt }`
- `GET /referrals/me/summary` → **ResponseMyReferralsSummaryDto**: `{ referralCode?, totalReferrals, totalPaying, accumulatedCommission, rankingPosition, commissionRate?, effectiveCommissionRate }`
  - Mapeia direto os stats da Home: downloads=`totalReferrals`, pagantes=`totalPaying`, comissão=`accumulatedCommission`, ranking=`rankingPosition`.

### Saldo (`Saldo`)
- `GET /balances/overview` → `{ currentMonthBalance: string, recentBudgets: [...] }` (orientado a fornecedor/serviços)
- `GET /balances/receipts` → **ResponseBalanceReceiptsDto**: `{ currentMonthBalance: string, recentReceipts: ResponseBalanceReceiptItemDto[] }`
  - **ResponseBalanceReceiptItemDto**: `{ id, amount: string, description?, method? (CreditCard|Pix|BankSlip), availableAt?, createdAt, payer{id,name,fileUrl?}, service?{id,name} }`

### Dados Bancários (`Dados Bancários`) — **conta única por usuário**
- `POST /bank-accounts` → **CreateBankAccountDto**: `{ bankName, accountType (Checking|Savings), agency, account, cpf }` → CreateBankAccountResponseDto `{ message, bankAccount }`
- `GET /bank-accounts/me` → **ResponseBankAccountDto** (objeto único): `{ id, bankName, accountType, agency, account, cpf, userId, createdAt, updatedAt }`
- `PATCH /bank-accounts/me` → UpdateBankAccountDto (mesmos campos, opcionais)
- `DELETE /bank-accounts/me` → `{ message }`

> ⚠️ A UI de saldo/novo-banco assume **lista** de bancos; o back tem **1 conta por usuário**. Ajustar UI p/ conta única.

## Módulo 9 — Marketplace / Compra-Venda

### Produtos (`Produtos`)
- `GET /products` (query: `search,name,categoryId,userId,transactionType,isActive,take,skip`) → **ResponseFindAllProductDto**: `{ products: ResponseProductListItemDto[], currentPage, totalPages, totalRecords }`
  - **ResponseProductListItemDto**: `{ id, name, transactionType (Rent|Sale|RentAndSale), model?, year?, price: string, description?, imageUrl?, isActive, category{id,name,slug,iconUrl?}, user{id,name,phone?}, positiveReviews, negativeReviews }`
- `GET /products/categories` → **ResponseProductCategoryDto[]**: `{ id, name, slug, iconUrl?, iconKey?, isActive, sortOrder, createdAt, updatedAt }`
- `GET /products/my-products` (mesma query) → ResponseFindAllProductDto
- `GET /products/{id}` → **ResponseProductDto**: list item + `{ category(completa), user{id,name,email,phone?}, imageKey? }`
- `POST /products` → **CreateProductDto**: `{ categoryId, transactionType, name, model?, year?, price: number, description?, imageUrl?, imageKey?, isActive? }` → `{ message, product }`
- `PATCH /products/{id}` → UpdateProductDto (mesmos campos, opcionais)
- `DELETE /products/{id}` → `{ message }`
- `POST /products/{id}/reviews` → `{ type (Positive|Negative), comment? }`

### Negociações (`Negociações`)
- `POST /commercial-transactions` → **CreateCommercialTransactionDto**: `{ referenceType: "Product", referenceId, requestedAmount: number, title?, description?, fileName?, fileUrl?, fileKey? }` → `{ message, transaction }`
- `GET /commercial-transactions` (query: `status (Requested|Accepted|Rejected|Cancelled|Paid|Completed), participantRole (Buyer|Seller|All), search, take, skip`) → **ResponseFindAllCommercialTransactionDto**: `{ transactions: ResponseCommercialTransactionDto[], currentPage, totalPages, totalRecords }`
- `GET /commercial-transactions/{id}` → **ResponseCommercialTransactionDto**: `{ id, referenceType, referenceId, status, title?, description?, requestedAmount: string, agreedAmount?: string, chatRoomId, buyer{id,name,fileUrl?}, seller{...}, product{id,name,model?,price,imageUrl?}, payment?, acceptedAt?…, createdAt, updatedAt }`
- `PATCH /commercial-transactions/{id}/respond` → `{ status (Accepted|Rejected), agreedAmount?: number, message? }` (vendedor)
- `POST /commercial-transactions/{id}/pay` → `{ method (CreditCard|Pix|BankSlip), holderName?, cardBrand?, cardNumber? }`
- `PATCH /commercial-transactions/{id}/complete` · `PATCH /commercial-transactions/{id}/cancel`

## Verticais 10–13 (resumo — para quando chegarmos)

- **Aluguel** (`/rentals`): `POST` CreateRentalDto `{ productId, startDate, endDate, price, conditions? }`; `GET` (status: Requested|Accepted|Rejected|Active|Returned|Cancelled; participantRole Requester|Provider|All); `{id}` respond/start/return/cancel. Produtos com `transactionType` Rent/RentAndSale.
- **Transporte** (`/transportations` catálogo + `/transport-requests` pedido): request status Requested|Quoted|Accepted|Rejected|InTransit|Delivered|Cancelled; ações quote/respond/start/deliver/cancel.
- **Hospedagem** (`/accommodations` + `/bookings`): booking status Requested|Confirmed|Rejected|CheckedIn|Completed|Cancelled; ações respond/check-in/complete/cancel. Categorias `GET /accommodations/categories`.
- **Empregos** (`/jobs` + applications): job type CLT|PJ|Freelance|Temporary; `POST /jobs/{id}/apply`; applications status Applied|Accepted|Rejected; `GET /jobs/applications/me`, `PATCH /jobs/applications/{id}/respond`.

## Chat (transversal — todas as negociações têm `chatRoomId`)
- `GET /chats/context/{contextType}/{referenceId}` abre/recupera chat. `contextType` ∈ Budget|Work|CommercialTransaction|Rental|TransportRequest|Booking|FoodOrder|Job.
- `GET /chats/{id}`, `GET /chats/{id}/messages` (paginado), `POST /chats/{id}/messages` `{ message, fileName?, fileUrl?, fileKey? }`, `PATCH /chats/{id}/read`.

## Notas de contrato relevantes
- `verify-code` **maxLength 4** e o summary diz "somente para mobile, web não precisa consumir" (contradiz uso web — ver BE-Q1).
- `RegisterBaseDto.birthDate` ainda é `type: object` (BE-13 resíduo).
- Categorias por contexto no portal: `/admin-categories/{context}` (services). Categorias públicas por vertical: `/{vertical}/categories`.

/**
 * Enums compartilhados, espelhando os schemas do Swagger (fonte da verdade).
 * Mantidos como union types de string para aderência ao estilo do projeto.
 */

// ── Usuário ──────────────────────────────────────────────────────────────────
export type UserProfileType = 'Client' | 'Supplier' | 'Delivery' | 'Influencer';
export type UserRole = 'Master' | 'Admin' | 'User';
export type UserStatus = 'Active' | 'Pending' | 'Inactive';
export type BillingType = 'None' | 'Subscription' | 'Commission';
export type SocialNetwork = 'Instagram' | 'TikTok' | 'YouTube' | 'Facebook' | 'X' | 'Other';

// ── Serviços ─────────────────────────────────────────────────────────────────
export type ServiceType = 'Online' | 'Presential' | 'Home';

// ── Orçamentos (Budgets) ─────────────────────────────────────────────────────
/**
 * `BudgetStatusEnum` do contrato. `Accepted` e `Rejected` (§8.8) são **terminais**.
 * ⚠️ `Cancelled` (desistência do pedido) ≠ `Rejected` (cliente recusou o preço).
 */
export type BudgetStatus =
  | 'Pending'
  | 'Responded'
  | 'WaitingInformation'
  | 'Accepted'
  | 'Rejected'
  | 'Cancelled';
export type BudgetScope = 'Requested' | 'Received';
export type BudgetTimeUnit = 'Hour' | 'Day' | 'Week' | 'Month';
export type BudgetFileType = 'Request' | 'InformationRequest';

// ── Trabalhos (Works) ────────────────────────────────────────────────────────
export type WorkStatus = 'Pending' | 'InProgress' | 'Finished' | 'Cancelled';
export type WorkScope = 'Requested' | 'Received';
export type WorkFileType = 'Requester' | 'Provider' | 'Completion' | 'WarrantyRequest';

// ── Fluxos comuns de acréscimo/garantia ──────────────────────────────────────
export type ExtraRequestStatus = 'Pending' | 'Approved' | 'Rejected';
export type WarrantyRequestStatus = 'Pending' | 'Approved' | 'Rejected';

// ── Avaliações ───────────────────────────────────────────────────────────────
export type ReviewType = 'Positive' | 'Negative';

// ── Pagamentos ───────────────────────────────────────────────────────────────
/** `PaymentMethodEnum` do contrato (delivery Fase C incluiu DebitCard e Cash). */
export type PaymentMethod = 'CreditCard' | 'DebitCard' | 'Pix' | 'BankSlip' | 'Cash';
/**
 * `PaymentStatusEnum` do contrato. `Refunded` (§8.7) = **entrou e voltou**
 * (estorno/contestação) — diferente de `Cancelled` (nunca entrou: Pix vencido,
 * cartão recusado). No estornado há dinheiro que já foi creditado.
 */
export type PaymentStatus = 'Pending' | 'Paid' | 'Cancelled' | 'Refunded';

// ── Produtos / Negociações ───────────────────────────────────────────────────
export type ProductTransactionType = 'Rent' | 'Sale' | 'RentAndSale';
export type CommercialTransactionStatus =
  | 'Requested'
  | 'Accepted'
  | 'Rejected'
  | 'Cancelled'
  | 'Paid'
  | 'Completed';

// ── Assinaturas / Planos ─────────────────────────────────────────────────────
export type SubscriptionStatus = 'Active' | 'Cancelled' | 'Expired';
export type PlanInterval = 'Month' | 'Year';

// ── Dados bancários ──────────────────────────────────────────────────────────
export type BankAccountType = 'Checking' | 'Savings';
/** Tipo de chave Pix (§8.5). `pixKeyType` e `pixKey` andam sempre juntos. */
export type PixKeyType = 'Cpf' | 'Cnpj' | 'Email' | 'Phone' | 'Random';

// ── Chat ─────────────────────────────────────────────────────────────────────
export type ChatContextType = 'Budget' | 'Work' | 'CommercialTransaction';

// ── Textos institucionais ────────────────────────────────────────────────────
export type InstitutionalTextType = 'About' | 'Policies' | 'Terms' | 'Tips' | 'Cookies';

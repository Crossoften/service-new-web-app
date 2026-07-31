/**
 * Enums compartilhados, espelhando os schemas do Swagger (fonte da verdade).
 * Mantidos como union types de string para aderência ao estilo do projeto.
 */

// ── Usuário ──────────────────────────────────────────────────────────────────
export type UserProfileType = 'Client' | 'Supplier' | 'Partner' | 'Delivery' | 'Influencer';
export type UserRole = 'Master' | 'Admin' | 'User';
export type UserStatus = 'Active' | 'Pending' | 'Inactive';
export type BillingType = 'None' | 'Subscription' | 'Commission';
export type SocialNetwork = 'Instagram' | 'TikTok' | 'YouTube' | 'Facebook' | 'X' | 'Other';

// ── Serviços ─────────────────────────────────────────────────────────────────
export type ServiceType = 'Online' | 'Presential' | 'Home';

// ── Orçamentos (Budgets) ─────────────────────────────────────────────────────
export type BudgetStatus = 'Pending' | 'Responded' | 'WaitingInformation' | 'Cancelled';
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
export type PaymentMethod = 'CreditCard' | 'Pix' | 'BankSlip';
export type PaymentStatus = 'Pending' | 'Paid' | 'Cancelled';

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

// ── Chat ─────────────────────────────────────────────────────────────────────
export type ChatContextType = 'Budget' | 'Work' | 'CommercialTransaction';

// ── Textos institucionais ────────────────────────────────────────────────────
export type InstitutionalTextType = 'About' | 'Policies' | 'Terms' | 'Tips' | 'Cookies';

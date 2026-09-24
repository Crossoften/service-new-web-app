/**
 * Contadores de garantia (ResponseWarrantyStatsDto — BE-W7).
 *
 * Chega em dois lugares:
 *  - `GET /v1/profile/me → warranties` (o fornecedor vê o próprio);
 *  - `GET /v1/services/:id → providerWarranties` (o cliente vê no detalhe do prestador).
 *
 * O número de destaque é `warrantiesCompleted / warrantiesTotal` — "atendidas"
 * (reparo concluído), não acionamento aprovado (decisão Q-H).
 */
export interface ResponseWarrantyStatsDto {
  warrantiesTotal: number;
  warrantiesApproved: number;
  warrantiesRejected: number;
  warrantiesPending: number;
  warrantiesCompleted: number;
  warrantiesInProgress: number;
}

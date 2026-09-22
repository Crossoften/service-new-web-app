/**
 * Ganhos do entregador — `GET /v1/deliveries/me/earnings` (§8.5).
 *
 * Cada recorte é `{ amount, deliveries }`. `available`/`paid` são novos:
 * `available` = já ganho e ainda não repassado (o que a plataforma deve);
 * `paid` = já repassado. `available + paid = total`.
 *
 * ⚠️ Pedido em dinheiro NÃO gera repasse (o entregador recebe em mãos): esses
 * valores não entram em `available` nem em `total`.
 */
export interface EarningsBucketDto {
  amount: string;
  deliveries: number;
}

export interface ResponseCourierEarningsDto {
  day: EarningsBucketDto;
  week: EarningsBucketDto;
  month: EarningsBucketDto;
  total: EarningsBucketDto;
  /** Já ganho e ainda não repassado — o número em destaque. */
  available: EarningsBucketDto;
  /** Já repassado, fora da plataforma. */
  paid: EarningsBucketDto;
}

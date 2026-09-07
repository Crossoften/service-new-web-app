/** Utilitários de moeda BRL para inputs mascarados. */

/** Mantém só os dígitos de uma string. */
export function onlyDigits(v: string): string {
  return (v ?? '').replace(/\D/g, '');
}

/** `toLocaleString` insere espaço não separável (NBSP/narrow) — normaliza para espaço comum. */
function normalizarEspacos(v: string): string {
  return v.replace(/[\u00a0\u202f]/g, ' ');
}

/**
 * Formata uma entrada de dígitos (tratados como centavos) em moeda BRL.
 * Ex.: `"1250"` → `"R$ 12,50"`. Vazio → `""`.
 */
export function maskBRL(raw: string): string {
  const digits = onlyDigits(raw);
  if (!digits) return '';
  return formatBRL(Number(digits) / 100);
}

/** Formata um número (em reais) como moeda BRL. Ex.: `12.5` → `"R$ 12,50"`. */
export function formatBRL(valor: number): string {
  return normalizarEspacos(
    (Number.isFinite(valor) ? valor : 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }),
  );
}

/**
 * Converte o texto mascarado de volta em número (reais).
 * Ex.: `"R$ 12,50"` → `12.5`. Sem dígitos → `0`.
 */
export function parseBRL(masked: string): number {
  const digits = onlyDigits(masked);
  return digits ? Number(digits) / 100 : 0;
}

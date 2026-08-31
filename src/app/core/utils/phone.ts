/**
 * Utilitário único de telefone (base da Fase AJ — seção 3 das orientações do back).
 *
 * Regra que atravessa cadastro, login, recuperação e verificação: **uma só função**
 * converte o que o usuário digita para **E.164** antes de enviar, e uma só formata
 * para exibição. Guardar o telefone em duas formas (uma p/ exibir, outra p/ enviar)
 * sem passar por aqui foi o que quebrava a recuperação de senha.
 *
 * O back-end aceita qualquer formato e renormaliza; ainda assim enviamos **E.164**,
 * o formato que não depende de interpretação.
 */

/** Mantém apenas os dígitos de uma string. */
export function onlyDigits(value: string | null | undefined): string {
  return (value ?? '').replace(/\D/g, '');
}

/**
 * Extrai a parte **nacional** (DDD + número, 10 ou 11 dígitos) de uma entrada que
 * pode ou não trazer o DDI 55. Não valida — apenas descarta o DDI quando presente.
 */
export function nationalDigits(value: string | null | undefined): string {
  const d = onlyDigits(value);
  if ((d.length === 12 || d.length === 13) && d.startsWith('55')) {
    return d.slice(2);
  }
  return d;
}

/**
 * Converte um telefone brasileiro para **E.164** (`+55DDDNNNNNNNN`).
 * Retorna `''` quando não há dígitos. Assume DDI 55 (Brasil) quando ausente.
 *
 * Aceita todos estes e devolve o mesmo E.164:
 *   `(34) 99870-1109` · `34998701109` · `+5534998701109` · `+55 34 99870-1109`
 */
export function phoneToE164(value: string | null | undefined): string {
  const d = onlyDigits(value);
  if (!d) return '';
  // Já em formato de país (55 + 10/11 nacionais).
  if (d.startsWith('55') && (d.length === 12 || d.length === 13)) {
    return `+${d}`;
  }
  // Nacional puro (DDD + número).
  if (d.length === 10 || d.length === 11) {
    return `+55${d}`;
  }
  // Fallbacks conservadores: preserva DDI se veio, senão prefixa 55.
  return d.startsWith('55') ? `+${d}` : `+55${d}`;
}

/**
 * Máscara brasileira progressiva para input/exibição, operando sobre a parte
 * nacional: `(34) 99870-1109` (celular, 11) ou `(34) 3200-1109` (fixo, 10).
 * Formata parcialmente enquanto o usuário digita.
 */
export function maskBRPhone(value: string | null | undefined): string {
  const d = nationalDigits(value).slice(0, 11);
  if (!d) return '';
  const ddd = d.slice(0, 2);
  const rest = d.slice(2);
  if (d.length <= 2) return `(${ddd}`;
  // Celular (11 díg.): 5 + 4. Fixo (≤10): 4 + 4.
  if (d.length <= 6) {
    return `(${ddd}) ${rest}`;
  }
  if (d.length <= 10) {
    return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  }
  return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
}

/** Formata um telefone (E.164 ou cru) para exibição; `''` se vazio. */
export function displayBRPhone(value: string | null | undefined): string {
  return maskBRPhone(value);
}

/** Telefone brasileiro válido = 10 (fixo) ou 11 (celular) dígitos nacionais. */
export function isValidBRPhone(value: string | null | undefined): boolean {
  const n = nationalDigits(value).length;
  return n === 10 || n === 11;
}

import { formatBRL, maskBRL, onlyDigits, parseBRL } from './currency';

/** Normaliza espaços não separáveis para comparação estável. */
const n = (s: string) => s.replace(/[\u00a0\u202f]/g, ' ');

describe('currency utils', () => {
  it('onlyDigits remove tudo que não é dígito', () => {
    expect(onlyDigits('R$ 1.234,56')).toBe('123456');
    expect(onlyDigits('')).toBe('');
  });

  it('maskBRL trata a entrada como centavos', () => {
    expect(n(maskBRL('1250'))).toBe('R$ 12,50');
    expect(n(maskBRL('5'))).toBe('R$ 0,05');
    expect(maskBRL('')).toBe('');
  });

  it('formatBRL formata número em reais', () => {
    expect(n(formatBRL(12.5))).toBe('R$ 12,50');
    expect(n(formatBRL(0))).toBe('R$ 0,00');
  });

  it('não deixa espaço não separável no resultado', () => {
    expect(/[\u00a0\u202f]/.test(maskBRL('1250'))).toBe(false);
  });

  it('parseBRL converte o texto mascarado em número', () => {
    expect(parseBRL('R$ 12,50')).toBe(12.5);
    expect(parseBRL('R$ 1.234,56')).toBe(1234.56);
    expect(parseBRL('')).toBe(0);
  });

  it('mask e parse são inversos', () => {
    expect(parseBRL(maskBRL('98765'))).toBe(987.65);
  });
});

import {
  onlyDigits,
  nationalDigits,
  phoneToE164,
  maskBRPhone,
  displayBRPhone,
  isValidBRPhone,
} from './phone';

describe('phone util', () => {
  describe('phoneToE164', () => {
    it('normaliza todos os formatos para o mesmo E.164', () => {
      const esperado = '+5534998701109';
      expect(phoneToE164('(34) 99870-1109')).toBe(esperado);
      expect(phoneToE164('34998701109')).toBe(esperado);
      expect(phoneToE164('+5534998701109')).toBe(esperado);
      expect(phoneToE164('+55 34 99870-1109')).toBe(esperado);
    });

    it('adiciona DDI 55 para número nacional (fixo, 10 díg.)', () => {
      expect(phoneToE164('(34) 3200-1109')).toBe('+553432001109');
    });

    it('retorna vazio quando não há dígitos', () => {
      expect(phoneToE164('')).toBe('');
      expect(phoneToE164(null)).toBe('');
      expect(phoneToE164(undefined)).toBe('');
    });
  });

  describe('nationalDigits', () => {
    it('descarta o DDI 55 quando presente', () => {
      expect(nationalDigits('+5534998701109')).toBe('34998701109');
      expect(nationalDigits('34998701109')).toBe('34998701109');
    });
  });

  describe('maskBRPhone', () => {
    it('formata celular (11) e fixo (10)', () => {
      expect(maskBRPhone('34998701109')).toBe('(34) 99870-1109');
      expect(maskBRPhone('3432001109')).toBe('(34) 3200-1109');
    });

    it('formata a partir de um E.164 (ignora o DDI)', () => {
      expect(maskBRPhone('+5534998701109')).toBe('(34) 99870-1109');
      expect(displayBRPhone('+5534998701109')).toBe('(34) 99870-1109');
    });

    it('formata parcialmente enquanto digita', () => {
      expect(maskBRPhone('34')).toBe('(34');
      expect(maskBRPhone('349')).toBe('(34) 9');
      expect(maskBRPhone('3499870')).toBe('(34) 9987-0');
    });

    it('vazio → string vazia', () => {
      expect(maskBRPhone('')).toBe('');
    });
  });

  describe('isValidBRPhone', () => {
    it('aceita 10 ou 11 dígitos nacionais', () => {
      expect(isValidBRPhone('34998701109')).toBe(true);
      expect(isValidBRPhone('3432001109')).toBe(true);
      expect(isValidBRPhone('+5534998701109')).toBe(true);
    });

    it('rejeita comprimentos inválidos', () => {
      expect(isValidBRPhone('998701109')).toBe(false);
      expect(isValidBRPhone('')).toBe(false);
      expect(isValidBRPhone('349')).toBe(false);
    });
  });

  describe('onlyDigits', () => {
    it('remove tudo que não é dígito', () => {
      expect(onlyDigits('(34) 99870-1109')).toBe('34998701109');
      expect(onlyDigits(null)).toBe('');
    });
  });
});

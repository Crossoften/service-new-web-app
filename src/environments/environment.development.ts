/**
 * Configuração de ambiente (desenvolvimento).
 * Substitui environment.ts em builds `development` via fileReplacements (angular.json).
 */
export const environment = {
  production: false,
  apiBaseUrl: 'https://homolog.crosoften.com:8029/v1',
  /**
   * Bypass TEMPORÁRIO da verificação de conta (verify-code) — ver BE-Q1.
   * Ativo em desenvolvimento enquanto o back-end não envia o email do código.
   */
  bypassVerifyCode: true,
};

/**
 * Configuração de ambiente (desenvolvimento).
 * Substitui environment.ts em builds `development` via fileReplacements (angular.json).
 */
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8000/v1',
  /**
   * Bypass TEMPORÁRIO da verificação de conta (verify-code) — ver BE-Q1.
   * Ativo em desenvolvimento enquanto o back-end não envia o email do código.
   * apiBaseUrl: http://localhost:3000/v1
   * apiBaseUrl: 'https://homolog.crosoften.com:8029/v1',
   */
  bypassVerifyCode: true,
  /** Chave do Google Maps JavaScript API (Fase 8.4). Vazia = mapa desabilitado. */
  googleMapsApiKey: '',
};

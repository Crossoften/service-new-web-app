/**
 * Configuração de ambiente (desenvolvimento).
 * Substitui environment.ts em builds `development` via fileReplacements (angular.json).
 */
export const environment = {
  production: false,
  // {BASE}/v1 (§0.1) — o `/v1` é obrigatório; só o host varia. Fluxo atual:
  // front e API rodam no mesmo Mac (teste via emulador no navegador) → localhost.
  // Alternativas: celular físico na mesma Wi-Fi → http://<IP-da-máquina>:8000/v1
  // (IP é DHCP, muda sozinho); homologação → https://homolog.crosoften.com:8029/v1
  apiBaseUrl: 'http://localhost:8000/v1',
  /**
   * Bypass TEMPORÁRIO da verificação de conta (verify-code) — ver BE-Q1.
   * Ativo em desenvolvimento enquanto o back-end não envia o email do código.
   */
  bypassVerifyCode: true,
  /** Chave do Google Maps JavaScript API (Fase 8.4). Vazia = mapa desabilitado. */
  googleMapsApiKey: 'AIzaSyAngtAtWYaK0dnC29uK9WfchOPj37Xtb4o',
};

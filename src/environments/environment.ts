/**
 * Configuração de ambiente (produção / padrão).
 *
 * O Swagger declara apenas o host de homologação:
 *   https://homolog.crosoften.com:8029  (prefixo /v1)
 * Ajuste `apiBaseUrl` quando o host de produção for disponibilizado.
 */
export const environment = {
  production: true,
  apiBaseUrl: 'http://localhost:8000/v1',
  /**
   * Bypass TEMPORÁRIO da verificação de conta (verify-code).
   * Enquanto o back-end não envia o email com o código, builds de
   * desenvolvimento podem pular a etapa. SEMPRE `false` em produção.
   */
  bypassVerifyCode: false,
  /**
   * Chave do Google Maps JavaScript API (Fase 8.4). Pública por natureza — proteja
   * por restrição de referrer HTTP + APIs no Google Cloud, não por segredo.
   * Vazia = mapa desabilitado (a UI mostra aviso e segue funcionando sem coordenadas).
   */
  googleMapsApiKey: '',
};

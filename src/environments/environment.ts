/**
 * Configuração de ambiente (produção / padrão). Builds de produção ativam o
 * service worker (PWA).
 *
 * `apiBaseUrl` = {BASE}/v1 (§0.1). O `/v1` é obrigatório nas 195 rotas; só o
 * host varia:
 *   - API na mesma máquina do navegador (fluxo atual): http://localhost:8000/v1
 *   - celular físico na mesma rede Wi-Fi: http://<IP-da-máquina>:8000/v1
 *     (IP é DHCP e muda sozinho — §0.1; só vale se a API escuta em 0.0.0.0)
 *   - homologação: https://homolog.crosoften.com:8029/v1 (produção → DevOps)
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
  googleMapsApiKey: 'AIzaSyAngtAtWYaK0dnC29uK9WfchOPj37Xtb4o',
};

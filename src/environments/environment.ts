/**
 * Configuração de ambiente (produção / padrão). Builds de produção ativam o
 * service worker (PWA) — é este o build usado para testar no celular.
 *
 * `apiBaseUrl` = {BASE}/v1 (§0.1). O `/v1` é obrigatório nas 195 rotas; o que
 * varia é o host:
 *   - celular na mesma rede Wi-Fi: http://<IP-da-máquina>:8000/v1
 *   - navegador da mesma máquina da API: http://localhost:8000/v1
 *   - homologação: https://homolog.crosoften.com:8029/v1 (produção → DevOps)
 *
 * ⚠️ O IP da rede é DHCP e muda sozinho (§0.1). Se o app parar com erro de
 * conexão (requisição pendurada, timeout ~75s), confira o IP antes de procurar
 * bug no código. A origem do front (`:4200`) precisa estar no CORS do back.
 */
export const environment = {
  production: true,
  apiBaseUrl: 'http://192.168.1.3:8000/v1',
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

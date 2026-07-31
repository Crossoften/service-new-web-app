/**
 * Configuração de ambiente (produção / padrão).
 *
 * O Swagger declara apenas o host de homologação:
 *   https://homolog.crosoften.com:8029  (prefixo /v1)
 * Ajuste `apiBaseUrl` quando o host de produção for disponibilizado.
 */
export const environment = {
  production: true,
  apiBaseUrl: 'https://homolog.crosoften.com:8029/v1',
};

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
  /**
   * Bypass TEMPORÁRIO da verificação de conta (verify-code).
   * Enquanto o back-end não envia o email com o código, builds de
   * desenvolvimento podem pular a etapa. SEMPRE `false` em produção.
   */
  bypassVerifyCode: false,
};

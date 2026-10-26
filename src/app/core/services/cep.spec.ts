import { TestBed } from '@angular/core/testing';
import { CepService } from './cep';

describe('CepService', () => {
  let service: CepService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CepService);
  });

  afterEach(() => vi.restoreAllMocks());

  function mockFetch(body: unknown, ok = true) {
    return vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok,
      json: async () => body,
    } as Response);
  }

  it('mapeia o retorno do ViaCEP para o endereço (só dígitos na URL)', async () => {
    const f = mockFetch({
      logradouro: 'Praça da Sé',
      bairro: 'Sé',
      localidade: 'São Paulo',
      uf: 'SP',
    });

    const end = await service.buscar('01001-000');

    expect(f).toHaveBeenCalledWith('https://viacep.com.br/ws/01001000/json/');
    expect(end).toEqual({ street: 'Praça da Sé', neighborhood: 'Sé', city: 'São Paulo', state: 'SP' });
  });

  it('CEP incompleto não chama a API e retorna null', async () => {
    const f = mockFetch({});
    expect(await service.buscar('123')).toBeNull();
    expect(f).not.toHaveBeenCalled();
  });

  it('CEP inexistente ({ erro: true }) retorna null', async () => {
    mockFetch({ erro: true });
    expect(await service.buscar('00000-000')).toBeNull();
  });

  it('resposta não-ok lança para a tela tratar', async () => {
    mockFetch({}, false);
    await expect(service.buscar('01001000')).rejects.toThrow();
  });
});

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { profileGuard } from './core/guards/profile-guard';
import { guestGuard } from './core/guards/guest-guard';
import { SplashComponent } from './features/private/splash/splash';
import { HomeComponent } from './features/private/home/home';
import { CategoriaDeliveryComponent } from './features/private/categoria-delivery/categoria-delivery';
import { CategoriaServicosComponent } from './features/private/categoria-servicos/categoria-servicos';
import { CategoriaCompraVenderComponent } from './features/private/categoria-compra-vender/categoria-compra-vender';
import { CategoriaAluguelComponent } from './features/private/categoria-aluguel/categoria-aluguel';
import { CategoriaTransporteComponent } from './features/private/categoria-transporte/categoria-transporte';
import { CategoriaEmpregosComponent } from './features/private/categoria-empregos/categoria-empregos';
import { ListagemGenericaComponent } from './features/private/listagem-generica/listagem-generica';
import { LoginComponent } from './features/auth/login/login';
import { SelecionarPerfilComponent } from './features/auth/selecionar-perfil/selecionar-perfil';
import { CadastroComponent } from './features/auth/cadastro/cadastro';
import { CadastroSucessoComponent } from './features/auth/cadastro-sucesso/cadastro-sucesso';
import { PerfilComponent } from './features/private/perfil/perfil';
import { EsqueciSenhaComponent } from './features/auth/esqueci-senha/esqueci-senha';
import { RedefinirSenhaComponent } from './features/auth/redefinir-senha/redefinir-senha';
import { ListagemDeliveryComponent } from './features/private/delivery/listagem-delivery/listagem-delivery';
import { RestauranteComponent } from './features/private/delivery/restaurante/restaurante';
import { CardapioItemComponent } from './features/private/delivery/cardapio-item/cardapio-item';
import { SacolaComponent } from './features/private/delivery/sacola/sacola';
import { EnderecoEntregaComponent } from './features/private/delivery/endereco-entrega/endereco-entrega';
import { RevisaoPedidoComponent } from './features/private/delivery/revisao-pedido/revisao-pedido';
import { StatusPedidoComponent } from './features/private/delivery/status-pedido/status-pedido';
import { PedidosDeliveryComponent } from './features/private/delivery/pedidos-delivery/pedidos-delivery';
import { ListagemServicosComponent } from './features/private/servicos/listagem-servicos/listagem-servicos';
import { RequisitosServicoComponent } from './features/private/servicos/requisitos-servico/requisitos-servico';
import { DetalhesPrestadorComponent } from './features/private/servicos/detalhes-prestador/detalhes-prestador';
import { OrcamentosComponent } from './features/private/servicos/orcamentos/orcamentos';
import { AprovarOrcamentoComponent } from './features/private/servicos/aprovar-orcamento/aprovar-orcamento';
import { SolicitacoesComponent } from './features/private/servicos/solicitacoes/solicitacoes';
import { ChatPrestadorComponent } from './features/private/servicos/chat-prestador/chat-prestador';
import { DetalhesSolicitacaoComponent } from './features/private/servicos/detalhes-solicitacao/detalhes-solicitacao';
import { PagamentoServicoComponent } from './features/private/servicos/pagamento-servico/pagamento-servico';
import { HomeParceiroComponent } from './features/parceiro/home-parceiro/home-parceiro';
import { MeuCodigoComponent } from './features/parceiro/meu-codigo/meu-codigo';
import { IndicacoesComponent } from './features/parceiro/indicacoes/indicacoes';
import { MaisParceiroComponent } from './features/parceiro/mais-parceiro/mais-parceiro';
import { SaldoComponent } from './features/parceiro/saldo/saldo';
import { NovoBancoComponent } from './features/parceiro/novo-banco/novo-banco';
import { HomeFornecedorComponent } from './features/fornecedor/home-fornecedor/home-fornecedor';
import { HubFornecedorComponent } from './features/fornecedor/hub-fornecedor/hub-fornecedor';
import { RestauranteFornecedorComponent } from './features/fornecedor/restaurante-fornecedor/restaurante-fornecedor';
import { AssinaturaFornecedorComponent } from './features/fornecedor/assinatura-fornecedor/assinatura-fornecedor';
import { GerenciarCardapioComponent } from './features/fornecedor/gerenciar-cardapio/gerenciar-cardapio';
import { AddCardapioComponent } from './features/fornecedor/add-cardapio/add-cardapio';
import { DetalhesPedidoFornecedorComponent } from './features/fornecedor/detalhes-pedido-fornecedor/detalhes-pedido-fornecedor';
import { ListagemServicosFornecedorComponent } from './features/fornecedor/servicos/listagem-servicos-fornecedor/listagem-servicos-fornecedor';
import { CriarServicoComponent } from './features/fornecedor/servicos/criar-servico/criar-servico';
import { OrcamentosFornecedorComponent } from './features/fornecedor/servicos/orcamentos-fornecedor/orcamentos-fornecedor';
import { FazerOrcamentoComponent } from './features/fornecedor/servicos/fazer-orcamento/fazer-orcamento';
import { TrabalhosFornecedorComponent } from './features/fornecedor/servicos/trabalhos-fornecedor/trabalhos-fornecedor';
import { DetalhesTrabalhoComponent } from './features/fornecedor/servicos/detalhes-trabalho/detalhes-trabalho';
import { HomeEntregadorComponent } from './features/entregador/home-entregador/home-entregador';
import { TrabalhosEntregadorComponent } from './features/entregador/trabalhos-entregador/trabalhos-entregador';
import { StatusEntregaComponent } from './features/entregador/status-entrega/status-entrega';
import { ListagemProdutosComponent } from './features/fornecedor/compra-venda/listagem-produtos/listagem-produtos';
import { CriarProdutoComponent } from './features/fornecedor/compra-venda/criar-produto/criar-produto';
import { DetalheVendaComponent } from './features/fornecedor/compra-venda/detalhe-venda/detalhe-venda';
import { ListagemHospedagemFornecedorComponent } from './features/fornecedor/hospedagem/listagem-hospedagem-fornecedor/listagem-hospedagem-fornecedor';
import { CriarHospedagemComponent } from './features/fornecedor/hospedagem/criar-hospedagem/criar-hospedagem';
import { ListagemTransporteFornecedorComponent } from './features/fornecedor/transporte/listagem-transporte-fornecedor/listagem-transporte-fornecedor';
import { CriarTransporteComponent } from './features/fornecedor/transporte/criar-transporte/criar-transporte';
import { ListagemAluguelFornecedorComponent } from './features/fornecedor/aluguel/listagem-aluguel-fornecedor/listagem-aluguel-fornecedor';
import { CriarAluguelFornecedorComponent } from './features/fornecedor/aluguel/criar-aluguel-fornecedor/criar-aluguel-fornecedor';
import { MercadoPagoFornecedorComponent } from './features/fornecedor/mercado-pago/mercado-pago-fornecedor/mercado-pago-fornecedor';
import { MercadoPagoCallbackComponent } from './features/fornecedor/mercado-pago/mercado-pago-callback/mercado-pago-callback';
import { NegociacoesComponent } from './features/marketplace/negociacoes/negociacoes';
import { NegociacaoDetalheComponent } from './features/marketplace/negociacao-detalhe/negociacao-detalhe';
import { ListagemAluguelComponent } from './features/aluguel/listagem-aluguel/listagem-aluguel';
import { DetalheAluguelComponent } from './features/aluguel/detalhe-aluguel/detalhe-aluguel';
import { MeusAlugueisComponent } from './features/aluguel/meus-alugueis/meus-alugueis';
import { AluguelDetalheComponent } from './features/aluguel/aluguel-detalhe/aluguel-detalhe';
import { ListagemTransporteComponent } from './features/transporte/listagem-transporte/listagem-transporte';
import { DetalheTransporteComponent } from './features/transporte/detalhe-transporte/detalhe-transporte';
import { MeusTransportesComponent } from './features/transporte/meus-transportes/meus-transportes';
import { TransportePedidoDetalheComponent } from './features/transporte/transporte-pedido-detalhe/transporte-pedido-detalhe';
import { CategoriaHospedagemComponent } from './features/hospedagem/categoria-hospedagem/categoria-hospedagem';
import { ListagemHospedagemComponent } from './features/hospedagem/listagem-hospedagem/listagem-hospedagem';
import { DetalheHospedagemComponent } from './features/hospedagem/detalhe-hospedagem/detalhe-hospedagem';
import { MinhasReservasComponent } from './features/hospedagem/minhas-reservas/minhas-reservas';
import { ReservaDetalheComponent } from './features/hospedagem/reserva-detalhe/reserva-detalhe';
import { ListagemEmpregosComponent } from './features/empregos/listagem-empregos/listagem-empregos';
import { DetalheVagaComponent } from './features/empregos/detalhe-vaga/detalhe-vaga';
import { MinhasCandidaturasComponent } from './features/empregos/minhas-candidaturas/minhas-candidaturas';
import { PublicarVagaComponent } from './features/empregos/publicar-vaga/publicar-vaga';
import { VagaCandidaturasComponent } from './features/empregos/vaga-candidaturas/vaga-candidaturas';
import { ChatComponent } from './features/chat/chat/chat';

export const routes: Routes = [
  // Públicas (sem sessão)
  { path: '', redirectTo: 'splash', pathMatch: 'full' },
  { path: 'splash', component: SplashComponent },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'selecionar-perfil', component: SelecionarPerfilComponent, canActivate: [guestGuard] },
  { path: 'esqueci-senha', component: EsqueciSenhaComponent, canActivate: [guestGuard] },
  { path: 'redefinir-senha', component: RedefinirSenhaComponent, canActivate: [guestGuard] },
  { path: 'cadastro/sucesso', component: CadastroSucessoComponent, canActivate: [guestGuard] },
  { path: 'cadastro/:perfil', component: CadastroComponent, canActivate: [guestGuard] },

  // Cliente / área geral (exige sessão)
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'perfil', component: PerfilComponent, canActivate: [authGuard] },

  // Delivery Cliente
  { path: 'delivery', component: CategoriaDeliveryComponent, canActivate: [authGuard] },
  { path: 'delivery/pedidos', component: PedidosDeliveryComponent, canActivate: [authGuard] },
  { path: 'delivery/listagem/:categoria', component: ListagemDeliveryComponent, canActivate: [authGuard] },
  { path: 'delivery/restaurante/:id', component: RestauranteComponent, canActivate: [authGuard] },
  { path: 'delivery/item/:id', component: CardapioItemComponent, canActivate: [authGuard] },
  { path: 'delivery/sacola', component: SacolaComponent, canActivate: [authGuard] },
  { path: 'delivery/endereco', component: EnderecoEntregaComponent, canActivate: [authGuard] },
  { path: 'delivery/revisao', component: RevisaoPedidoComponent, canActivate: [authGuard] },
  { path: 'delivery/status/:id', component: StatusPedidoComponent, canActivate: [authGuard] },

  // Serviços Cliente
  { path: 'servicos', component: CategoriaServicosComponent, canActivate: [authGuard] },
  { path: 'servicos/listagem/:categoria', component: ListagemServicosComponent, canActivate: [authGuard] },
  { path: 'servicos/requisitos', component: RequisitosServicoComponent, canActivate: [authGuard] },
  { path: 'servicos/prestador/:id', component: DetalhesPrestadorComponent, canActivate: [authGuard] },
  { path: 'servicos/orcamentos', component: OrcamentosComponent, canActivate: [authGuard] },
  { path: 'servicos/orcamento/:id', component: AprovarOrcamentoComponent, canActivate: [authGuard] },
  { path: 'servicos/solicitacoes', component: SolicitacoesComponent, canActivate: [authGuard] },
  { path: 'servicos/chat/:id', component: ChatPrestadorComponent, canActivate: [authGuard] },
  { path: 'servicos/solicitacao/:id', component: DetalhesSolicitacaoComponent, canActivate: [authGuard] },
  { path: 'servicos/pagamento/:id', component: PagamentoServicoComponent, canActivate: [authGuard] },

  // Parceiro (Influencer)
  { path: 'parceiro/home', component: HomeParceiroComponent, canActivate: [authGuard, profileGuard('Influencer')] },
  { path: 'parceiro/perfil', component: PerfilComponent, canActivate: [authGuard, profileGuard('Influencer')] },
  { path: 'parceiro/codigo', component: MeuCodigoComponent, canActivate: [authGuard, profileGuard('Influencer')] },
  { path: 'parceiro/indicacoes', component: IndicacoesComponent, canActivate: [authGuard, profileGuard('Influencer')] },
  { path: 'parceiro/mais', component: MaisParceiroComponent, canActivate: [authGuard, profileGuard('Influencer')] },
  { path: 'parceiro/saldo', component: SaldoComponent, canActivate: [authGuard, profileGuard('Influencer')] },
  { path: 'parceiro/banco/novo', component: NovoBancoComponent, canActivate: [authGuard, profileGuard('Influencer')] },

  // Fornecedor — Hub multi-vertical (landing do Supplier)
  { path: 'fornecedor', component: HubFornecedorComponent, canActivate: [authGuard, profileGuard('Supplier')] },

  // Fornecedor Delivery (Supplier)
  { path: 'fornecedor/home', component: HomeFornecedorComponent, canActivate: [authGuard, profileGuard('Supplier')] },
  { path: 'fornecedor/restaurante', component: RestauranteFornecedorComponent, canActivate: [authGuard, profileGuard('Supplier')] },
  { path: 'fornecedor/perfil', component: PerfilComponent, canActivate: [authGuard, profileGuard('Supplier')] },
  { path: 'fornecedor/assinatura', component: AssinaturaFornecedorComponent, canActivate: [authGuard, profileGuard('Supplier')] },
  { path: 'fornecedor/cardapio', component: GerenciarCardapioComponent, canActivate: [authGuard, profileGuard('Supplier')] },
  { path: 'fornecedor/cardapio/novo', component: AddCardapioComponent, canActivate: [authGuard, profileGuard('Supplier')] },
  { path: 'fornecedor/cardapio/editar/:id', component: AddCardapioComponent, canActivate: [authGuard, profileGuard('Supplier')] },
  { path: 'fornecedor/pedido/:id', component: DetalhesPedidoFornecedorComponent, canActivate: [authGuard, profileGuard('Supplier')] },

  // Fornecedor Serviços (Supplier)
  { path: 'fornecedor/servicos', component: ListagemServicosFornecedorComponent, canActivate: [authGuard, profileGuard('Supplier')] },
  { path: 'fornecedor/servicos/categoria', component: CategoriaServicosComponent, canActivate: [authGuard, profileGuard('Supplier')] },
  { path: 'fornecedor/servicos/criar', component: CriarServicoComponent, canActivate: [authGuard, profileGuard('Supplier')] },
  { path: 'fornecedor/servicos/orcamentos', component: OrcamentosFornecedorComponent, canActivate: [authGuard, profileGuard('Supplier')] },
  { path: 'fornecedor/servicos/orcamento/:id', component: FazerOrcamentoComponent, canActivate: [authGuard, profileGuard('Supplier')] },
  { path: 'fornecedor/servicos/trabalhos', component: TrabalhosFornecedorComponent, canActivate: [authGuard, profileGuard('Supplier')] },
  { path: 'fornecedor/servicos/trabalho/:id', component: DetalhesTrabalhoComponent, canActivate: [authGuard, profileGuard('Supplier')] },
  { path: 'fornecedor/servicos/perfil', component: PerfilComponent, canActivate: [authGuard, profileGuard('Supplier')] },

  // Fornecedor Hospedagem
  { path: 'fornecedor/hospedagem', component: ListagemHospedagemFornecedorComponent, canActivate: [authGuard, profileGuard('Supplier')] },
  { path: 'fornecedor/hospedagem/criar', component: CriarHospedagemComponent, canActivate: [authGuard, profileGuard('Supplier')] },

  // Fornecedor Transporte
  { path: 'fornecedor/transporte', component: ListagemTransporteFornecedorComponent, canActivate: [authGuard, profileGuard('Supplier')] },
  { path: 'fornecedor/transporte/criar', component: CriarTransporteComponent, canActivate: [authGuard, profileGuard('Supplier')] },

  // Fornecedor Aluguel (produtos com transactionType Rent / RentAndSale)
  { path: 'fornecedor/aluguel', component: ListagemAluguelFornecedorComponent, canActivate: [authGuard, profileGuard('Supplier')] },
  { path: 'fornecedor/aluguel/criar', component: CriarAluguelFornecedorComponent, canActivate: [authGuard, profileGuard('Supplier')] },

  // Fornecedor — conta de recebimento (Mercado Pago OAuth)
  { path: 'fornecedor/mercado-pago', component: MercadoPagoFornecedorComponent, canActivate: [authGuard, profileGuard('Supplier')] },
  { path: 'fornecedor/mercado-pago/callback', component: MercadoPagoCallbackComponent, canActivate: [authGuard, profileGuard('Supplier')] },

  // Fornecedor Compra e Venda
  //{ path: 'fornecedor/compra-venda/produtos', component: ListagemProdutosComponent },
  //{ path: 'fornecedor/compra-venda/categoria', component: CategoriaCompraVenderComponent },
  //{ path: 'fornecedor/compra-venda/produto/novo', component: CriarProdutoComponent },
  //{ path: 'fornecedor/compra-venda/produto/editar/:id', component: CriarProdutoComponent },
  //{ path: 'fornecedor/compra-venda/venda/:id', component: DetalheVendaComponent },

  // Entregador (Delivery)
  { path: 'entregador/home', component: HomeEntregadorComponent, canActivate: [authGuard, profileGuard('Delivery')] },
  { path: 'entregador/trabalhos', component: TrabalhosEntregadorComponent, canActivate: [authGuard, profileGuard('Delivery')] },
  { path: 'entregador/entrega/:id', component: StatusEntregaComponent, canActivate: [authGuard, profileGuard('Delivery')] },
  { path: 'entregador/perfil', component: PerfilComponent, canActivate: [authGuard, profileGuard('Delivery')] },

  // Outras categorias (exige sessão)
  { path: 'compra-vender', component: CategoriaCompraVenderComponent, canActivate: [authGuard] },
  { path: 'compra-vender/produtos', component: ListagemProdutosComponent, canActivate: [authGuard] },
  { path: 'compra-vender/meus-produtos', component: ListagemProdutosComponent, data: { mine: true }, canActivate: [authGuard] },
  { path: 'compra-vender/produto/novo', component: CriarProdutoComponent, canActivate: [authGuard] },
  { path: 'compra-vender/produto/editar/:id', component: CriarProdutoComponent, canActivate: [authGuard] },
  { path: 'compra-vender/negociacoes', component: NegociacoesComponent, canActivate: [authGuard] },
  { path: 'compra-vender/negociacao/:id', component: NegociacaoDetalheComponent, canActivate: [authGuard] },
  { path: 'compra-vender/produto/:id', component: DetalheVendaComponent, canActivate: [authGuard] },
  { path: 'aluguel', component: CategoriaAluguelComponent, canActivate: [authGuard] },
  { path: 'aluguel/produtos', component: ListagemAluguelComponent, canActivate: [authGuard] },
  { path: 'aluguel/meus', component: MeusAlugueisComponent, canActivate: [authGuard] },
  { path: 'aluguel/produto/:id', component: DetalheAluguelComponent, canActivate: [authGuard] },
  { path: 'aluguel/:id', component: AluguelDetalheComponent, canActivate: [authGuard] },
  { path: 'transporte', component: CategoriaTransporteComponent, canActivate: [authGuard] },
  { path: 'transporte/veiculos', component: ListagemTransporteComponent, canActivate: [authGuard] },
  { path: 'transporte/meus', component: MeusTransportesComponent, canActivate: [authGuard] },
  { path: 'transporte/veiculo/:id', component: DetalheTransporteComponent, canActivate: [authGuard] },
  { path: 'transporte/pedido/:id', component: TransportePedidoDetalheComponent, canActivate: [authGuard] },
  { path: 'hospedagem', component: CategoriaHospedagemComponent, canActivate: [authGuard] },
  { path: 'hospedagem/lista', component: ListagemHospedagemComponent, canActivate: [authGuard] },
  { path: 'hospedagem/reservas', component: MinhasReservasComponent, canActivate: [authGuard] },
  { path: 'hospedagem/acomodacao/:id', component: DetalheHospedagemComponent, canActivate: [authGuard] },
  { path: 'hospedagem/reserva/:id', component: ReservaDetalheComponent, canActivate: [authGuard] },
  { path: 'empregos', component: CategoriaEmpregosComponent, canActivate: [authGuard] },
  { path: 'empregos/vagas', component: ListagemEmpregosComponent, canActivate: [authGuard] },
  { path: 'empregos/candidaturas', component: MinhasCandidaturasComponent, canActivate: [authGuard] },
  { path: 'empregos/vaga/nova', component: PublicarVagaComponent, canActivate: [authGuard] },
  { path: 'empregos/vaga/:id/candidaturas', component: VagaCandidaturasComponent, canActivate: [authGuard] },
  { path: 'empregos/vaga/:id', component: DetalheVagaComponent, canActivate: [authGuard] },
  { path: 'chat/:id', component: ChatComponent, canActivate: [authGuard] },
  { path: 'listagem/:tipo', component: ListagemGenericaComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'splash' }
];

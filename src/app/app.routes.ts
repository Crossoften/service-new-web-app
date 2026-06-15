import { Routes } from '@angular/router';
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
import { ListagemDeliveryComponent } from './features/private/delivery/listagem-delivery/listagem-delivery';
import { RestauranteComponent } from './features/private/delivery/restaurante/restaurante';
import { CardapioItemComponent } from './features/private/delivery/cardapio-item/cardapio-item';
import { SacolaComponent } from './features/private/delivery/sacola/sacola';
import { EnderecoEntregaComponent } from './features/private/delivery/endereco-entrega/endereco-entrega';
import { RevisaoPedidoComponent } from './features/private/delivery/revisao-pedido/revisao-pedido';
import { StatusPedidoComponent } from './features/private/delivery/status-pedido/status-pedido';
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

export const routes: Routes = [
  { path: '', redirectTo: 'splash', pathMatch: 'full' },
  { path: 'splash', component: SplashComponent },
  { path: 'login', component: LoginComponent },
  { path: 'selecionar-perfil', component: SelecionarPerfilComponent },
  { path: 'cadastro/sucesso', component: CadastroSucessoComponent },
  { path: 'cadastro/:perfil', component: CadastroComponent },
  { path: 'home', component: HomeComponent },

  // Delivery
  { path: 'delivery', component: CategoriaDeliveryComponent },
  { path: 'delivery/listagem/:categoria', component: ListagemDeliveryComponent },
  { path: 'delivery/restaurante/:id', component: RestauranteComponent },
  { path: 'delivery/item/:id', component: CardapioItemComponent },
  { path: 'delivery/sacola', component: SacolaComponent },
  { path: 'delivery/endereco', component: EnderecoEntregaComponent },
  { path: 'delivery/revisao', component: RevisaoPedidoComponent },
  { path: 'delivery/status/:id', component: StatusPedidoComponent },

  // Serviços
  { path: 'servicos', component: CategoriaServicosComponent },
  { path: 'servicos/listagem/:categoria', component: ListagemServicosComponent },
  { path: 'servicos/requisitos', component: RequisitosServicoComponent },
  { path: 'servicos/prestador/:id', component: DetalhesPrestadorComponent },
  { path: 'servicos/orcamentos', component: OrcamentosComponent },
  { path: 'servicos/orcamento/:id', component: AprovarOrcamentoComponent },
  { path: 'servicos/solicitacoes', component: SolicitacoesComponent },
  { path: 'servicos/chat/:id', component: ChatPrestadorComponent },
  { path: 'servicos/solicitacao/:id', component: DetalhesSolicitacaoComponent },
  { path: 'servicos/pagamento/:id', component: PagamentoServicoComponent },

  // Parceiro
  { path: 'parceiro/home', component: HomeParceiroComponent },
  { path: 'parceiro/codigo', component: MeuCodigoComponent },
  { path: 'parceiro/indicacoes', component: IndicacoesComponent },
  { path: 'parceiro/mais', component: MaisParceiroComponent },
  { path: 'parceiro/saldo', component: SaldoComponent },
  { path: 'parceiro/banco/novo', component: NovoBancoComponent },

  // Outras categorias
  { path: 'compra-vender', component: CategoriaCompraVenderComponent },
  { path: 'aluguel', component: CategoriaAluguelComponent },
  { path: 'transporte', component: CategoriaTransporteComponent },
  { path: 'empregos', component: CategoriaEmpregosComponent },
  { path: 'listagem/:tipo', component: ListagemGenericaComponent },
  { path: '**', redirectTo: 'splash' }
];
# Blueprint de Perfis & Regras de Negócio — Service App

> **Fonte da verdade funcional** para a auditoria e a integração. Consolidado a partir da
> direção de negócio do cliente (reunião + decisões), do mapa de telas (`fluxoserviceapp.md`) e do Swagger.
> Este documento **guia** os ajustes de back-end (`backend-demandas.md`) e a adaptação do front.
>
> **Princípio central:** *o **perfil** define a experiência; a **vertical** é o escopo dentro do perfil.*
> O perfil é escolhido no cadastro e determina o app que o usuário vê. A vertical (delivery, serviços,
> hospedagem…) é uma escolha **dentro** da experiência do perfil, não um novo perfil.

---

## 1. Perfis (`profileType`)

| Perfil | Papel | Consome? | Oferta / catálogo? | Assinatura? | Saldo + Banco? | Indicação/comissão? |
|---|---|---|---|---|---|---|
| **Client** (Cliente) | Consumidor | ✅ **todas** as verticais | ❌ | ❌ (só paga transações) | ❌ (é pagador) | recebe `referralCode` |
| **Supplier** (Fornecedor) | Provedor | — | ✅ por vertical escolhida | ✅ **sim** (exceção: delivery híbrido) | ✅ recebe | — |
| **Delivery** (Entregador) | Executor de entrega | — | ❌ | ❌ | ✅ recebe por entrega | — |
| **Partner / Influencer** | Divulgador/afiliado | — | ❌ | ❌ | ✅ recebe comissão | ✅ **núcleo** do perfil |

> ✅ **Decisão D2:** o "Parceiro" do app é o perfil **`Influencer`** (indicação/comissão). O `Partner` da API
> deve ser depreciado/esclarecido (BE-11). Tratado aqui como **um** perfil de indicação = `Influencer`.

---

## 2. Regras de negócio transversais

| Regra | Client | Supplier | Delivery | Partner/Influencer |
|---|---|---|---|---|
| **Assinatura** (mensalidade para operar) | ❌ | ✅ obrigatória¹ | ❌ | ❌ |
| **Comissão da plataforma** | — | por categoria (`platformFeeRate`) | — | — |
| **Recebe pagamentos** (saldo + conta bancária) | ❌ | ✅ | ✅ (por entrega) | ✅ (por indicação) |
| **Efetua pagamentos** | ✅ | — | — | — |
| **Avalia** (review pós-transação) | ✅ | — | — | — |
| **Chat** | ✅ com o provedor | ✅ com o cliente | ✅ (entrega) | — |
| **Perfil + endereço** | ✅ | ✅ | ✅ | ✅ |

¹ **Exceção Delivery (restaurante):** modelo **híbrido** — o estabelecimento escolhe **Assinatura OU Comissão (%)**,
negociado individualmente (decisão da ata). Para as demais verticais do fornecedor, assinatura é a regra
(**confirmar** se vale para *todas* as verticais de provedor ou só "prestação de serviço" — ver §7).

---

## 3. CLIENTE — experiência (consumidor único, todas as verticais)

Um só app de consumo, com todas as verticais disponíveis. Não cadastra catálogo, não tem assinatura.

| Vertical | Jornada do cliente | Transação (camada 2) |
|---|---|---|
| Delivery | categorias/restaurantes → item → sacola → endereço → revisão → pagamento → status | **pedido de comida** |
| Serviços | categorias → serviços → requisitos → orçamentos → aprovar → solicitação → pagamento → chat | **budget → work** |
| Compra e Vender | categorias → produtos → detalhe → proposta/negociação → chat → pagamento | **commercial-transaction** |
| Aluguel | categorias → itens → detalhe → solicitar (período/condições) → status → chat | **aluguel (rental)** |
| Transporte | categorias → veículos → solicitar (origem/destino/carga) → orçamento → status → chat | **pedido de transporte** |
| Hospedagem | listagem → detalhe → período → revisão → pagamento → confirmação → status → chat | **reserva (booking)** |
| Empregos | categorias → vaga/profissional → candidatura/contratação → chat | **candidatura/proposta** |

Navegação: `Home | Solicitações | Orçamentos | Perfil | Mais`.

---

## 4. FORNECEDOR — experiência (seletor de vertical + sub-fluxo por vertical)

Ao logar como Supplier, o usuário vê a **experiência de provedor**. Ele **escolhe a vertical** e percorre o
cadastro/gestão daquela vertical. Cada vertical tem: **cadastro do ativo → gestão → recebimento de demanda**.

| Vertical (fornecedor) | Cadastro do ativo | Gestão | Recebe demanda | API hoje |
|---|---|---|---|---|
| **Serviços** | criar serviço (tipo, registro, valor, descrição) | ativos/inativos | orçamentos → responder → trabalhos (start/finish/garantia) | ✅ completo |
| **Compra e Venda** | criar produto (modelo, ano, valor) | ativos/inativos | negociações → responder → pagamento | ✅ completo |
| **Delivery** | cadastrar **restaurante + cardápio** (item, categoria, adicionais) | cardápio, status operacional | **pedidos** → status; faturamento | 🔴 **falta** (BE-01) |
| **Aluguel** | cadastrar item (valor/período, condições, disponibilidade) | ativos/inativos | solicitações → aceitar/recusar/negociar → chat | 🟠 **falta transação** (BE-04) |
| **Transporte** | cadastrar veículo (tipo, capacidade, valor/km) | ativos/inativos | solicitações → orçamento → chat | 🟠 **falta transação** (BE-05) |
| **Hospedagem** | cadastrar hospedagem (tipo, valor/noite, comodidades, fotos, regras) | **calendário de disponibilidade** | reservas → aceitar/recusar → chat | 🟠 **falta reserva** (BE-06) |
| **Empregos (empregador)** | cadastrar vaga (cargo, tipo, valor, requisitos) | ativas/inativas | candidatos → aceitar/recusar → chat | 🟠 **falta** (BE-07) |

Navegação por vertical (bottom-nav dedicado): ex. `Home | Cardápio | Pedidos | Perfil | Mais` (delivery);
`Home | Trabalhos | Orçamentos | Perfil | Mais` (serviços). *(O FE já possui múltiplos bottom-navs previstos.)*

---

## 5. ENTREGADOR — experiência

Recebe entregas, executa etapas, é remunerado por entrega. Sem catálogo, sem assinatura.

`Home (faturamento + status) → pedido pendente (aceitar/recusar) → status da entrega (4 etapas) → concluído`.
Cliente acompanha **trajetória no mapa**. → **falta domínio + rastreamento (BE-03)**.

---

## 6. PARCEIRO / INFLUENCER — experiência

Divulga → indica (compartilhamento nativo WhatsApp/Telegram) → acompanha indicados e comissão → recebe (saldo/banco).

`Home (link + stats: downloads/pagantes/comissão/ranking) → Meu Código → Indicações (Todas/Ativas/Inativas) → Saldo/Banco`.
→ **faltam rotas de indicação do próprio usuário (BE-10)** e **unificação Partner×Influencer (BE-11)**.

---

## 7. Matriz Perfil × Vertical × Status de back-end

| Vertical | Cliente (consumo) | Fornecedor (oferta) | Transação | Status API |
|---|---|---|---|---|
| Serviços | ✅ | ✅ | ✅ | **Pronto** |
| Compra/Vender | ✅ | ✅ | ✅ (`Product`) | **Pronto** |
| Aluguel | ✅ | ✅ | ❌ | Catálogo só (BE-04) |
| Transporte | ✅ | ✅ | ❌ | Catálogo só (BE-05) |
| Hospedagem | ✅ | ✅ | ❌ | Catálogo só (BE-06) |
| Delivery | ✅ | ✅ | ❌ | **Inexistente** (BE-01/02) |
| Empregos | ✅ | ✅ | ❌ | **Inexistente** (BE-07) |
| Entrega (courier) | acompanha | — | ❌ | **Inexistente** (BE-03) |

---

## 8. Ajustes de BACK-END derivados deste blueprint

Além dos BE-01…BE-13 já listados em `backend-demandas.md`, este modelo de perfis **adiciona/reforça**:

- **BE-14 — Autorização por `profileType` nos endpoints.** Hoje o contrato só exige `bearerAuth`; é preciso
  gatear: só `Supplier` cria serviço/produto/transporte/hospedagem/cardápio; só `Client` consome/paga; etc.
- **BE-15 — Assinatura como pré-condição de operação do fornecedor.** Definir se um `Supplier` sem assinatura
  ativa pode publicar/receber demanda. Regra de bloqueio + verificação em `subscriptions/current`.
- **BE-16 — Modelo de cobrança por vertical do fornecedor.** Confirmar se **todas** as verticais de provedor
  exigem assinatura ou só "prestação de serviço"; delivery é o híbrido (BE-02). Vincular `billingType` ao contexto.
- **BE-17 — Remuneração do Entregador e do Parceiro/Influencer.** Regras de repasse (saldo) para quem **recebe**
  sem vender catálogo (entregador por entrega; parceiro por indicação).

---

## 9. Ajustes de FRONT derivados deste blueprint

- **Guard por `profileType`** (`profile-guard.ts` já criado na Fase 0) aplicado às rotas por área.
- **Roteamento por perfil pós-login** usando o `profileType` do `ResponseLoginDto` (não mais o mapa mock).
- **Experiência de fornecedor com seletor de vertical** + bottom-nav por vertical (já há componentes base).
- **Ocultar/mostrar recursos por regra**: assinatura/saldo/banco só para perfis que recebem; avaliação só para cliente.
- **Cadastro por perfil** mapeando para as 5 rotas `register/*`.

---

## 10. Decisões fechadas ✅ (validadas pelo cliente)

| # | Decisão | **Resolução** |
|---|---|---|
| D1 | Uma conta pode ter múltiplos perfis ou 1 perfil por conta? | ✅ **1 perfil por conta** (a API retorna um `profileType`). Multi-perfil, se necessário no futuro, é demanda de backend. |
| D2 | "Parceiro" = `Partner` ou `Influencer`? | ✅ **Unificar em `Influencer`** (perfil de indicação/comissão). `Partner` a ser depreciado/esclarecido pela API. |
| D3 | Assinatura vale para todas as verticais de fornecedor ou só serviços? | ✅ **Todas as verticais** de fornecedor exigem assinatura; **delivery** com opção de **comissão** (híbrido). |
| D4 | Entregador remunerado por comissão/repasse por entrega? | ✅ **Sim** — repasse por entrega concluída, **sem assinatura**. |

> Decisões travadas em conjunto com o cliente. Servem de base para os ajustes de back-end (BE-11, BE-14…BE-17)
> e para a adaptação do front. Alterações aqui exigem nova validação.

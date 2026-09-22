# 🧭 Auditoria de UX — Módulo de Serviços (Cliente + Fornecedor)

> **Objetivo:** diagnosticar a usabilidade do fluxo de Serviços (cliente e fornecedor) e propor melhorias
> concretas, separando **o que é só front** do **que precisa de back-end** e do **que é decisão de produto**.
> **Base:** auditoria de código `service-app @ d18d4c2` (com GAR-1/GAR-2/MP-SVC-1 aplicados). Diagnóstico
> factual (arquivo:linha nas auditorias internas); aqui vai a síntese + proposta.
> **Escopo:** definição — não implementa nada. Cada item vira fatia depois da sua validação.

> ### ✅ Decisões travadas (cliente)
> - **UX-A:** lançar a **UI de anexos** já (a parte visual/estruturada agora; o upload real espera **BE-Q8**).
> - **UX-B:** **Atividade unificada.** Menu do cliente = **Início · Atividade · Mensagens · Perfil** (4 abas,
>   cross-vertical). A aba **Atividade** agrega os itens em andamento de **todas** as verticais (Serviços já sem o
>   jargão orçamento/trabalho). A **home mantém** o card "em andamento" (glanceável) — é os dois, não um ou outro.
>   **Mensagens depende de BE-Q5** (inbox `GET /chats`): enquanto não existir, lançar com **3 abas**
>   (Início · Atividade · Perfil) e adicionar Mensagens depois.
> - **UX-C:** **Painel único** como landing da área de Serviços do fornecedor (mostra orçamentos a responder +
>   trabalhos ativos, com contadores); o **catálogo** (cadastrar serviço) vira destino secundário.
> - **Q-UX1:** o chat do **orçamento continua a mesma conversa** após a aprovação (não recria) — orienta **BE-CHAT-1**.

---

## 0. Sumário — os problemas, por severidade

| # | Problema | Camada | Severidade |
|---|---|---|---|
| U1 | Botão **"+"** (anexos) no pedido de orçamento é **FAB sem rótulo e stub** — não anexa nada | Front (+ back BE-Q8) | 🔴 |
| U2 | **Bottom-nav do cliente** é hardcoded por tela; só "Home" navega; some nas telas de Serviços | Front | 🔴 |
| U3 | **Nem cliente nem fornecedor** veem "serviço/orçamento em andamento" na home (só delivery tem) | Front | 🔴 |
| U4 | **Chat não abre** onde deveria (botão morto no fornecedor; stub/mock no cliente) | Front (+ back p/ chat pré-aceite) | 🔴 |
| U5 | **Nav de Serviços do fornecedor confusa**: "Home"=catálogo, 3 abas irmãs sem elo, "Categorias"=voltar | Front | 🟠 |
| U6 | **"Fazer orçamento" sem feedback**: joga o fornecedor na aba errada; status do orçamento não aparece | Front | 🟠 |
| U7 | **Chat pré-aceite** (conversar antes de aprovar o orçamento) é **impossível** — Budget não tem chat | Back + Front | 🟠 |

---

## 1. Cliente

### U1 — Botão "+" no pedido de orçamento (anexos)
**Sua pergunta:** *"o botão + é para adicionar arquivos?"* → **Sim, a intenção é anexar arquivo, mas hoje não funciona.**
- Em `requisitos-servico`, o "+" é um **FAB flutuante sem rótulo**; `adicionarArquivo()` é **stub vazio** (não abre
  seletor de arquivo, não popula a lista, não envia nada). O `confirmar()` manda só `{ serviceId, description }`.
- O back **já aceita** anexos (`CreateBudgetDto.files`), mas o upload em si (`POST /upload/one-file`) está
  **quebrado no ambiente** por falta de credencial S3 — **BE-Q8**.

**Proposta (deixar claro para o cliente + funcional):**
- Trocar o FAB "+" anônimo por um **bloco rotulado**: título "Anexos (opcional)", texto de ajuda
  *"Envie fotos ou PDFs que ajudem o prestador a entender o serviço (ex.: foto do local, planta, medida)."*,
  e um botão explícito **"Adicionar arquivo"** (ícone clipe 📎, não "+").
- Mostrar os arquivos escolhidos como *chips* com nome + remover; aceitar png/jpg/pdf ≤ 8 MB (contrato do back).
- Enviar em `CreateBudgetDto.files` ao confirmar.
- **Dependência:** o upload real depende de **BE-Q8** (S3/credencial ou fallback de disco). Enquanto não resolver,
  o botão sobe o arquivo e falha no servidor. **Decisão UX-A:** lançar já a UI de anexos (mesmo que o upload
  falhe até BE-Q8) **ou** segurar a fatia até o back estar pronto? (recomendo segurar o upload, mas já melhorar o
  **rótulo/affordance** agora — a parte visual não depende do back).

### U2 — Bottom-nav do cliente sem função
**Constatação:** o menu inferior do cliente é **copiado à mão em cada tela**. O componente compartilhado
`shared/components/bottom-nav` é só um placeholder (`<p>bottom-nav works!</p>`) e **não é usado**. Resultado:
- Na **home**, os 5 itens são decorativos (nenhum clique).
- Em **solicitações/orçamentos**, só "Home" navega; "Solicitações", "Orçamentos", "Perfil", "Mais" não fazem nada.
- Nas telas de **categoria/listagem de serviços** o menu **some**.

**Proposta:** construir um **`BottomNavClienteComponent` compartilhado** (como já existe para fornecedor/entregador),
com 4–5 destinos reais e `routerLink` + estado ativo automático:
- **Início** → `/home` · **Solicitações** → `/servicos/solicitacoes` · **Orçamentos** → `/servicos/orcamentos`
  · **Perfil** → `/perfil` · **Mais** → um menu/hub de categorias.
- Usá-lo em todas as telas do cliente (inclusive categoria/listagem), removendo os navs hardcoded.
- **Decisão UX-B:** quais 5 itens fixos? (sugestão acima). "Mais" abre o quê — grid de categorias ou lista de opções?

### U3 — Home do cliente não mostra serviço em andamento
**Sua observação está certa** e vale para os dois lados. Hoje a home do cliente **tem** um card "pedido em andamento"
— **mas só para Delivery** (consome `getMeusPedidos()`). Nada de Serviços é surfaçado (nem solicitação em andamento,
nem "orçamento respondido, responda", nem acréscimo aguardando).

**Proposta (replicar o padrão do delivery para Serviços):** na home do cliente, adicionar card(s) de atividade:
- **"Solicitação em andamento"** → de `WorkService.minhasSolicitacoes()` filtrando `em_andamento`/`em_garantia` →
  leva a `detalhes-solicitacao`.
- **"Orçamento respondido — responda"** → de `BudgetService.meus({scope:'Requested'})` filtrando `Responded` →
  leva a `aprovar-orcamento`. (Também acréscimo/garantia com pendência.)
- Mesmo componente visual do card de delivery, para consistência. **Só front.**

### U4 (cliente) — Chat
Estado atual no cliente:
- **`detalhes-solicitacao`** → chat **REAL** (`/chat/:id` com `chatId` do Work) — **funciona** quando o Work tem chat.
- **`aprovar-orcamento`** → botão de chat é **stub vazio** (e o de notificações também).
- **`detalhes-prestador`** → abre o **chat MOCK** (`chat-prestador`, lorem ipsum, sem API).

**Proposta:** ver §3 (Chat) — unificar no chat real e remover o mock.

### Cadeia orçamento → cliente (funciona, mas escondida)
A cadeia **funciona** e está na API real: fornecedor responde (`Responded`) → cliente vê em `/servicos/orcamentos`
(aba "Respondidos") → abre `aprovar-orcamento` → **aprova** (`/approve`, gera o trabalho) ou **recusa** (`/reject`).
O problema **não é** "não chegou": é **descoberta** — o cliente só acha se navegar manualmente até Orçamentos, e o
item "Orçamentos" do menu não navega (U2), nem há card na home (U3). **Resolver U2+U3 conserta a percepção de
"não chegou".**

---

## 2. Fornecedor

### U5 — Navegação de Serviços confusa
**Sua observação está certa.** Achados:
- A vertical Serviços **não tem dashboard/landing**. `/fornecedor/servicos` abre direto o **catálogo** dos serviços
  cadastrados (a tela cujo título é "Serviços"), mas na bottom-nav essa aba se chama **"Home"** — ambíguo.
- O fluxo é **linear** (cadastrar serviço → receber orçamento → responder → vira trabalho), mas está fatiado em
  **3 abas irmãs** (Home/catálogo, Orçamentos, Trabalhos) **sem elo visual nem contadores** de pendência.
- A aba **"Categorias"** na verdade **volta ao hub** `/fornecedor` — rótulo pouco intuitivo.
- Sinos/ícones de cabeçalho são **estáticos** (sem badge/contador).

**Proposta:**
- **Renomear** a aba "Home" → **"Meus serviços"** (ou "Catálogo"); "Categorias" → **"Início"/"Voltar"** (leva ao hub).
- Adicionar **badges de pendência** nas abas: nº de **orçamentos a responder** (Orçamentos) e de **trabalhos ativos**
  que precisam de ação (Trabalhos). Fonte já existe (`budgets.recebidos`, `works.trabalhos`).
- **(Opção)** criar um **painel de Serviços** como landing da vertical (ver U6), em vez de cair no catálogo.
- **Decisão UX-C:** manter 3 abas (com badges + renome) **ou** unificar num painel único com seções
  "Orçamentos / Trabalhos / Meus serviços"? (recomendo painel único como landing + as listas como sub-telas.)

### U6 — "Fazer orçamento" sem feedback
**Sua observação está certa** ("preenchi, enviei, não chegou / não tem tela"). O envio **funciona** na API
(`PATCH /budgets/:id` status `Responded`), mas a UX quebra a percepção:
- Após enviar, o app leva o fornecedor para a aba **Trabalhos** — onde o orçamento **ainda não aparece** (só vira
  trabalho quando o **cliente aprova**). Parece que "sumiu".
- **Sem** tela de sucesso/toast "orçamento enviado ao cliente".
- O card de orçamento do fornecedor **não mostra o status** (Respondido/Aceito/Recusado) — o view-model nem carrega
  `status`. E o `rejectReason` do cliente existe no DTO mas **não é exibido**.

**Proposta:**
- Após enviar, **voltar para Orçamentos → aba "Respondidos"** (não Trabalhos) + toast **"Orçamento enviado"**.
- Exibir **status** em cada card de orçamento (Aguardando cliente / Aceito / Recusado + motivo).
- Quando o cliente aprova, o item aparece em **Trabalhos** — reforçar com o **badge** de pendência (U5) e, no futuro,
  push (BE-W2/Q-D está adiado, mas o badge in-app já ajuda). **Só front.**
- Campos **forma de pagamento** e **garantia** hoje viram **texto** dentro da descrição; `dataInicio` é coletada e
  **não enviada**. (Estruturar isso é outra fatia — ligada a BE-W3/§5 da auditoria de garantia.)

### U4 (fornecedor) — Chat morto
- **`detalhes-trabalho`** tem o método `abrirChat()` **mas nenhum botão no HTML** o chama → **código morto**, o
  fornecedor **não abre chat** nem no trabalho (apesar de o Work ter `chat.id`).
- **`fazer-orcamento`/`orcamentos-fornecedor`** não têm chat (só "pedir mais informações", unidirecional).

**Proposta:** ver §3.

---

## 3. Chat — estado e proposta unificada

**Existe UM chat real e funcional:** `ChatComponent` em `/chat/:id`, ligado à API (`/chats/:id/messages`, polling 10s).
Ele só precisa de um **`chatId` válido**. Hoje o `chatId` existe **apenas no Work** (`w.chat.id`), criado quando o
orçamento é aprovado. Problemas:
1. **Fornecedor:** botão de chat do trabalho não existe (handler morto) → **adicionar o botão** em `detalhes-trabalho`.
2. **Cliente:** `detalhes-prestador` abre o **chat mock** (`chat-prestador`) → **remover o mock** e apontar para o
   chat real (ou esconder o botão quando não há chat).
3. **`aprovar-orcamento`:** botão de chat é stub → ligá-lo ao chat real **se** o orçamento já tiver chat (ver U7).

### U7 — Chat **antes** de aceitar o orçamento (o que você pediu)
**Sua ideia:** *"o chat pode ser aberto antes de aceitar um orçamento."* Hoje **é impossível**: o **Budget não tem
`chatId`** — a conversa só nasce quando vira Work. Para conversar na fase de orçamento, o **back precisa criar um chat
no nível do Budget**.

**Proposta (precisa de back — nova demanda):**
- Back cria um `ChatRoom` de contexto **`Budget`** quando o orçamento é criado (ou no primeiro "pedir mais
  informações"), e expõe `chat.id` no `ResponseBudgetDto`/`ResponseBudgetListItemDto`.
- Ao aprovar (virar Work), **reaproveitar o mesmo chat** (mudar o contexto para `Work` ou vincular), para a conversa
  não se perder. **Decisão de produto Q-UX1:** o chat do orçamento continua no trabalho, ou são conversas separadas?
- Front: com `chat.id` no Budget, ligar o botão de chat em `aprovar-orcamento` (cliente) e criar entrada de chat em
  `fazer-orcamento`/`orcamentos-fornecedor` (fornecedor).
- **Nota:** o `ChatContextType` do back já inclui `Budget` (segundo o mapa de verticais), então pode ser só **expor o
  chat do budget** na resposta + criá-lo no fluxo — a confirmar com o time de API (**demanda BE-CHAT-1**, abaixo).

---

## 4. Classificação por camada

**Só front (podemos fazer já):**
- U1 (rótulo/affordance de anexos — a UI; o upload em si espera BE-Q8)
- U2 (bottom-nav do cliente compartilhado e funcional)
- U3 (cards de "em andamento" de Serviços na home do cliente; e um painel/landing no fornecedor)
- U4 (ligar chat real: botão no `detalhes-trabalho`; remover mock no cliente)
- U5 (renome de abas + badges de pendência no fornecedor)
- U6 (redirecionar para "Respondidos" + toast + status no card)

**Precisa de back-end:**
- **BE-Q8** (upload S3/fallback) — destrava anexos de verdade (U1).
- **BE-CHAT-1** (novo) — chat no nível do **Budget** para o chat pré-aceite (U7).
- (Já mapeado) BE-W1/BE-W7 — execução da garantia + contador (não é UX, mas completa o fluxo).

**Decisão de produto:**
- UX-A (lançar UI de anexos antes de BE-Q8?), UX-B (itens do bottom-nav do cliente), UX-C (3 abas × painel único),
  Q-UX1 (chat do orçamento continua no trabalho?).

---

## 5. Plano de fatias (decisões travadas)

1. **UX-NAV-CLIENTE** — `BottomNavClienteComponent` compartilhado (Início · Atividade · Mensagens¹ · Perfil) +
   a tela **Atividade** (central cross-vertical). MVP da Atividade: **Serviços** (solicitações + orçamentos
   unificados, sem jargão) e **Delivery** (pedidos); filtros por categoria; demais verticais entram com o back.
   Aplicar o nav em todas as telas do cliente, removendo os navs hardcoded. *(¹ Mensagens só quando **BE-Q5**.)*
2. **UX-HOME-SERVICOS** — card(s) "solicitação em andamento" e "orçamento respondido — responda" na home do
   cliente (U3), no mesmo padrão do card de delivery. Leva à Atividade/detalhe.
3. **UX-FORN-PAINEL** — **painel único** como landing de Serviços do fornecedor (U5+U6): orçamentos a responder +
   trabalhos ativos com contadores; catálogo vira secundário; `fazer-orcamento` volta para "Respondidos" + toast;
   status no card de orçamento (Aguardando/Aceito/Recusado + motivo); badges de pendência.
4. **UX-CHAT-REAL** — ligar o chat real: botão no `detalhes-trabalho` (fornecedor) e no cliente; **remover o mock**
   `chat-prestador` (U4).
5. **UX-ANEXOS** — bloco de anexos **rotulado** no pedido de orçamento (U1): affordance/UI agora; o upload liga
   quando **BE-Q8** existir (decisão UX-A = lançar já a parte visual).
6. **UX-CHAT-BUDGET** — chat **pré-aceite** (U7), **depois de BE-CHAT-1** (chat no nível do Budget, mesma conversa
   segue no Work — Q-UX1).

> Ordem recomendada: **1 → 2 → 3** (só front, alto impacto, independentes). 4 e 5 na sequência; 6 aguarda o back.

---

## 6. Demandas de back-end geradas (a registrar em `backend-demandas.md`)

- **BE-CHAT-1 — Chat no nível do orçamento (Budget).** Hoje o chat só existe no Work (pós-aprovação). Para permitir
  conversa **antes** de aprovar o orçamento: criar/expor um `ChatRoom` de contexto `Budget` (o `ChatContextType` já
  prevê `Budget`) e devolver `chat.id` em `ResponseBudgetDto`/`ResponseBudgetListItemDto`. Ao aprovar, vincular a
  mesma conversa ao Work (Q-UX1). Sem isso, o front não tem como abrir chat na fase de orçamento.
- **BE-Q8 (já registrada)** — upload `POST /upload/one-file` falha por falta de credencial S3 / sem fallback de
  disco. Bloqueia anexos reais em todo o app (inclusive os anexos do pedido de orçamento — U1).

---

## 7. Perguntas de definição — ✅ respondidas
- **UX-A:** ✅ lançar a UI de anexos já (upload liga com BE-Q8).
- **UX-B:** ✅ **Atividade unificada** — menu Início · Atividade · Mensagens · Perfil (Mensagens depende de BE-Q5).
- **UX-C:** ✅ **painel único** como landing do fornecedor.
- **Q-UX1:** ✅ mesma conversa segue do orçamento para o trabalho (orienta BE-CHAT-1).

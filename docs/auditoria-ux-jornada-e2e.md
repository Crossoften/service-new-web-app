# 🔄 Revisão de jornada ponta-a-ponta — Histórico & Urgência

> **Motivo:** ao fechar as fatias de UX (nav + Atividade + painel + chat) apareceram lacunas de **jornada
> completa** que não estavam no recorte inicial: (1) o cliente vê só o que está **em andamento** — não há
> **histórico** (concluídos/cancelados) claro por categoria; (2) o fornecedor entra no hub e **não vê a
> urgência** (ex.: cliente acabou de aprovar um orçamento e mandou chat) — a primeira tela devia gritar isso.
> **Este documento levanta e define** o que precisa ser feito, separando **front / back / produto**, para
> alimentar os ajustes de back-end (feitos em outra sessão) e as próximas fatias de front.
> **Base:** `service-app @ a52b565` (Fatias 1–4 aplicadas). Diagnóstico factual (código lido nesta sessão).

---

## Princípio adotado (para toda mudança daqui em diante)
Antes de mexer em qualquer funcionalidade, mapear a **jornada inteira** dos dois lados (cliente ↔ fornecedor):
criação → em andamento → **conclusão/cancelamento (histórico)** → e a **descoberta** (como o usuário fica sabendo
que algo precisa dele). Uma feature não está "pronta" se só cobre o caminho feliz do estado ativo.

---

## E2E-1 — Histórico do cliente (Atividade só mostra ativo) 🔴

**Diagnóstico:**
- A tela **`/atividade`** (Fatia 1) filtra **apenas ativos**: orçamentos `Pending/Responded/WaitingInformation`,
  solicitações `em_andamento/em_garantia`, pedidos de delivery ativos. **Concluídos e cancelados somem.**
- Cada vertical **já tem** uma lista própria com histórico completo, e **as APIs devolvem todos os status**:
  `/delivery/pedidos` (entregue/cancelado incl.), `/marketplace/negociacoes`, `/aluguel/meus`,
  `/transporte/meus`, `/hospedagem/reservas`, `/empregos/candidaturas`, e em serviços as telas antigas
  `/servicos/solicitacoes` (abas Finalizadas/Canceladas) e `/servicos/orcamentos`.
- **Problema:** essas listas estão **fragmentadas** e, depois que o menu do cliente virou Início · Atividade ·
  Perfil, ficaram **sem porta de entrada** (só via link direto / card da home). O cliente pergunta com razão:
  *"onde vejo o delivery que já foi feito/cancelado?"* — hoje: em `/delivery/pedidos`, mas não é descoberto.

**Proposta (recomendada):** transformar **Atividade** no lugar único, com **dois eixos**:
1. **Status:** abas **Em andamento · Concluídos · Cancelados** (ou "Em andamento / Histórico").
2. **Categoria:** os chips que já existem (Todos · Serviços · Delivery · …).

- **MVP** (só front, dados que já temos): Serviços (orçamentos + solicitações, todos os status) e Delivery
  (todos os status). Cada card leva ao detalhe certo.
- **Demais verticais:** enquanto não entram na agregação, a aba de categoria correspondente **linka para a
  lista própria** já existente (`negociacoes`, `meus-alugueis`, `minhas-reservas`, etc.) — reaproveita o que há.
- Assim **não se perde nada** e o cliente tem um só lugar para "tudo que já fiz", filtrável por categoria e status.

**Camada:** **FRONT** (as listas e os status já vêm das APIs atuais). **Sem back novo.**
**Impacto em "aposentar telas antigas":** as telas por vertical **não devem ser aposentadas cegamente** — viram
a fonte de histórico (ou são absorvidas pela Atividade). Rever aquela decisão à luz disto.

---

## E2E-2 — Urgência na entrada do fornecedor (hub estático) 🔴

**Diagnóstico:**
- Landing pós-login do fornecedor = **`/fornecedor` (`HubFornecedorComponent`)**: um **grid estático** de 7
  verticais. **Não carrega nada** — nenhuma chamada de API, nenhum aviso de pendência.
- Quando o **cliente aprova um orçamento**, o back cria um **Work** (`Pending`) + **ChatRoom**. O fornecedor
  **não é avisado**: ele teria que entrar em Serviços → Painel (Fatia 3) para perceber. Na primeira tela (hub),
  **nada** indica "você tem um trabalho novo aprovado" nem "nova mensagem".

**Proposta:** dar ao hub o mesmo padrão de **card de destaque** que o cliente tem na home — um bloco de
**pendências cross-vertical** no topo do hub:
- **"Trabalho aprovado — inicie"** → Works `Received` com status `Pending` (cliente aprovou). **Front-only.**
- **"Orçamentos a responder (N)"** → budgets `Received` status `Pending`. **Front-only.**
- **"Nova mensagem"** → depende de **BE-Q5** (inbox/não-lidos). Sem isso, não dá para saber que chegou chat
  sem abrir cada conversa. **Precisa back.**
- Tap no card leva ao lugar certo (Painel de Serviços / detalhe do trabalho / chat).

> Observação: hoje a "aprovação do orçamento" **é** detectável no front (vira um Work `Pending`). Então o aviso
> *"trabalho aprovado"* pode sair **já**; o aviso *"nova mensagem de chat"* é que espera o BE-Q5.

**Camada:** **FRONT** (aprovação/orçamentos pendentes) + **BACK** (BE-Q5 para o chat).

---

## E2E-3 — Sinal de "não lido" / chat (transversal) 🟠

**Diagnóstico:** o `ChatService` tem `mensagens`, `enviar`, `marcarLido` (`PATCH /chats/:id/read`) e
`chatByContext` (`GET /chats/context/:type/:refId`), mas **não há**:
- **inbox** de conversas (`GET /chats`) — para uma tela "Mensagens" e para badges;
- **contador de não-lidos** por conversa e total — para o badge de urgência (E2E-2) e para a aba **Mensagens**
  do cliente (que ficou reservada na Fatia 1, dependente de **BE-Q5**).

**Proposta:** com **BE-Q5** entregando inbox + não-lidos:
- Cliente: ativar a aba **Mensagens** (4ª aba do menu) com a lista de conversas + badge de não-lidos.
- Fornecedor: card "nova mensagem" no hub (E2E-2) + badge.
- Ambos: badge de não-lidos no botão de chat do detalhe.

**Camada:** **BACK (BE-Q5)** destrava; depois **FRONT** consome.

---

## Itens elencados (para as próximas fatias)

| ID | Item | Camada | Depende de |
|---|---|---|---|
| **E2E-1** | Atividade com **Em andamento / Concluídos / Cancelados** + filtro por categoria; verticais sem agregação linkam para a lista própria | **FRONT** | — |
| **E2E-2a** | Card de **pendência no hub do fornecedor**: "trabalho aprovado — inicie" + "orçamentos a responder" | **FRONT** | — |
| **E2E-2b** | Card **"nova mensagem"** no hub do fornecedor | **FRONT** | **BE-Q5** |
| **E2E-3a** | Aba **Mensagens** do cliente (inbox de conversas) | **FRONT** | **BE-Q5** |
| **E2E-3b** | Badge de **não-lidos** (hub, home, botão de chat) | **FRONT** | **BE-Q5** |
| **E2E-4** | Rever "aposentar telas antigas": vira **fonte de histórico** ou é absorvida pela Atividade (não apagar cegamente) | **PRODUTO/FRONT** | E2E-1 |

---

## Necessidades de back-end a listar (para a sessão de backend)

- **BE-Q5 (já registrada, agora prioritária) — Inbox de chats + não-lidos.**
  - `GET /v1/chats` (ou `/chats/me`): lista paginada de conversas do usuário, com: contraparte (nome/foto),
    contexto (`Work`/`Budget`/`CommercialTransaction`/…) + `referenceId`, última mensagem (texto/data) e
    **`unreadCount`**. Idealmente um **total de não-lidos** barato (`GET /v1/chats/unread-count`) para os badges.
  - Sem isso, o front não tem como surfaçar "nova mensagem" sem abrir cada conversa (só há
    `/chats/:id/messages` e `/chats/context/...`).
- **(Opcional, futuro) BE-NOTIF — Notificações/eventos** para "trabalho aprovado", "orçamento respondido",
  "mensagem recebida" (push/WebSocket). Não bloqueia o MVP in-app (que usa polling + contadores), mas é o
  caminho para avisar fora do app. *(Relaciona-se com BE-Q13/Web Push já citados.)*
- **Nota:** **E2E-1 e E2E-2a NÃO precisam de back** — as APIs atuais já devolvem todos os status e os Works
  `Pending`/budgets `Pending` já são consultáveis. Dá para entregar essas duas fatias **antes** do backend.

---

## Perguntas de produto (para você)
- **Q-E2E-1:** na Atividade, prefere **abas** (Em andamento / Concluídos / Cancelados) **ou** um único "Histórico"
  (tudo que não está ativo)? E o filtro por categoria continua como chips por cima disso?
- **Q-E2E-2:** as verticais sem agregação (aluguel/transporte/hospedagem/empregos/compra-venda) entram **já** na
  Atividade linkando para a lista própria, ou deixamos a Atividade só com **Serviços + Delivery** por enquanto?
- **Q-E2E-3:** no hub do fornecedor, um **card único** "você tem pendências (N)" que abre um resumo, ou **cards
  separados** por tipo (trabalho aprovado / orçamento a responder / mensagem)?

---

## Sequência sugerida (quando você validar)
1. **E2E-1** (histórico na Atividade) — só front, alto impacto, fecha a jornada do cliente.
2. **E2E-2a** (urgência no hub do fornecedor: trabalho aprovado + orçamentos) — só front.
3. *(backend BE-Q5 em paralelo, na outra sessão)*
4. **E2E-2b + E2E-3a + E2E-3b** (mensagens/não-lidos) — quando BE-Q5 existir.
5. **E2E-4** (decidir destino das telas antigas) — depois que a Atividade cobrir histórico.

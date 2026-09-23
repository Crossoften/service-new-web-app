# 🔄 Revisão de jornada ponta-a-ponta — Histórico & Urgência

> **Motivo:** ao fechar as fatias de UX (nav + Atividade + painel + chat) apareceram lacunas de **jornada
> completa** que não estavam no recorte inicial: (1) o cliente vê só o que está **em andamento** — não há
> **histórico** (concluídos/cancelados) claro por categoria; (2) o fornecedor entra no hub e **não vê a
> urgência** (ex.: cliente acabou de aprovar um orçamento e mandou chat) — a primeira tela devia gritar isso.
> **Este documento levanta e define** o que precisa ser feito, separando **front / back / produto**, para
> alimentar os ajustes de back-end (feitos em outra sessão) e as próximas fatias de front.
> **Base:** `service-app @ a52b565` (Fatias 1–4 aplicadas). Diagnóstico factual (código lido nesta sessão).

> ### ✅ Decisão de arquitetura de informação (travada)
> Este é um **super-app de categorias distintas** (delivery, serviços, hospedagem…). Uma **lista única** que
> mistura tudo **não serve** — perde o contexto da categoria e não escala; e ações de domínio (ex.: **garantia**,
> que só existe em Serviços e atua sobre um trabalho específico) vivem no **detalhe da categoria**, não num feed
> genérico. Portanto:
> - **Categoria em primeiro lugar.** O cross-vertical é **raso** (só o *glance* de urgência); o **gerenciamento**
>   (histórico, garantia, acompanhamento) acontece **dentro de cada categoria**.
> - **Cliente:** **Atividade = índice por categoria** (lista categorias com contador) → cada uma abre a **tela de
>   atividade daquela categoria** (Ativos/Histórico + ações do domínio). Reaproveita as telas por vertical.
> - **Fornecedor:** **hub com urgência por vertical** (pendências por card) → **painel da vertical**
>   (Ativos/Histórico + ações). Simétrico ao cliente; reaproveita o Painel de Serviços (Fatia 3).
> - **Consequência:** a `Atividade` da Fatia 1 (feed unificado) será **retrabalhada** para esse índice por categoria.

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

**Proposta (decidida) — Atividade = índice por categoria:**
```
[ Atividade ]
  🔧 Serviços        2 ativos   ›   → tela de Serviços (Orçamentos + Trabalhos, abas Ativos/Histórico; garantia no detalhe)
  🛵 Delivery        1 em and.  ›   → Pedidos (Ativos/Histórico)
  🏠 Hospedagem      —          ›   → Minhas reservas
  🛒 Compra e Venda  3          ›   → Negociações
  …
```
1. **Atividade** deixa de ser um feed e vira um **índice**: lista as categorias em que o cliente tem atividade,
   cada uma com **contador** (nº de itens ativos) e seta.
2. Tocar numa categoria abre a **tela de atividade daquela categoria**, com **abas Ativos / Histórico** e as
   **ações do domínio** (a garantia, por exemplo, fica no **detalhe do trabalho** dentro de Serviços).
3. **Reaproveita** as telas por vertical que já existem: Delivery → `/delivery/pedidos`; Compra e Venda →
   `negociacoes`; Aluguel → `meus-alugueis`; Hospedagem → `minhas-reservas`; Empregos → `minhas-candidaturas`.
   **Serviços** ganha uma tela de atividade que **une Orçamentos + Trabalhos** (as duas etapas) com Ativos/Histórico.
4. Cada tela de categoria só precisa **incluir o Histórico** (Concluídos/Cancelados) — as APIs já devolvem todos
   os status; hoje várias só mostram ativo.

**Camada:** **FRONT** (as listas e os status já vêm das APIs atuais). **Sem back novo.**
**Impacto em "aposentar telas antigas":** as telas por vertical **não são aposentadas** — elas **são** as telas de
atividade por categoria (recebem as abas Ativos/Histórico). A `Atividade` da Fatia 1 (feed) é retrabalhada em índice.

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
| **E2E-1a** | **Atividade = índice por categoria** (lista categorias + contador de ativos → tela da categoria); retrabalha o feed da Fatia 1 | **FRONT** | — |
| **E2E-1b** | **Tela de atividade de Serviços** unindo Orçamentos + Trabalhos com abas **Ativos/Histórico** (garantia no detalhe) | **FRONT** | — |
| **E2E-1c** | **Histórico (Concluídos/Cancelados)** nas telas por vertical que hoje só mostram ativo (delivery já mostra tudo) | **FRONT** | — |
| **E2E-2a** | Card de **pendência no hub do fornecedor**: "trabalho aprovado — inicie" + "orçamentos a responder" (por vertical) | **FRONT** | — |
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

## Decisões e perguntas de produto
- ✅ **IA (decidida):** cliente = **Atividade como índice por categoria**; fornecedor = **hub com urgência por
  vertical → painel da vertical**. (Ver callout no topo.)
- **Q-E2E-1 (aberta):** o **índice** de Atividade lista **só as categorias com atividade**, ou **todas** as
  categorias sempre (com "—" quando vazio)? (recomendo: só as que têm atividade, para não poluir.)
- **Q-E2E-2 (aberta):** dentro da tela de cada categoria, **abas Ativos/Histórico** (recomendado) ou um filtro
  de status (Em andamento/Concluídos/Cancelados)?
- **Q-E2E-3 (aberta):** no hub do fornecedor, **card único** "você tem N pendências" (abre resumo) ou **cards
  separados** por tipo (trabalho aprovado / orçamento a responder / mensagem)?

---

## Sequência sugerida (quando você validar)
1. **E2E-1a + E2E-1b** — Atividade vira índice por categoria + tela de atividade de Serviços (Orçamentos+Trabalhos,
   Ativos/Histórico). Só front, fecha a jornada do cliente e resolve o "tudo numa lista só".
2. **E2E-1c** — completar Histórico nas demais telas por vertical que só mostram ativo.
3. **E2E-2a** — urgência no hub do fornecedor (trabalho aprovado + orçamentos), por vertical. Só front.
4. *(backend BE-Q5 em paralelo, na outra sessão)*
5. **E2E-2b + E2E-3a + E2E-3b** — mensagens/não-lidos — quando BE-Q5 existir.
6. **E2E-4** — as telas por vertical **são** a atividade da categoria (não há mais "aposentar"); só ajustar rótulos.

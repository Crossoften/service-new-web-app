# 🔍 Auditoria — Serviços / Orçamentos / Trabalhos (Fornecedor e Cliente)

> **Objetivo:** mapear a feature completa de Serviços (orçamento → trabalho → pagamento → **garantia**)
> nas três fontes de verdade e definir a melhor forma de fechar o fluxo — em especial a **garantia**,
> hoje incompleta em toda a cadeia.
> **Fontes desta auditoria:**
> 1. **Fluxo original** mapeado na época do front (referência de produto — 7 telas do FORNECEDOR → SERVIÇOS).
> 2. **Front-end atual** — `service-app` @ `d8d7890` (integração real; auditoria de código).
> 3. **Back-end atual** — `service-new-ws` @ `b60afd0` (branch local `ajustes-gerais`; auditoria de código).
>
> **Nota de escopo:** este documento é **diagnóstico e definição** — não implementa nada.
> Nenhuma alteração de back-end é feita aqui; necessidades ficam registradas em `docs/backend-demandas.md`.
> As decisões de produto (§6) foram **tomadas pelo cliente** (ver "Decisões travadas") e orientam o fatiamento.

> ### ✅ Decisões travadas (cliente)
> - **Q-A — Modelo de execução:** **Opção B** — garantia aprovada gera um **Work de garantia vinculado**
>   (rastreável à parte), e as garantias (concluídas **ou não**) **viram um número no perfil do fornecedor**.
> - **Q-B — Recusa:** **decisão final do fornecedor** — o sistema apenas **computa** e a **lista no admin**.
> - **Q-C — Validade:** definida **na conclusão** (`FinishWorkDto.warrantyExpiresAt`) — sem back novo para a data.
> - **Q-D — Notificação:** **não** por enquanto.
> - **Q-E — Custo:** **garantia sem custo** (Work de garantia com `serviceValue = 0`).
>
> **Fatia 1 (entregue — GAR-1):** garantia *respondível* só no front (responder pelo fornecedor, solicitar por
> modal no cliente, status/badges) — usa o que o back já expõe. Execução (Work de garantia) e contador no
> perfil aguardam **BE-W1/BE-W7**.

---

## 0. Resumo executivo

- O **caminho feliz** (cliente pede orçamento → fornecedor responde → cliente aprova → trabalho é
  executado → cliente paga via Mercado Pago) está **funcional ponta a ponta** nas três camadas.
- A **garantia é o buraco central**. Ela existe como **registro documental** nas três camadas, mas
  **não tem execução em lugar nenhum**:
  - **Back:** aprovar a garantia só grava `warrantyRequestStatus=Approved` — não reabre o trabalho,
    não cria trabalho novo, não muda status, não cobra, não agenda, não notifica. `Approved` e
    `Rejected` rodam **o mesmo update**.
  - **Front (cliente):** solicita garantia via `window.prompt` (sem tela, sem anexos).
  - **Front (fornecedor):** **não existe UI para responder garantia** — o método
    `WorkService.responderGarantia()` está no código mas **nunca é chamado**.
  - **Ambos:** o **status** da garantia (Pending/Approved/Rejected) e as descrições
    **não são exibidos** — só há um badge binário "Em garantia".
- Além da garantia, há **dívidas menores** já mapeadas: pagamento de serviço com mapeamento de método
  incorreto e DTO desatualizado, uploads de anexo em *stub*, chat do prestador 100% mock, avaliação/review
  não implementada, e código morto (mocks e arquivos ` 2.ts`).
- **Nada disso exige decidir "tudo agora".** A recomendação é: **(1)** fechar o *display* + a **resposta de
  garantia do fornecedor** (destrava o fluxo já existente sem back novo), **(2)** decidir o modelo de
  execução da garantia (§6), e só então **(3)** implementar reparo/rastreio, que exige back-end novo.

---

## 1. Mapa das três fontes — visão por etapa

Legenda: ✅ existe/completo · 🟡 parcial/rudimentar · ❌ ausente · 🧩 só documental (grava dado, sem efeito)

| Etapa do fluxo | Fluxo original (produto) | Front atual | Back atual | Situação |
|---|---|---|---|---|
| **Listagem de serviços** (fornecedor) | Lista Ativos/Inativos | ✅ `listagem-servicos-fornecedor` → `GET /services/my-services` | ✅ | ✅ |
| **Selecionar categoria** | Escolher categoria p/ criar | ✅ `categoria-servicos` → `GET /services/categories` | ✅ (`@IsPublic`) | ✅ |
| **Criar serviço** | Nome, preço (ou sob orçamento), descrição, imagem, garantia? | ✅ `criar-servico` → `POST/PATCH /services` (upload real) | ✅ CRUD | ✅ (serviço **não** carrega "garantia padrão" — ver §5) |
| **Orçamentos recebidos** (fornecedor) | Todos/Respondidos/Não respondidos | ✅ `orcamentos-fornecedor` → `GET /budgets?scope=Received` | ✅ | ✅ |
| **Fazer orçamento** | Valor, prazo, forma de pagamento, **Tempo de garantia** | 🟡 `fazer-orcamento` → `PATCH /budgets/:id` | 🟡 | 🟡 **garantia e forma de pagamento viram só texto** na descrição |
| **Cliente aprova orçamento** | Aprovar → vira trabalho | ✅ `aprovar-orcamento` → `PATCH /budgets/:id/approve` | ✅ cria Work + Chat | ✅ |
| **Trabalhos** (fornecedor) | Em andamento / Finalizadas / Canceladas | ✅ `trabalhos-fornecedor` → `GET /works?scope=Received` | ✅ | ✅ leitura |
| **Detalhe do trabalho — Step 1 (iniciar)** | Iniciar serviço | ✅ `detalhes-trabalho` → `PATCH /works/:id/start` | ✅ `Pending→InProgress` | ✅ |
| **Detalhe — acréscimo** | Pedir valor adicional | ✅ `request-extra` / `respond-extra` (nível Work) | ✅ soma em `totalValue` | ✅ (sem re-cobrança se já pago — ver §4) |
| **Detalhe — Step 2 (chegada)** | Cliente confirma chegada | ✅ `confirm-arrival` | 🟡 só grava timestamp; `finish` não exige | 🟡 |
| **Detalhe — Step 3 (concluir)** | Finalizar com descrição/anexos | 🟡 `finish` só envia `completionDescription` | ✅ aceita `completionFiles/serviceValue/warrantyExpiresAt` | 🟡 front não envia anexos/valor/validade da garantia |
| **Pagamento do serviço** (cliente) | Pagar após concluído | 🟡 `pagamento-servico` → `POST /works/:id/pay` | ✅ Mercado Pago (split) | 🟡 **DTO front desatualizado**; método mapeado errado (ver §4) |
| **Solicitar garantia** (cliente) | Acionar garantia | 🟡 `window.prompt` → `POST /works/:id/request-warranty` | 🧩 grava request | 🟡/🧩 |
| **Responder garantia** (fornecedor) | Aprovar/Recusar garantia | ❌ **sem UI** (`responderGarantia()` órfão) | 🧩 grava status; **sem efeito** | ❌/🧩 |
| **Executar reparo em garantia** | *(implícito no produto)* | ❌ | ❌ **não modelado** | ❌ **precisa definição + back novo** |
| **Avaliar/review do serviço** | *(pós-conclusão)* | ❌ *stub* `revisao()` | ✅ `POST /services/:id/reviews` (Positive/Negative) | ❌ front não implementa |
| **Chat com prestador** | Conversa | 🟡 `chat-prestador` **100% mock** (o chat real do Work funciona via `chatId`) | ✅ ChatRoom criado no approve | 🟡 |

---

## 2. Garantia — a cadeia completa (as três fontes lado a lado)

### 2.1 O que o BACK realmente faz (`works.service.ts`)
- **`requestWarranty`** (cliente/requester ou Admin). Pré-condições: Work `Finished` **e**
  `warrantyExpiresAt` válido (`>= agora`) **e** sem request `Pending`. Grava
  `warrantyRequestedAt`, `warrantyRequestDescription`, `warrantyRequestStatus=Pending`, zera a resposta
  anterior e (opcional) substitui os anexos `WarrantyRequest`. **Não muda status, não notifica.**
- **`respondWarranty`** (fornecedor/provider ou Admin). Pré-condição: `warrantyRequestStatus=Pending`.
  Grava **apenas** `warrantyRequestStatus = Approved|Rejected`, `warrantyResponseDescription`,
  `warrantyRespondedAt`. **`Approved` e `Rejected` executam o mesmo update** — nenhum efeito colateral
  distingue os dois.
- **Modelo:** tudo em colunas do próprio `Work` (**slot único** — nova solicitação sobrescreve a anterior,
  sem histórico). `isUnderWarranty` é **computado** em runtime (`!!warrantyExpiresAt && status===Finished
  && warrantyExpiresAt >= now`), **não persistido**.
- **Conclusão:** a garantia hoje **termina no "respond"**. A execução do reparo **não existe** no back —
  não há "iniciar reparo", "concluir reparo" nem reabertura. Após aprovar, o Work fica `Finished` com
  `warrantyRequestStatus=Approved`: **um carimbo documental**.

### 2.2 O que o FRONT expõe
- **Modelo disponível** (work.ts): `warrantyExpiresAt`, `warrantyRequestedAt`,
  `warrantyRequestDescription`, `warrantyResponseDescription`, `warrantyRespondedAt`,
  `warrantyRequestStatus`, `isUnderWarranty`.
- **View-models expõem só** `validadeGarantia` (de `warrantyExpiresAt`) e o status derivado `em_garantia`
  (de `isUnderWarranty`). **`warrantyRequestStatus` e as descrições NÃO são mapeados** — a UI não sabe se
  está Pending/Approved/Rejected nem mostra o problema/resposta.
- **Cliente:** `detalhes-solicitacao.solicitarGarantia()` chama a API, mas coleta a descrição via
  **`window.prompt`**, **sem tela dedicada e sem anexos** (apesar de `RequestWorkWarrantyDto.files` existir).
  O botão só aparece no step `concluido` e **não** checa janela de validade nem pagamento.
- **Fornecedor:** **não há UI.** `WorkService.responderGarantia()` (`PATCH /works/:id/respond-warranty`)
  existe mas **nunca é chamado** (confirmado por grep em todo `src`). `detalhes-trabalho` não tem
  step/botão/modal de aprovar ou rejeitar garantia — trabalho em garantia cai no step `concluido`, cujo
  único botão apenas navega de volta.
- **Exibição:** badge binário "Em garantia" + `Val: {data}` nos cards. **Não há** rótulo do status
  (Approved/Rejected/Pending) em tela nenhuma. "Garantias totais/atendidas" em `detalhes-prestador` e
  `aprovar-orcamento` são **hardcoded 0**.

### 2.3 Diferença para o fluxo original (produto)
O fluxo original previa, em "Fazer orçamento", um campo **"Tempo de garantia"**, e nos "Detalhes do
trabalho" a garantia como parte do ciclo. Na prática:
- O "Tempo de garantia" **não virou campo estruturado** — em `fazer-orcamento` a garantia é só **texto**
  concatenado em `responseDescription` (`Garantia: 6 meses`). O back até tem onde guardar
  (`warrantyExpiresAt` em `CreateWork/FinishWork`), mas o front **não define** essa data em nenhum momento
  de resposta/criação/conclusão.
- O produto tratava a garantia como algo **acionável** (reparo), mas nem front nem back modelam a
  **execução** do reparo — só o registro do pedido/resposta.

---

## 3. Tabela de lacunas — classificada por onde resolver

> `FRONT` = app Angular · `BACK` = `service-new-ws` (só documentar em `backend-demandas.md`) ·
> `ADMIN` = portal administrativo (fora deste PWA) · `PRODUTO` = decisão do cliente antes de codar.

| # | Lacuna | Camada(s) | Prioridade | Observação |
|---|---|---|---|---|
| G1 | Fornecedor **não responde garantia** (`responderGarantia()` órfão) | **FRONT** | 🔴 Alta | Destrava o fluxo **já existente** no back; sem back novo |
| G2 | **Status da garantia** (Pending/Approved/Rejected) + descrições não exibidos | **FRONT** | 🔴 Alta | Só mapear campos que já vêm na API |
| G3 | Solicitação de garantia via `window.prompt`, sem tela/anexos | **FRONT** | 🟠 Média | `RequestWorkWarrantyDto.files` já existe |
| G4 | **Execução do reparo em garantia não modelada** | **BACK** + **PRODUTO** | 🔴 Alta | Decisão §6 → depois back novo (novo Work / reabertura / ordem de reparo) |
| G5 | `Approved` e `Rejected` são idênticos no back (sem efeito colateral) | **BACK** + **PRODUTO** | 🟠 Média | Depende de G4 |
| G6 | Garantia **não notifica** (sem WhatsApp/chat, ao contrário de start/finish) | **BACK** | 🟠 Média | Cliente/fornecedor não sabem que houve pedido/resposta |
| G7 | "Tempo de garantia" vira **texto**, não `warrantyExpiresAt` | **FRONT** (+ BACK confirmar origem) | 🟠 Média | Definir onde a data é setada: resposta do orçamento? conclusão? |
| G8 | Garantia é **slot único** (sobrescreve; sem histórico) | **BACK** + **PRODUTO** | 🟡 Baixa | Só relevante se houver múltiplos acionamentos |
| G9 | Pagamento: **DTO front desatualizado** (`holderName/cardNumber…`) vs back atual (`payerEmail?`) | **FRONT** | 🔴 Alta | Back agora é **checkout MP** (`{checkoutUrl}`); front não trata redirect |
| G10 | Pagamento: método mapeado errado (`debito→CreditCard`, `dinheiro→BankSlip`) | **FRONT** | 🟠 Média | Back só faz MP p/ Work; `Cash` não tem caminho — decidir o que oferecer |
| G11 | `PaymentStatus` (Pending/Paid) não exibido; Work fica `Finished` mesmo pago | **FRONT** (+ BACK) | 🟠 Média | Back não muda `Work.status` no pagamento; "pago" só no `Payment` |
| G12 | Uploads de anexo em *stub* (`requisitos`, `fazer-orcamento`, `detalhes-trabalho`) | **FRONT** | 🟠 Média | `upload/one-file` depende de AWS (BE-Q8) |
| G13 | `finish` não envia `completionFiles`/`serviceValue`/`warrantyExpiresAt` | **FRONT** | 🟠 Média | Ligado a G7 |
| G14 | Avaliação/review do serviço não implementada (`revisao()` *stub*) | **FRONT** | 🟡 Baixa | `POST /services/:id/reviews` pronto no back |
| G15 | Chat do prestador (`chat-prestador`) 100% mock | **FRONT** | 🟡 Baixa | Chat real do Work já funciona via `chatId` |
| G16 | Acréscimo em nível de **budget** só tem "responder"; falta "solicitar" | **FRONT** | 🟡 Baixa | `RequestBudgetExtraDto` órfão; extra do Work funciona |
| G17 | Acréscimo aprovado após pagamento **não re-cobra** | **BACK** + **PRODUTO** | 🟡 Baixa | `request-extra` liberado em quase qualquer status |
| G18 | `finish` não exige `confirm-arrival` | **BACK** | 🟡 Baixa | Robustez; `arrivalConfirmedAt` é opcional |
| G19 | Código morto: mocks `servicos.ts`/`fornecedor-servicos.ts` (front) e ` 2.ts` (back) | **FRONT** + **BACK** | 🟡 Baixa | Limpeza; mocks front declaram `StatusOrcamento` divergente |
| G20 | "Garantias totais/atendidas" e `foto` hardcoded 0/'' nos VMs de catálogo | **FRONT** (+ BACK expor agregado) | 🟡 Baixa | Back não expõe esse agregado hoje |

---

## 4. Pagamento — estado real (contexto para G9–G11)

O back mudou: **`PayWorkDto` hoje é só `{ payerEmail? }`** e `pay()` gera um **checkout Mercado Pago com
split** (`{ checkoutUrl, work }`), exigindo Work `Finished`, sem Payment prévio e **provider com conta MP
vinculada** (`verifySellerLinked` lança se não houver). A confirmação é **assíncrona por webhook**
(`Payment.status: Pending→Paid`, trilha de `FinancialTransaction` crédito/débito/fee). **O `Work.status`
nunca muda no pagamento** — permanece `Finished`; "pago" só existe no `Payment` (`referenceType=Work`).

O **front está desatualizado**: `pagamento-servico` não coleta nada (0 inputs), envia `{method}` mapeado
para 3 métodos (dois errados), **não trata o `checkoutUrl`/redirect** e não mostra `PaymentStatus`. Ou
seja, o front foi escrito para um contrato antigo. **Isto é uma fatia própria** (alinhar pagamento de
serviço ao checkout MP, como já foi feito no marketplace com `mercado-pago.ts`), independente da garantia.

---

## 5. Onde a "garantia" deveria nascer (definição de dado)

Hoje o front trata garantia como **texto livre** e nunca grava `warrantyExpiresAt`. O back oferece **três
pontos** onde a data poderia ser definida:
1. **Na resposta do orçamento** (`fazer-orcamento`) — mais próximo do fluxo original ("Tempo de garantia"),
   mas `UpdateBudgetDto` **não tem** campo de garantia; a data só existiria ao virar Work.
2. **Na criação do Work** (`CreateWorkDto.warrantyExpiresAt`) — quando o provider cria via `POST /works`
   (porta pouco usada; o padrão é o cliente aprovar o budget).
3. **Na conclusão** (`FinishWorkDto.warrantyExpiresAt`) — o provider define a validade ao finalizar.
   **É o ponto mais coerente** com "a garantia começa a contar quando o serviço termina".

**Recomendação técnica:** setar `warrantyExpiresAt` **na conclusão** (opção 3), calculada a partir de um
"tempo de garantia" que o fornecedor informa (ex.: "6 meses" → `finishedAt + 6 meses`). Isso reaproveita
`FinishWorkDto` sem back novo. Se o produto quiser mostrar a garantia **antes** de concluir (no orçamento),
aí sim precisa de campo novo no back (registrar em `backend-demandas.md`). **→ pergunta de produto Q-C (§6).**

---

## 6. Desenho da execução da garantia — opções e decisões de produto

O ponto que **trava a definição** é: *o que acontece quando a garantia é aprovada?* Hoje: nada. Abaixo,
duas opções de modelagem. Ambas exigem **back-end novo** (registrado depois em `backend-demandas.md`), mas
diferem em custo e em como o histórico fica rastreável.

### Opção A — Reabrir o mesmo Work (reparo "in-place")
Aprovar a garantia **reabre** o trabalho atual: novo status (ex.: `WarrantyInProgress` ou volta a
`InProgress`), o provider executa e conclui de novo (`finish`), sem nova cobrança.

| | |
|---|---|
| **Prós** | Simples de entender ("é o mesmo serviço, agora em reparo"); reaproveita `start/finish`; um só registro. |
| **Contras** | Perde o histórico do 1º atendimento (datas/valores sobrescritos); `isUnderWarranty` depende de `status===Finished`, então um Work reaberto "sai" da janela; mistura execução original com reparo no mesmo objeto; relatórios/pagamento (`Payment` casado por `referenceId`) ficam ambíguos. |
| **Impacto FRONT** | Médio — novo status/step "em reparo" em `detalhes-trabalho` e `detalhes-solicitacao`. |
| **Impacto BACK** | Médio — novo status no enum + endpoints "iniciar/concluir reparo" + ajuste do cálculo `isUnderWarranty`. |
| **Impacto ADMIN** | Baixo. |

### Opção B — Gerar um **Work de garantia** vinculado (reparo rastreável à parte) — *recomendada*
Aprovar a garantia **cria um novo Work** do tipo "garantia", ligado ao Work original
(`parentWorkId`/`originWorkId`), `serviceValue=0` (sem cobrança), com seu próprio ciclo
`Pending→InProgress→Finished`. O Work original permanece intacto (histórico preservado).

| | |
|---|---|
| **Prós** | Histórico completo (atendimento original + N reparos); cada reparo tem datas/anexos/chat próprios; `Payment`/relatórios não ambíguos; permite múltiplos acionamentos (resolve G8); "garantia sem custo" fica explícita (`serviceValue=0`). |
| **Contras** | Mais estrutura no back (FK `parentWorkId`, filtro para não cobrar, listagem que agrupa pai/filho); front precisa distinguir "trabalho normal" de "trabalho de garantia" nas listas. |
| **Impacto FRONT** | Médio — badge "Garantia" no card do Work-filho; link pai↔filho; reaproveita as telas de trabalho existentes. |
| **Impacto BACK** | Médio-alto — `parentWorkId` + criação automática no `respondWarranty(Approved)` + regra de não-cobrança. |
| **Impacto ADMIN** | Baixo-médio — se o admin for mediar recusas (Q-B), precisa ver pai/filho. |

**Recomendação:** **Opção B.** Preserva histórico, evita ambiguidade de pagamento/relatório, escala para
múltiplos acionamentos e mantém "garantia = sem custo" explícito. A Opção A é mais barata só no curtíssimo
prazo, mas suja o modelo.

### Independente da opção — quick win sem back novo
Antes de qualquer decisão de execução, dá para **destravar o que já existe** (G1+G2+G3) numa fatia só de
front: (a) mapear `warrantyRequestStatus` + descrições nos view-models; (b) tela/modal de **resposta de
garantia do fornecedor** (`respond-warranty`, Aprovar/Recusar + justificativa); (c) tela de **solicitação**
decente no cliente (substituir o `window.prompt`, aceitar anexos); (d) badges de status. Isso já entrega
uma garantia **auditável e respondível**, mesmo que a "aprovação" ainda não dispare o reparo — que entra
depois, conforme §6.

### ✅ Decisões de produto (respondidas pelo cliente)
- **Q-A:** **Opção B** (novo Work de garantia rastreável) **+ contador de garantias no perfil do fornecedor**
  (concluídas ou não). → BE-W1 / BE-W7.
- **Q-B:** **decisão final do fornecedor**; o sistema **computa** e **lista no portal admin** — sem mediação.
- **Q-C:** validade **na conclusão** (`FinishWorkDto.warrantyExpiresAt`). **Sem back novo** para a data.
- **Q-D:** **não** por enquanto.
- **Q-E:** **sem custo** — Work de garantia com `serviceValue = 0`.

---

## 7. Sequência sugerida (quando o cliente decidir)

1. **Fatia FRONT — garantia respondível** (G1+G2+G3+badges): sem back novo. Destrava o fluxo existente.
2. **Fatia FRONT — pagamento MP do serviço** (G9+G10+G11): alinhar ao checkout atual (independe de garantia).
3. **Definição Q-A…Q-E** → registrar demandas de back (execução do reparo, notificação, validade estruturada).
4. **Fatia FRONT — execução da garantia** conforme a opção escolhida (novo status/step ou Work-filho).
5. **Limpeza** (G19) + review (G14) + anexos (G12/G13) como fatias menores oportunas.

> Enquanto as decisões §6 não chegam, seguimos apenas nos itens **sem back novo** (1 e 2), que já melhoram
> muito o fluxo sem comprometer as escolhas de modelagem.

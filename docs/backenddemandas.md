# 🔧 Demandas de Back-end — Service App

> Rastreamento das necessidades de API levantadas na auditoria/integração do front.
> **O front não altera o back-end** — tudo aqui é registrado para o time de API.
> Fontes: Swagger/`openapi.json` (`service-new-ws` @ `ajustes-gerais`) + `ORIENTACOESFRONT.md`.

## Núcleo (BE-01…BE-17) — implementadas no back

| ID | Assunto | Situação |
|---|---|---|
| BE-01…BE-12 | Endpoints transacionais das verticais (serviços/orçamentos/trabalhos, produtos/negociações, aluguel, transporte, hospedagem, empregos, delivery, chat) | ✅ Implementados |
| BE-13 | `birthDate` como `type: string, format: date` (era `type: object`) | ✅ Corrigido (`YYYY-MM-DD`) |
| BE-14 | Autorização por `profileType` (403 nas rotas restritas) | ✅ Implementado |
| BE-15 | Assinatura como pré-condição do fornecedor (403 sem assinatura, inclusive GETs) | ✅ Implementado (Front trata no `errorInterceptor` → `/fornecedor/assinatura`) |
| BE-16 | Cobrança por vertical (delivery híbrido, payouts) | ✅ Implementado |
| BE-17 | Repasse/ganhos do **entregador** (sem endpoint próprio) | 🟡 Parcial — expor `GET /v1/deliveries/me/earnings` |

## Delivery — gaps de auditoria (BE-D1…BE-D5)

| ID | Assunto | Situação |
|---|---|---|
| BE-D1 | `ResponseRestaurantDto` sem avaliação/tempo/logo/taxa (a UI mostra) | ⚠️ **Parcialmente resolvido** — `ratingAverage`/`ratingCount` adicionados (Fase C). Faltam tempo de entrega/logo. |
| BE-D2 | `POST /food-orders` não recebia endereço de entrega | ⚠️ Endereço vem do perfil; ver BE-Q7 (coordenadas) |
| BE-D3 | `paymentMethod` só `CreditCard/Pix/BankSlip` (UI tinha débito/dinheiro) | ✅ **Resolvido** (Fase C: 5 métodos `+DebitCard/Cash`) |
| BE-D4 | `deliveryFee` era enviado pelo cliente | ✅ **Resolvido** (Fase C: campo removido; servidor calcula) |
| BE-D5 | `GET /restaurants/categories` sem `iconUrl` | ⚠️ Front usa fallback local por `slug` |

## Delivery Fornecedor (BE-F1, BE-F2)

| ID | Assunto | Situação |
|---|---|---|
| BE-F1 | `DELETE` de item de cardápio | ✅ **Resolvido** (Fase C: `DELETE /restaurants/menu-items/:id` → `{deleted}`) |
| BE-F2 | Payout do restaurante sem recorte por período | ⚠️ Opcional: `?period=day\|week\|month` |

## Dúvidas/ajustes (BE-Q1…BE-Q7)

| ID | Assunto | Ação p/ o back |
|---|---|---|
| BE-Q1 | **Verificação de conta / login `Pending`.** Fluxo register → SMS → `verify-account`. Login de conta `Pending` cai em `401` genérico (conservador). | ✅ Em produção. Confirmar se `401` para `Pending` é intencional; front oferece link de reenvio como saída. |
| BE-Q2 | **Telefone** agora obrigatório no front; `phone` era opcional no contrato. | ✅ Resolvido (contrato tornou `phone` obrigatório em `RegisterBaseDto`). |
| BE-Q3 | **Assinatura do fornecedor** movida para onboarding pós-login. | ❓ Confirmar momento/obrigatoriedade. |
| BE-Q4 | **`/login` nem sempre retornava `profileType`.** Contornado via `/my-self`. | 🟡 Idealmente incluir `profileType` no `ResponseLoginDto` (evita round-trip). |
| BE-Q5 | **Sem endpoint de inbox de chats.** Só há chat por contexto/id. | ❗ Expor `GET /chats` (ou `/chats/me`) paginado p/ a tela "Conversas". |
| BE-Q6 | **`POST /works/{id}/pay`** só aceita `CreditCard\|Pix\|BankSlip`; a tela de pagamento de serviço oferece 4 formas. Front mapeia Débito→`CreditCard`, Dinheiro→`BankSlip`. **Follow-up front:** falta UI de resposta de garantia do fornecedor (`PATCH /works/{id}/respond-warranty`) e upload de anexos — endpoints já no `WorkService`. | ⚠️ Confirmar métodos válidos (idem BE-D3); priorizar tela de resposta de garantia. |
| BE-Q7 | **Endereço do cliente sem `latitude`/`longitude`.** A Fase C pede que o front envie coordenadas para o servidor calcular o frete por distância, mas o `openapi.json` **não tem** `latitude`/`longitude` em `UpdateAddressDto` nem em `CreateFoodOrderDto` (os únicos `lat/lng` são do GPS do entregador). Sem o campo, o frete cai na faixa base. | ❗ Adicionar `latitude`/`longitude` a `UpdateAddressDto` (e expor em `ResponseAddressDto`); confirmar se vai no endereço do perfil ou no corpo do pedido. |

## Observações

- **Verificação de conta** (`verify-account`) e **recuperação de senha** (`verify-code`) são fluxos **separados**
  (campos distintos no back; um não invalida o outro). Código = **6 dígitos**, expira em 4h; reenvio invalida o anterior.
- **`503`** no cadastro = SMS não enviado e **nada gravado** (pode repetir sem risco de `409`).
- Uploads e `food-orders`/`deliveries` exigem `Authorization` (interceptor global cobre).
- Pagamentos de delivery por cartão/Pix/boleto ficam `paymentStatus: Pending` (não passam por gateway hoje);
  só `Cash` é confirmado via `PATCH /food-orders/:id/confirm-payment`.

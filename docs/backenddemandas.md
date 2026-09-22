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
| BE-17 | Repasse/ganhos do **entregador** | ✅ **Resolvido na v3** — `GET /v1/deliveries/me/earnings` com `available`/`paid` (§8.5); front **OF-20** (carteira). Repasses do admin = **BE-Q15** (painel admin, fora deste PWA). |

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
| **BE-Q9** | **Categorias não semeadas → cadastro do fornecedor sem opções.** Auditoria (back `@ b60afd0`, `prisma/seeds/index.ts`): o seed roda apenas `seedServiceCategory` e `seedRestaurantCategory`. **Não há seed** para `ProductCategory`, `AccommodationCategory` nem `TransportationCategory`. Como esses `GET /{products\|accommodations\|transportations}/categories` filtram `isActive:true` e a tabela está vazia, o **dropdown de categoria vem vazio** e o fornecedor **não consegue cadastrar** produto (Compra e Venda / Aluguel), hospedagem nem transporte. Serviços e Delivery funcionam porque têm seed. **Front OK** (carrega e renderiza o que a API devolver). | ❗ Semear `ProductCategory`, `AccommodationCategory` e `TransportationCategory` (como já é feito para serviço/restaurante) **ou** expor um CRUD de categorias no admin. Sem isso, os 3 cadastros ficam bloqueados por falta de opção. |
| **BE-Q8** | **`POST /upload/one-file` retorna `500` no ambiente local/homolog.** Auditoria (back `@ b60afd0`): `UploadService.uploadOneFile` grava **exclusivamente no S3** (`PutObjectCommand`) — **não há fallback de disco local**, apesar da descrição da rota dizer "Armazena local/nuvem". O `example.env` **não traz** nenhuma var `AWS_*`. Sem `AWS_REGION` + `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` + `AWS_BUCKET_NAME` (ou sem rede/permissão ao bucket), o `s3Client.send(...)` estoura e o Nest devolve `500 {"message":"Internal server error"}`. **Front OK** (envia `multipart/form-data`, campo `file`, tipos png/jpg/jpeg/pdf ≤ 8 MB — dentro do contrato). Reproduzido ao salvar imagem de item de cardápio (`add-cardapio`), mas afeta **todo upload** (cardápio, serviços, produtos, hospedagem, transporte, foto de perfil). | ❗ **(a)** Configurar as `AWS_*` no `.env` de homolog/local **e** documentá-las no `example.env`; **ou (b)** implementar o fallback de **armazenamento em disco** quando as credenciais não existirem (como a descrição já promete). Enquanto não resolvido, o cadastro com imagem falha; sem imagem funciona (campo é opcional). |

## Delivery — melhorias de mercado (BE-Q10…BE-Q14) — ✅ resolvidas na v3

> Levantadas na **revisão do fluxo de delivery** (`docs/analise-fluxo-delivery.md`, benchmark iFood/Zé Delivery).
> **Reconciliação (2026-09-22):** o back **implementou** estas demandas na **v3** do contrato (`ORIENTACOESFRONT.md` v3,
> §8.9/§8.10) e o **front integrou** cada uma na fase **OF-14…OF-24**. Ficam aqui **fechadas**.
>
> ⚠️ **Fonte da confirmação = doc v3, não o clone.** O clone local do back em `ajustes-gerais` (auditado nesta sessão)
> **ainda não tem** `scheduledFor`/`couponCode`/`tip`/`/coupons/validate`/`/push/*` — está atrás do doc. Ou seja: o
> **deploy** descrito pelo doc está à frente desse branch. O front foi integrado ao **contrato do doc**; se ao testar
> contra um back antigo algum endpoint retornar 404, é sinal de que aquele ambiente ainda não subiu a v3.

| # | Demanda | Status v3 |
|---|---|---|
| **BE-Q10** | **Cupons / promoções** — `POST /coupons/validate` (prévia) + `couponCode` no `CreateFoodOrderDto`. ⚠️ o desconto da prévia **não** é aceito como entrada; o back recalcula. | ✅ **Resolvido** (doc §8.9) · front **OF-18** (`CouponService`, campo de cupom na sacola, linha de desconto). Criar cupom = só admin (`/admin-coupons`). |
| **BE-Q11** | **Agendar pedido** — `scheduledFor` (ISO, futuro) no `CreateFoodOrderDto`/`ResponseFoodOrderDto`; não muda o status. | ✅ **Resolvido** (doc §8.9) · front **OF-23** ("Agora/Agendar" na sacola, badge de agendado no restaurante). |
| **BE-Q12** | **Gorjeta ao entregador** — `tip` (0–1000) no `CreateFoodOrderDto`; vai inteira ao entregador. | ✅ **Resolvido** (doc §8.9) · front **OF-18** (chips + valor livre na sacola, total somando a gorjeta). |
| **BE-Q13** | **Push/PWA** — `GET /push/public-key`, `POST`/`DELETE /push/subscriptions` (VAPID). | ✅ **Resolvido** (doc §8.10) · front **OF-24** (`PushService` + SW; ⚠️ `publicKey` null ⇒ não pede permissão; `DELETE` no logout). |
| **BE-Q14** | **Ícones das categorias de restaurante** — semear `iconUrl` (ou subir pelo admin). | 🟡 **Parcial** (doc §8.4a) — o back mantém os ícones **por slug no app** (offline-first, decisão do doc); só categoria criada pelo admin **depois** do release precisa de `iconUrl`, e isso é responsabilidade da **tela de admin**. Front já tem fallback (AJ-cat). **Não bloqueia.** |

## Observações

- **Verificação de conta** (`verify-account`) e **recuperação de senha** (`verify-code`) são fluxos **separados**
  (campos distintos no back; um não invalida o outro). Código = **6 dígitos**, expira em 4h; reenvio invalida o anterior.
- **`503`** no cadastro = SMS não enviado e **nada gravado** (pode repetir sem risco de `409`).
- Uploads e `food-orders`/`deliveries` exigem `Authorization` (interceptor global cobre).
- Pagamentos de delivery por cartão/Pix/boleto ficam `paymentStatus: Pending` (não passam por gateway hoje);
  só `Cash` é confirmado via `PATCH /food-orders/:id/confirm-payment`.

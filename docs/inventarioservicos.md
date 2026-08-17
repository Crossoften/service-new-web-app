# Inventário — Serviços (Módulos 3/4: `/services` + `/budgets` + `/works`)

> A maior área do contrato. Telas mock **completas** já existem (cliente e fornecedor). É **integração**
> (não greenfield). Fonte da verdade: Swagger / `api-contract-ref.md`.

## Fluxo de negócio (ponta a ponta)

`Cliente busca serviço → solicita orçamento (/budgets) → fornecedor responde (valor/prazo) →
[pede mais info / acréscimo] → cliente aprova → gera Trabalho (/works) → fornecedor inicia →
cliente confirma chegada → fornecedor finaliza → cliente paga → [garantia]`

## Telas existentes

**Cliente (`features/private/servicos/`)**: `categoria-servicos`, `listagem-servicos`,
`detalhes-prestador`, `requisitos-servico`, `orcamentos`, `aprovar-orcamento`, `solicitacoes`,
`detalhes-solicitacao`, `pagamento-servico`, `chat-prestador`.

**Fornecedor (`features/fornecedor/servicos/`)**: `listagem-servicos-fornecedor`, `criar-servico`,
`orcamentos-fornecedor`, `fazer-orcamento`, `trabalhos-fornecedor`, `detalhes-trabalho`.

## Endpoints principais

- **Serviços**: `GET /services` (+ `/categories`, `/my-services`, `/{id}`), `POST/PATCH/DELETE /services`, `POST /services/{id}/reviews`.
- **Orçamentos**: `POST /budgets`, `GET /budgets` (scope Requested/Received), `GET /budgets/{id}`,
  `PATCH /budgets/{id}` (fornecedor responde), `/{id}/request-more-information`, `/{id}/request-extra`,
  `/{id}/respond-extra`, `/{id}/approve` (→ gera Work).
- **Trabalhos**: `POST /works`, `GET /works` (scope), `/my-requests`, `GET /works/{id}`,
  `/{id}/start`, `/{id}/confirm-arrival`, `/{id}/finish`, `/{id}/pay`, `/{id}/request-warranty`,
  `/{id}/respond-warranty`, `/{id}/request-extra`, `/{id}/respond-extra`, `/{id}/cancel`.

## Plano de fatias

| Fatia | Escopo | Status |
|-------|--------|--------|
| **S-1** | **Cliente — catálogo + solicitar orçamento**: `categoria-servicos` (cats reais) + `listagem-servicos` (`GET /services`) + `detalhes-prestador` (`GET /services/{id}`) + `requisitos-servico` (→ `POST /budgets`, um por prestador selecionado) | ✅ **concluído** |
| **S-2** | **Cliente — orçamentos**: `orcamentos` (`GET /budgets?scope=Requested`) + `aprovar-orcamento` (`GET /budgets/{id}` + `approve`, responder acréscimo) | ⏳ |
| **S-3** | **Fornecedor — serviços**: `listagem-servicos-fornecedor` (`/services/my-services`) + `criar-servico` (`POST /services`) | ⏳ |
| **S-4** | **Fornecedor — orçamentos**: `orcamentos-fornecedor` (`GET /budgets?scope=Received`) + `fazer-orcamento` (`PATCH /budgets/{id}` responder; more-info; extra) | ⏳ |
| **S-5** | **Trabalhos** (cliente `solicitacoes`/`detalhes-solicitacao` + fornecedor `trabalhos-fornecedor`/`detalhes-trabalho`): start/confirm-arrival/finish/pay/warranty/cancel + `WorkService` | ⏳ |

## Notas / limitações da S-1

- **Anexos** no orçamento (`requisitos-servico`) ainda não sobem de verdade (mock) — o `POST /budgets`
  envia só a descrição por ora. Upload real (`POST /upload/one-file` → `files[]`) fica para fatia posterior.
- A descrição inclui o "tipo" escolhido como prefixo (`[Urgente] …`) já que o contrato de `/budgets`
  não tem campo de urgência.
- `categoria-servicos` passou a navegar por **categoryId** (antes usava o label).

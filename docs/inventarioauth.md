# Inventário Detalhado — Módulo 1: Auth

> Etapas 1–7 do fluxo de auditoria aplicadas ao módulo de autenticação: entender → mapear telas →
> mapear endpoints → comparar Front × API → classificar divergências. **Sem código** — base para os patches.
> Decisões do blueprint já incorporadas (login por email; parceiro → `Influencer`; assinatura p/ fornecedor).

---

## 1. Objetivo e jornada

Autenticar e cadastrar usuários dos 4 perfis do app, roteando cada um para sua experiência pelo `profileType`
retornado no login. É **pré-requisito de todos os demais módulos** (sem sessão, guards e chamadas autenticadas não funcionam).

```
Splash → Login ──(ok)──> roteia por profileType
  │                         Client     → /home
  │                         Supplier   → /fornecedor/home
  │                         Delivery   → /entregador/home   ✅ rota existe (origin)
  │                         Influencer → /parceiro/home
  ├─ Esqueci a senha → [Solicitar código] → [Redefinir senha]        ⚠️ telas inexistentes
  └─ Cadastre-se → Selecionar Perfil → Cadastro (varia por perfil) → Sucesso → Login
```

---

## 2. Telas atuais (4)

| # | Rota | Componente | Campos | Botões → ação atual |
|---|---|---|---|---|
| T1 | `/login` | `LoginComponent` | **telefone**, senha (olho) | ENTRAR → mock role por telefone + `localStorage('role')`; CADASTRE-SE → `/selecionar-perfil`; Esqueci senha → *vazio* |
| T2 | `/selecionar-perfil` | `SelecionarPerfilComponent` | radio: cliente/fornecedor/parceiro/entregador | CONTINUAR → `/cadastro/:perfil` |
| T3 | `/cadastro/:perfil` | `CadastroComponent` | multi-step (ver §3) | CONTINUAR (avança steps); no fim → `/cadastro/sucesso` |
| T4 | `/cadastro/sucesso` | `CadastroSucessoComponent` | — | IR PARA O LOGIN → `/login` |

### 2.1 Estado atual (mock) que será substituído
- `login.ts`: `rolesMock` (telefone→role fixo) + `localStorage.setItem('role', …)`; sem API, sem token.
- `esqueceuSenha()` vazio (`// implementar depois`).
- `authGuard` = `return true` (Fase 0 já reescreveu para checar sessão; **falta aplicar às rotas**).

---

## 3. Cadastro (T3) — steps atuais × alvo

| Step atual | Campos atuais | Situação vs API |
|---|---|---|
| 1 — Dados | nome, **telefone**, código, termos; (parceiro: + redes sociais) | 🔴 **falta `email`** (obrigatório no `RegisterBaseDto`) |
| 2 — SMS | 4 dígitos | 🔴 **remover no web** (Swagger: verify-code é "somente mobile") |
| 3 — Senha | senha, confirmarSenha (olho) | ✅ `password` + `confirmPassword` |
| 4 — Planos (fornecedor) | planos hardcoded (mensal/tri/anual) | 🟠 vem de `GET /v1/plans/active` |
| 5 — Pagamento | — | — |
| 6 — Cartão (fornecedor) | nomeCartão, número, validade, ccv | 🟠 vira `POST /v1/subscriptions` |

**Fluxo-alvo do cadastro (por perfil):**
- **Cliente / Entregador / Parceiro:** Dados(+email) → Senha → **Sucesso**.
- **Fornecedor:** Dados(+email) → Senha → **[login automático]** → Planos (`/plans/active`) → Cartão → `POST /subscriptions` → **Sucesso**.

---

## 4. Endpoints da API para o módulo Auth

| Ação | Método + rota | Auth | Request DTO | Response DTO |
|---|---|---|---|---|
| Login | `POST /v1/login` | — | `LoginUserDto` `{ email, password }` | `ResponseLoginDto` `{ token, id, role, profileType, adminPermissions }` |
| Cadastro cliente | `POST /v1/no-auth/register/client` | — | `RegisterBaseDto` | `RegisterUserResponseDto` |
| Cadastro fornecedor | `POST /v1/no-auth/register/supplier` | — | `RegisterBaseDto` | `RegisterUserResponseDto` |
| Cadastro parceiro | `POST /v1/no-auth/register/influencer` ¹ | — | `RegisterInfluencerDto` | `RegisterUserResponseDto` |
| Cadastro entregador | `POST /v1/no-auth/register/delivery` | — | `RegisterBaseDto` | `RegisterUserResponseDto` |
| Esqueci senha (envia código ao email) | `POST /v1/no-auth/forgot` | — | `ForgotDto` `{ email }` | `ImessageEntity` |
| Redefinir senha | `POST /v1/no-auth/reset` | — | `ResetPasswordDto` `{ code, password, confirmPassword }` | `ImessageEntity` |
| (mobile) Verificar código | `POST /v1/no-auth/verify-code` | — | `VerifyCodeDto` | `ImessageEntity` | *não usado no web* |
| Planos ativos | `GET /v1/plans/active` | — | — | `ResponseFindAllPlansDto` |
| Criar assinatura | `POST /v1/subscriptions` | 🔒 Bearer | `CreateSubscriptionDto` | `CreateSubscriptionResponseDto` |
| Dados do usuário logado | `GET /v1/my-self` | 🔒 Bearer | — | `ResponseAllUserDto` |
| Textos (Termos/Políticas) | `GET /v1/no-auth/texts?type=Terms` | — | — | `ResponseTextDto` |

¹ **Decisão D2:** "parceiro" → `Influencer`. (`register/partner` existe, mas fica de fora — BE-11.)

### 4.1 Campos-chave dos DTOs de request
- **`RegisterBaseDto`** (obrigatórios): `name`, `email`, `password`, `confirmPassword`, `acceptedTerms`. Opcionais: `phone`, `socialMedias[]`, `birthDate`, `inviteCode`, `referralCode`.
- **`RegisterInfluencerDto`**: igual ao base + `referralCode` (gerado se omitido).
- **`CreateSubscriptionDto`** (obrigatórios): `planId`, `method` (`CreditCard|Pix|BankSlip`). Cartão: `holderName`, `cardBrand`, `cardNumber` + endereço de cobrança (opcionais).

---

## 5. Matriz de Cobertura — Auth

| Tela / Ação | Endpoint | Status | Observação |
|---|---|---|---|
| Login | `POST /login` | 🟠 **Parcial** | FE usa telefone; API usa **email** (BE-12) |
| Selecionar perfil | — | ✅ | Mapeia p/ `register/*`; parceiro→`influencer` |
| Cadastro cliente | `register/client` | 🟠 **Parcial** | falta `email`; remover SMS |
| Cadastro entregador | `register/delivery` | 🟠 **Parcial** | idem; + rota de destino inexistente |
| Cadastro parceiro | `register/influencer` | 🟠 **Parcial** | idem; usar `RegisterInfluencerDto` |
| Cadastro fornecedor | `register/supplier` (+ `plans/active` + `subscriptions`) | 🟠 **Parcial** | remover SMS; planos/assinatura reais; sequência register→login→subscribe |
| Esqueci a senha | `forgot` + `reset` | 🔴 **Não integrado** | telas inexistentes |
| Sucesso | — | ✅ | ok |

---

## 6. Divergências classificadas

| # | Divergência | Categoria | Ação |
|---|---|---|---|
| A1 | Login por **telefone** × API por **email** | Negócio + Front | migrar FE p/ email (D confirmada); se cliente exigir telefone → BE-12 |
| A2 | **Etapa de SMS** no cadastro sem contrato web | Front | remover step 2 no web |
| A3 | **`email` não coletado** no cadastro | Front | adicionar campo (obrigatório na API) |
| A4 | **Role mockada** por telefone + `localStorage('role')` | Front | usar `profileType` do login + `SessionService` |
| A5 | **Planos hardcoded** | Front | consumir `GET /plans/active` |
| A6 | **Cartão** não persiste | Front | `POST /subscriptions` (fornecedor) |
| A7 | **Esqueci a senha** não implementado | Front | criar telas `forgot`/`reset` |
| A8 | `authGuard` não aplicado às rotas | Front | aplicar `authGuard`/`profileGuard` |
| A9 | ~~Entregador sem rota de destino~~ → **resolvido**: `/entregador/home` já existe no `origin` | Front | `Delivery` → `/entregador/home` |
| A10 | Autorização por `profileType` não garantida no back | Back-end | BE-14 |
| A11 | `ResetPasswordDto.password` `maxLength: 8` | Back-end | BE-13 |

---

## 7. Telas novas necessárias

| Nova tela | Rota sugerida | Conteúdo | Endpoint |
|---|---|---|---|
| Esqueci a senha | `/esqueci-senha` | email → enviar | `POST /no-auth/forgot` |
| Redefinir senha | `/redefinir-senha` | código + nova senha + confirmar | `POST /no-auth/reset` |

*(Ambas reutilizam o layout/UX das telas de auth existentes — sem nova arquitetura.)*

---

## 8. Roteamento pós-login por `profileType`

| `profileType` | Rota destino | Status da rota |
|---|---|---|
| `Client` | `/home` | ✅ existe |
| `Supplier` | `/fornecedor/home` | ✅ existe (hub do fornecedor) |
| `Delivery` | `/entregador/home` | ✅ **existe** (módulo Entregador no origin) |
| `Influencer` | `/parceiro/home` | ✅ existe |

---

## 9. Melhorias de UX (separadas das correções)

- Termos de uso **clicáveis** carregando `GET /no-auth/texts?type=Terms|Policies` (hoje é só checkbox).
- Feedback de **loading**/erro real nas chamadas (spinner no ENTRAR/CONTINUAR; usar `ApiError` do interceptor).
- Validação de **email** e de **força de senha** no cadastro.
- Mensagem clara quando login falha (401 → "email ou senha inválidos").
- Persistir perfil selecionado ao voltar entre steps.

---

## 10. Plano de implementação (o que os patches farão)

**Novos arquivos**
- `core/models/auth.ts` — `LoginUserDto`, `ResponseLoginDto`, `RegisterBaseDto`, `RegisterInfluencerDto`, `ForgotDto`, `ResetPasswordDto`, responses.
- `core/services/auth.ts` — **preencher** o service hoje vazio: `login()`, `register(perfil, dto)`, `forgot()`, `reset()`, `logout()`, integração com `SessionService`.
- `core/models/plan.ts` + `subscription.ts` e métodos em um `SubscriptionService` (ou no AuthService) para `plans/active` + `subscriptions`.
- Telas `esqueci-senha` e `redefinir-senha` (componentes + rotas).

**Arquivos alterados**
- `features/auth/login/*` — email no lugar de telefone; ENTRAR chama `AuthService.login()`; erro real; link → `/esqueci-senha`.
- `features/auth/cadastro/*` — adicionar `email`; remover step SMS; planos via API; cartão → subscription; sequência fornecedor.
- `features/auth/selecionar-perfil/*` — manter; mapear parceiro→`influencer` no envio.
- `app.routes.ts` — novas rotas de recuperação; aplicar `authGuard`/`profileGuard` nas áreas privadas; (destino entregador — A9).

**Dependências / pré-condições**
- `SessionService`, interceptors e guards da **Fase 0** (já entregues).
- **BE-12** (confirmar email como identificador) — decisão de negócio já tomada; só registrar caso o cliente reabra.
- **A9** (destino do entregador) — decisão de rota provisória vs criar `/entregador/home`.

---

## 11. Pendências que bloqueiam/condicionam os patches

| Item | Precisa de | Sugestão |
|---|---|---|
| ~~A9 — destino do Entregador~~ | **resolvido** | `/entregador/home` já existe no origin; `Delivery` roteia direto para lá |
| Sequência fornecedor (register→login→subscribe) | confirmação | auto-login após registro para obter token e criar a assinatura |
| Termos clicáveis | é melhoria (não bloqueia) | incluir como enhancement opcional |

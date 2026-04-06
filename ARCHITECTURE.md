# Bulkio — Architecture & Engineering Standards
# Single Source of Truth (SSoT)
# Status: ATIVO | Última revisão: 2026-04-06

---

## 1. Visão Geral da Aplicação

### Propósito
Bulkio é uma aplicação web de gerenciamento de treinos de musculação. Permite que usuários criem fichas de treino, registrem sessões de treino com séries/repetições/carga, acompanhem peso corporal, visualizem recordes pessoais e analisem progressão via dashboard.

### Domínio de Negócio
- Gestão de exercícios (catálogo pré-definido com 221 exercícios em pt-BR)
- Fichas de treino (criação, duplicação, arquivamento)
- Registro de treinos (log de séries, reps, carga, notas)
- Rastreamento de peso corporal
- Recordes pessoais (PRs automáticos)
- Dashboard com analytics (streak, volume, distribuição muscular, progressão)

### Objetivos Não-Funcionais (NFRs)
| NFR | Meta | Status |
|-----|------|--------|
| Performance | Respostas API < 200ms para operações comuns | Ativo |
| Segurança | JWT + refresh token rotativo, rate limiting, helmet | Ativo |
| Maintainability | Camadas separadas (controller→service→repository), testes unitários | Ativo |
| Custo | Zero custo de infra em dev (SQLite local) | Ativo |
| Escalabilidade | NÃO é prioridade — app single-tenant, monólito adequado | Ativo |

---

## 2. Princípios Arquiteturais

### Princípios Obrigatórios
1. **Layered Architecture** — controller → service → repository. Dependências DEVEM fluir nessa direção. NUNCA controller acessando repository diretamente.
2. **Single Responsibility** — cada camada tem responsabilidade clara (ver seção 5).
3. **Fail-fast validation** — validação de entrada via Zod DEVE ocorrer no middleware, ANTES de chegar ao controller.
4. **Ownership checks** — todo recurso pertencente a um usuário DEVE ser validado via `assertOwnership` no service antes de qualquer mutação.
5. **Error hierarchy** — erros operacionais DEVEM usar as classes de `utils/errors.ts`. Erros inesperados são capturados pelo `errorHandler`.

### Princípios Explicitamente Rejeitados
- **Microservices** — complexidade desnecessária para este escopo. NÃO DEVE ser adotado.
- **CQRS/Event Sourcing** — overhead sem benefício para esta aplicação. NÃO DEVE ser adotado.
- **DDD completo** — Bounded Contexts e Aggregates formais são excess de engenharia aqui. NÃO DEVE ser adotado.
- **ORM switching** — Prisma é a escolha fixa. NÃO DEVE ser abstraído com interfaces genéricas de persistência.

### Critérios para Exceções
- Qualquer desvio dos princípios acima EXIGE APROVAÇÃO explícita do usuário com justificativa documentada.

---

## 3. Decisões Arquiteturais (ADRs)

### ADR-001: SQLite como banco de dados
- **Contexto**: App de uso pessoal/pequena escala, sem necessidade de concorrência pesada.
- **Decisão**: SQLite via Prisma.
- **Motivo**: Zero config, zero custo, backup trivial (um arquivo), performance excelente para single-user.
- **Alternativas**: PostgreSQL (descartado — overhead de infra desnecessário), MySQL (idem).
- **Consequências (+)**: Setup instantâneo, sem dependência externa.
- **Consequências (-)**: `mode: 'insensitive'` não suportado nativamente no Prisma/SQLite (contornado via cast). Sem suporte a full-text search avançado.
- **Status**: Ativa.

### ADR-002: JWT com Refresh Token Rotativo
- **Contexto**: Necessidade de autenticação stateless com segurança adequada.
- **Decisão**: Access token (15min, em memória) + Refresh token (7d, httpOnly cookie, hash SHA-256 no DB, rotativo).
- **Motivo**: Refresh tokens armazenados como hash possibilitam revogação. Rotação previne replay attacks.
- **Alternativas**: Sessions server-side (descartado — mais estado no servidor), OAuth/OIDC (overengineering).
- **Consequências (+)**: Seguro, stateless para access token, revogação possível.
- **Consequências (-)**: Complexidade do fluxo de refresh no frontend (interceptor Axios com mutex).
- **Status**: Ativa.

### ADR-003: Monólito com Frontend separado
- **Contexto**: App de escopo pequeno, equipe de um desenvolvedor.
- **Decisão**: Backend Express monolítico + Frontend React SPA, no mesmo repositório (monorepo simples).
- **Motivo**: Simplicidade máxima, deploy independente possível via Docker Compose.
- **Alternativas**: Next.js fullstack (descartado — acoplamento frontend/backend indesejado), microsserviços (overengineering).
- **Status**: Ativa.

### ADR-004: Tailwind CSS v4 com design system via CSS custom properties
- **Contexto**: Necessidade de tema consistente e dark mode.
- **Decisão**: Tailwind CSS v4 com `@theme` block definindo todas as cores como custom properties em `index.css`.
- **Motivo**: Sem config files separados, tudo em CSS nativo, permite temas via override de variáveis.
- **Alternativas**: CSS Modules (mais verboso), styled-components (dependência extra).
- **Status**: Ativa.

### ADR-005: asyncHandler para controllers
- **Contexto**: Try/catch repetido em ~20 handlers.
- **Decisão**: Utility `asyncHandler` que envolve handlers async e delega erros para `next()`.
- **Motivo**: Elimina boilerplate, garante que erros sempre fluam para o errorHandler.
- **Status**: Ativa.

### ADR-006: Zustand para estado global
- **Contexto**: Necessidade de gerenciar estado de autenticação e preferências no frontend.
- **Decisão**: Zustand com middleware `persist` (localStorage) para auth state e theme state.
- **Motivo**: API minimalista, sem boilerplate de Redux, boa integração com React.
- **Alternativas**: Redux Toolkit (verboso demais), Context API (limitado para estado complexo).
- **Status**: Ativa.

### ADR-007: Light/Dark Mode via CSS class toggle
- **Contexto**: Necessidade de oferecer light mode estético com paleta quente (lavender), sem branco desconfortável.
- **Decisão**: `@theme` block define light mode como default. Classe `.dark` no `<html>` ativa dark mode via override de CSS custom properties. Preferência persistida via Zustand store (`themeStore`) com localStorage. Default: dark.
- **Motivo**: Aproveita ADR-004 (CSS custom properties). Sem dependência nova. Toggle via classe permite transição CSS nativa.
- **Alternativas**: `prefers-color-scheme` media query (descartado — sem controle manual do usuário), data-attribute (equivalente, mas class é mais idiomático com Tailwind).
- **Consequências (+)**: Todos os componentes se adaptam automaticamente via variáveis CSS. Charts usam hook `useChartColors()` para cores dinâmicas.
- **Consequências (-)**: Recharts não suporta CSS vars nativamente, necessitando hook JS para cores.
- **Status**: Ativa.

---

## 4. Estilo Arquitetural e Estrutura do Sistema

### Tipo: Monólito em Camadas (Layered Monolith)

### Diagrama Lógico
```
[Browser/SPA]
     │
     ▼ HTTP (JSON)
[Express App]
     │
     ├── Middlewares (helmet, cors, rateLimit, cookieParser, requestLogger)
     │
     ├── Routes (auth, exercises, workouts, workout-logs, body-weight, dashboard)
     │     │
     │     ├── validate/validateQuery (Zod)
     │     ├── authenticate (JWT)
     │     │
     │     └── Controllers (orquestração HTTP: req → service → res)
     │           │
     │           └── Services (lógica de negócio, ownership, PRs)
     │                 │
     │                 └── Repositories (acesso a dados via Prisma)
     │                       │
     │                       └── [SQLite]
     │
     └── errorHandler (último middleware — captura todos os erros)
```

### Regras de Acoplamento
- Controllers NÃO DEVEM importar repositories — DEVE passar pelo service.
- Services NÃO DEVEM acessar `req`/`res` — recebem dados primitivos/DTOs.
- Repositories NÃO DEVEM conter lógica de negócio — apenas queries Prisma.
- Frontend services NÃO DEVEM conter lógica de UI — apenas chamadas HTTP.
- Components NÃO DEVEM chamar API diretamente — DEVE usar services.

### Bounded Contexts (simplificados)
| Contexto | Entidades | Service |
|----------|-----------|---------|
| Auth | User, RefreshToken | authService |
| Exercises | Exercise | exerciseService |
| Training Plans | WorkoutPlan, WorkoutPlanExercise | workoutPlanService |
| Training Logs | WorkoutLog, WorkoutLogExercise, WorkoutLogSet, PersonalRecord | workoutLogService |
| Body Tracking | BodyWeight | bodyWeightService |
| Analytics | (lê de várias entidades) | dashboardService |

---

## 5. Padrões de Engenharia

### Padrões Obrigatórios
| Padrão | Onde | Propósito |
|--------|------|-----------|
| Repository | `repositories/*.ts` | Encapsular queries Prisma; interface única de acesso a dados |
| Service Layer | `services/*.ts` | Encapsular lógica de negócio e orquestração |
| asyncHandler | `utils/asyncHandler.ts` | Eliminar try/catch boilerplate em controllers |
| assertOwnership | `services/*.ts` (funções privadas) | Validar que recurso pertence ao usuário autenticado |
| Zod validation middleware | `middlewares/errorHandler.ts` (`validate`, `validateQuery`) | Validar input antes de chegar ao controller |
| Error classes hierarchy | `utils/errors.ts` | Erros tipados com status HTTP correspondente |
| Factory helpers (tests) | `tests/helpers.ts` | Criar mocks consistentes para testes unitários |

### Padrões Proibidos/Desencorajados
- **God classes/files** — NÃO DEVE criar arquivos com mais de ~300 linhas. Extrair para componentes/módulos separados.
- **Dynamic imports** — NÃO DEVE usar `await import(...)` para resolver circular dependencies. Reorganizar módulos.
- **`any` types** — NÃO DEVE usar `any` exceto quando estritamente necessário para contornar limitações de tipos de terceiros (ex: Prisma query results em testes). DEVE documentar com comentário.
- **Inline complex dialogs** — Dialogs de formulário complexos DEVEM ser extraídos como componentes separados em `components/*/`.

### Convenções de Código
| Aspecto | Regra |
|---------|-------|
| Linguagem do código | Inglês (nomes de variáveis, funções, classes, interfaces) |
| Linguagem da UI | Português brasileiro (labels, mensagens, placeholders) |
| Commits | Inglês, formato Conventional Commits (`feat:`, `fix:`, `refactor:`, etc.) |
| Indentação | 3 espaços (backend), configuração padrão do Vite (frontend) |
| Strings | Single quotes no TypeScript |
| Trailing commas | Sim |
| Semicolons | Sim |
| Naming | camelCase para variáveis/funções, PascalCase para tipos/interfaces/componentes React |
| Exports | Named exports para componentes e utilities. Default exports para pages |
| Type annotations | Interfaces para DTOs/contratos, `type` para unions e intersections |

### Organização de Pastas

#### Backend (`backend/src/`)
```
config/         # Configuração (env vars, database client, logger)
controllers/    # Handlers HTTP (usa asyncHandler, delega para services)
middlewares/    # auth, errorHandler, requestLogger
models/         # schemas.ts (Zod), types.ts (interfaces/helpers de resposta)
repositories/   # Acesso a dados (Prisma queries)
routes/         # Express routers com middleware chains
services/       # Lógica de negócio
tests/          # Testes unitários (espelho da estrutura src/)
  controllers/
  middlewares/
  schemas/
  services/
  utils/
  helpers.ts    # Factories e mocks compartilhados
  setup.ts      # Setup global de testes
utils/          # Utilities (errors.ts, asyncHandler.ts)
app.ts          # Express app configuration
server.ts       # Server entry point
```

#### Frontend (`frontend/src/`)
```
components/     # Componentes React reutilizáveis
  exercises/    # ExerciseDetailModal, ExerciseSearchDropdown
  layout/       # AppLayout, Sidebar, ProtectedRoute
  ui/           # Design system primitives (Button, Input, Card, Dialog, etc.)
  workoutLogs/  # LogWorkoutDialog
  workoutPlans/ # CreateWorkoutPlanDialog
lib/            # Utilities compartilhados
  api.ts        # Axios instance com interceptors
  exerciseLabels.ts  # Mapeamento de enums para labels pt-BR
  useChartColors.ts  # Hook para cores de gráficos (theme-aware)
  utils.ts      # cn() helper (clsx + tailwind-merge)
pages/          # Page components (um por rota)
services/       # API service modules (um por recurso)
stores/         # Zustand stores (authStore, themeStore)
App.tsx         # Router setup
main.tsx        # Entry point
index.css       # Theme (custom properties via @theme)
```

---

## 6. Tecnologias e Stack

### Backend
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Node.js | 18+ | Runtime |
| TypeScript | ^5.6 | Linguagem |
| Express | ^4.21 | Framework HTTP |
| Prisma | ^5.22 | ORM |
| SQLite | - | Banco de dados (via Prisma) |
| Zod | ^3.23 | Validação de schemas |
| bcrypt | ^5.1 | Hash de senhas |
| jsonwebtoken | ^9.0 | JWT |
| pino | ^9.4 | Logging estruturado |
| helmet | ^8.0 | Security headers |
| express-rate-limit | ^7.4 | Rate limiting |
| cookie-parser | ^1.4 | Parse de cookies (refresh token) |
| Vitest | ^2.1 | Test runner |

### Frontend
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| React | ^19.2 | UI library |
| TypeScript | ~5.9 | Linguagem |
| Vite | ^8.0 | Build tool / dev server |
| Tailwind CSS | ^4.2 | Styling |
| Zustand | ^5.0 | Estado global |
| Axios | ^1.14 | HTTP client |
| React Router | ^6.30 | Routing |
| Recharts | ^3.8 | Gráficos |
| date-fns | ^4.1 | Formatação de datas |
| lucide-react | ^1.7 | Ícones |
| React Hook Form | ^7.72 | Formulários |
| Zod | ^4.3 | Validação frontend |

### Bibliotecas Proibidas
- **Redux/MobX** — Zustand é o state manager escolhido. NÃO DEVE adicionar outros.
- **Styled-components/Emotion** — Tailwind CSS é o framework de estilo. NÃO DEVE adicionar CSS-in-JS.
- **Moment.js** — date-fns é a escolha. NÃO DEVE usar moment.
- **Lodash** — DEVE usar métodos nativos do JS. NÃO DEVE adicionar lodash.

### Ferramentas de Dev
| Ferramenta | Propósito |
|------------|-----------|
| tsx | Dev server backend (watch mode) |
| concurrently | Executar backend + frontend simultaneamente |
| ESLint | Linting |
| Prisma Studio | UI de gestão do banco (`npm run db:studio`) |

---

## 7. Padrões de Qualidade

### Testes
| Tipo | Obrigatório | Responsabilidade | Runner |
|------|-------------|------------------|--------|
| Unitário (services) | SIM | Lógica de negócio, ownership, validações | Vitest |
| Unitário (controllers) | SIM | Mapeamento HTTP correto, status codes, resposta | Vitest |
| Unitário (middlewares) | SIM | Auth, error handling, validation | Vitest |
| Unitário (schemas) | SIM | Validação Zod correta para inputs válidos e inválidos | Vitest |
| Integração | NÃO (pode ser adicionado) | Fluxo end-to-end com DB real | - |
| E2E | NÃO (pode ser adicionado) | Fluxos de usuário completos | - |

- Cobertura mínima configurada: **80%** (statements, branches, functions, lines).
- Testes DEVEM usar factories de `tests/helpers.ts` para criar mocks.
- Testes DEVEM rodar sem banco de dados real (mocks via `vi.mock`).
- Testes DEVEM ser executados com `npm run test:backend` ANTES de cada commit na branch `release`.

### Observabilidade
| Aspecto | Implementação |
|---------|---------------|
| Logging | pino (JSON em produção, pretty em dev) |
| Request logging | Middleware `requestLogger` (método, URL, status, duração) |
| Error logging | `errorHandler` loga erros inesperados via `logger.error` |
| Métricas | NÃO implementado. PODE ser adicionado. |
| Tracing | NÃO implementado. PODE ser adicionado. |

### Tratamento de Erros

#### Hierarquia de Erros (`utils/errors.ts`)
```
AppError (base — statusCode, isOperational)
├── NotFoundError      (404)
├── UnauthorizedError  (401)
├── ForbiddenError     (403)
├── ConflictError      (409)
└── ValidationError    (400)
```

#### Fluxo de erros
1. Zod validation error → `errorHandler` converte em 400 com array de `FieldError[]`.
2. `AppError` subclass → `errorHandler` retorna `statusCode` correspondente.
3. Erro inesperado → `errorHandler` loga via pino e retorna 500 genérico.
4. Unhandled rejection / uncaught exception → `server.ts` loga e encerra processo.

#### Resposta de erro padrão
```json
{ "success": false, "data": null, "message": "Error message", "errors": [{"field": "email", "message": "Invalid"}] }
```

### Formato de Resposta API padrão
```typescript
interface ApiResponse<T> {
   success: boolean;
   data: T;
   message?: string;
   errors?: FieldError[];       // apenas em erros de validação
   pagination?: PaginationMeta; // apenas em listagens
}
```

---

## 8. Segurança e Compliance

### Autenticação e Autorização
| Aspecto | Implementação |
|---------|---------------|
| Hash de senha | bcrypt com salt rounds = 12 |
| Access token | JWT assinado com HS256, expira em 15 minutos |
| Refresh token | JWT assinado com segredo separado, 7 dias, httpOnly/secure/strict cookie |
| Refresh token storage | SHA-256 hash salvo no DB (tabela `RefreshToken`) |
| Rotação | A cada refresh, token antigo é deletado e novo é criado |
| Revogação | Delete do hash no DB. Logout deleta o token do usuário |
| Autorização | Ownership-based: cada recurso DEVE ser verificado contra `userId` |

### Práticas Obrigatórias de Segurança
1. DEVE usar `helmet()` para security headers.
2. DEVE usar rate limiting global (100 req/15min) e rate limiting específico para auth (10 req/15min).
3. NÃO DEVE expor refresh token no body da resposta JSON — DEVE ser apenas cookie httpOnly.
4. NÃO DEVE armazenar senhas em texto claro — DEVE usar bcrypt.
5. NÃO DEVE commitar `.env`, secrets ou API keys — DEVE estar no `.gitignore`.
6. DEVE validar TODOS os inputs via Zod antes de processar.
7. DEVE usar `onDelete: Cascade` em relações do Prisma para evitar registros órfãos.
8. Access token NÃO DEVE ser persistido em localStorage — DEVE ficar apenas em memória (Zustand sem persist para token).
9. CORS DEVE ser restrito a `config.corsOrigin`.
10. Body size DEVE ser limitado (`express.json({ limit: '1mb' })`).

### Proteção de Dados
- Dados do usuário são isolados por `userId` em TODAS as queries.
- NÃO existe endpoint público que exponha dados de outros usuários.
- Prisma queries DEVEM sempre incluir filtro `userId` para recursos do usuário.

---

## 9. Regras para Evolução da Arquitetura

### Pode ser feito automaticamente (sem aprovação)
- Adicionar novo endpoint seguindo os padrões existentes (controller → service → repository).
- Adicionar novos testes unitários.
- Remover dead code confirmado como não utilizado.
- Refatorar para melhorar legibilidade sem alterar comportamento.
- Adicionar validação Zod a inputs existentes.
- Corrigir bugs sem mudar a API pública.
- Atualizar dependências de patch/minor sem breaking changes.

### EXIGE novo ADR (documentar neste arquivo)
- Adicionar nova dependência significativa (ORM, framework, state manager).
- Mudar banco de dados.
- Alterar fluxo de autenticação.
- Alterar formato de resposta da API.
- Adicionar novo tipo de teste (e2e, integração).
- Mudar de monólito para outra arquitetura.

### EXIGE APROVAÇÃO humana explícita
- Qualquer mudança em tabelas existentes do Prisma schema que possa causar perda de dados.
- Remover endpoints existentes da API.
- Mudar tecnologia core (React, Express, Prisma, Tailwind).
- Deploy para produção (merge `release` → `main`).
- Adicionar serviços externos (APIs de terceiros, cloud services).
- Qualquer ação que afete dados de produção.

---

## 10. Instruções Obrigatórias para Agentes de IA

### Antes de qualquer ação
1. DEVE ler e compreender este documento por completo.
2. DEVE consultar `/memories/repo/git-workflow.md` para regras de git/commit.
3. DEVE verificar se a ação solicitada é permitida pela seção 9.

### Em caso de conflito
- Se uma ação solicitada violar qualquer regra deste documento:
  - a IA NÃO DEVE executar.
  - DEVE explicar o conflito.
  - DEVE sugerir alternativas alinhadas com este documento.

### Em caso de ambiguidade
- Assumir a opção mais conservadora.
- Solicitar confirmação humana antes de prosseguir.

### Proibições absolutas
- NUNCA inventar padrões ou decisões não documentadas aqui.
- NUNCA adicionar dependências que estão na lista de proibidas (seção 6).
- NUNCA criar código que acesse repositórios diretamente do controller.
- NUNCA criar endpoints sem validação Zod.
- NUNCA persistir access token em localStorage.
- NUNCA commitar secrets ou arquivos `.env`.
- NUNCA usar `any` sem documentar o motivo em comentário.
- NUNCA criar arquivos markdown para documentar mudanças a menos que explicitamente solicitado.

### Ao gerar código
- DEVE seguir as convenções de naming (seção 5).
- DEVE seguir a estrutura de pastas (seção 5).
- DEVE incluir testes para lógica nova no service layer.
- DEVE usar `asyncHandler` em novos controllers.
- DEVE usar `assertOwnership` pattern para recursos do usuário.
- DEVE usar as classes de erro existentes (`NotFoundError`, `ForbiddenError`, etc.).
- DEVE usar o formato de resposta padrão (`createResponse`, `createPaginatedResponse`, `createErrorResponse`).
- Commits DEVEM ser em inglês com Conventional Commits.

---

## Apêndice: API Routes Reference

| Method | Path | Auth | Validation | Controller |
|--------|------|------|------------|------------|
| POST | /api/v1/auth/register | No (rate limited) | registerSchema | authController.register |
| POST | /api/v1/auth/login | No (rate limited) | loginSchema | authController.login |
| POST | /api/v1/auth/refresh | No (rate limited) | - | authController.refresh |
| POST | /api/v1/auth/logout | No | - | authController.logout |
| GET | /api/v1/auth/profile | JWT | - | authController.getProfile |
| PATCH | /api/v1/auth/profile | JWT | updateProfileSchema | authController.updateProfile |
| GET | /api/v1/exercises | JWT | exerciseQuerySchema | exerciseController.findAll |
| GET | /api/v1/exercises/muscle-groups | JWT | - | exerciseController.getMuscleGroups |
| GET | /api/v1/exercises/:id | JWT | - | exerciseController.findById |
| GET | /api/v1/workouts | JWT | workoutPlanQuerySchema | workoutPlanController.findAll |
| GET | /api/v1/workouts/:id | JWT | - | workoutPlanController.findById |
| POST | /api/v1/workouts | JWT | createWorkoutPlanSchema | workoutPlanController.create |
| PATCH | /api/v1/workouts/:id | JWT | updateWorkoutPlanSchema | workoutPlanController.update |
| POST | /api/v1/workouts/:id/duplicate | JWT | - | workoutPlanController.duplicate |
| DELETE | /api/v1/workouts/:id | JWT | - | workoutPlanController.archive |
| GET | /api/v1/workout-logs | JWT | workoutLogQuerySchema | workoutLogController.findAll |
| GET | /api/v1/workout-logs/:id | JWT | - | workoutLogController.findById |
| POST | /api/v1/workout-logs | JWT | createWorkoutLogSchema | workoutLogController.create |
| PATCH | /api/v1/workout-logs/:id | JWT | updateWorkoutLogSchema | workoutLogController.update |
| DELETE | /api/v1/workout-logs/:id | JWT | - | workoutLogController.delete |
| GET | /api/v1/body-weight | JWT | paginationSchema | bodyWeightController.findAll |
| POST | /api/v1/body-weight | JWT | createBodyWeightSchema | bodyWeightController.create |
| DELETE | /api/v1/body-weight/:id | JWT | - | bodyWeightController.delete |
| GET | /api/v1/dashboard/stats | JWT | - | dashboardController.getStats |
| GET | /api/v1/dashboard/exercise-progression/:exerciseId | JWT | - | dashboardController.getExerciseProgression |
| GET | /api/health | No | - | Inline handler |

## Apêndice: Database Schema Summary

| Model | Key Fields | Relations |
|-------|------------|-----------|
| User | id, email (unique), username (unique), password, goal | → WorkoutPlan[], WorkoutLog[], BodyWeight[], PersonalRecord[], RefreshToken[] |
| Exercise | id, name (unique), muscleGroup, type, equipment, videoUrl | → WorkoutPlanExercise[], WorkoutLogExercise[], PersonalRecord[] |
| WorkoutPlan | id, name, userId, isArchived | → User, WorkoutPlanExercise[], WorkoutLog[] |
| WorkoutPlanExercise | id, workoutPlanId, exerciseId, sets, reps, restSeconds, order | → WorkoutPlan, Exercise |
| WorkoutLog | id, userId, workoutPlanId?, date, isComplete | → User, WorkoutPlan?, WorkoutLogExercise[] |
| WorkoutLogExercise | id, workoutLogId, exerciseId, order | → WorkoutLog, Exercise, WorkoutLogSet[] |
| WorkoutLogSet | id, workoutLogExerciseId, setNumber, reps, weight | → WorkoutLogExercise |
| BodyWeight | id, userId, weight, date | → User |
| PersonalRecord | id, userId, exerciseId, weight, reps  (unique: userId+exerciseId) | → User, Exercise |
| RefreshToken | id, tokenHash (unique), userId, expiresAt | → User |

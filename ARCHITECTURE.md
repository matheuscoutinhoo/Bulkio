# Bulkio — Architecture & Engineering Standards
# Single Source of Truth (SSoT)
# Status: ATIVO | Última revisão: 2026-04-11

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
- Dashboard com analytics (streak, volume, distribuição muscular, progressão, heatmap de atividade anual com milestones)
- Geração de fichas de treino com IA (Abacus.ai Route LLM — gemini-2.5-flash)

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

### ADR-008: Testes de Integração com SQLite real + supertest
- **Contexto**: Testes unitários não cobrem fluxo real HTTP → controller → service → repository → DB. Necessidade de validar roteamento, middlewares, serialização e queries reais.
- **Decisão**: Testes de integração usando supertest + SQLite em arquivo temporário (`prisma/test.db`). Config separada (`vitest.integration.config.ts`). Script dedicado: `npm run test:integration`. Rate limiting desabilitado em `NODE_ENV=test`.
- **Motivo**: Supertest já era devDependency. SQLite file DB elimina necessidade de serviço externo. Vitest config separada isola testes de integração dos unitários.
- **Consequências (+)**: 87 testes de integração cobrindo todos os 28 endpoints (auth, exercises, workouts, workout-logs, body-weight, dashboard). Valida ownership, validação Zod, status codes e fluxo real.
- **Consequências (-)**: Testes mais lentos (~53s vs ~3s dos unitários). Necessidade de gerenciar ciclo de vida do banco de teste (setup/teardown).
- **Estrutura**: `src/tests/integration/setup.ts` (helpers), `*.integration.test.ts` (6 suites).
- **Status**: Ativa.

### ADR-009: CSS Animations + React Portal for Dialogs
- **Contexto**: Animations (fade-in, scale-in) applied to page containers create CSS stacking contexts that break `position: fixed` on descendant dialogs.
- **Decisão**: Page-level animations via CSS keyframes in `index.css`. Dialogs rendered via `createPortal(content, document.body)` to escape stacking contexts. Reusable `Dialog` component handles portal internally. Inline dialogs (e.g., GoalDialog) also use `createPortal`.
- **Motivo**: CSS `transform` (even `transform: none` at animation end) creates a containing block for `position: fixed` descendants. Portal renders outside any animated parent.
- **Consequências (+)**: Dialogs always render on top of everything, regardless of parent animations.
- **Consequências (-)**: Portal elements are outside the React tree for event bubbling (rarely an issue for modals).
- **Animations available**: `animate-fade-in`, `animate-fade-in-up`, `animate-fade-in-down`, `animate-scale-in`, `animate-slide-in-left`, `skeleton` (pulse loader).
- **Stagger utility**: `.stagger-children` class delays children by 50ms increments (up to 8th child).
- **Status**: Ativa.

### ADR-010: Abacus.ai Route LLM for AI Workout Generation
- **Contexto**: Usuário deseja geração automática de fichas de treino com base em preferências (nível, foco muscular, descrição livre). Migrado de Google Gemini SDK para Abacus.ai Route LLM por flexibilidade de modelos e custo.
- **Decisão**: Usar Abacus.ai Route LLM API (endpoint OpenAI-compatible: `POST {LLM_BASE_URL}/chat/completions`). Modelo padrão: `gemini-2.5-flash`. Sem SDK — usa `fetch` nativo. Gera UMA ficha por requisição. Resposta em JSON validada com Zod (schema compacto: `i/s/r/d`). Retry até 2x em resposta inválida. Exercícios referenciados por índice no prompt (otimização de tokens) e mapeados para IDs reais no service.
- **Motivo**: Abacus.ai Route LLM oferece acesso a múltiplos modelos (Gemini, GPT, Claude, Llama, etc.) via uma única API key (`s2_` prefix). Endpoint OpenAI-compatible simplifica integração. `gemini-2.5-flash` confirmado como melhor modelo para JSON estruturado (rápido, barato, preciso). Zero dependências extras (sem SDK).
- **Alternativas descartadas**: Google Gemini SDK direto (gemini-2.0-flash shutting down Jun/2026, vendor lock-in), GPT-4o-mini (custo maior), regras determinísticas (qualidade inferior).
- **Otimização de tokens**: Índices em vez de IDs no prompt, abreviações de grupos musculares/tipo/equipamento (`GROUP_ABBR`, `TYPE_ABBR`, `EQUIP_ABBR`), chaves JSON compactas (`i/s/r/d` em vez de `index/sets/reps/restSeconds`), nome do plano gerado server-side, limite 80 exercícios, `max_tokens: 1024`.
- **Config**: `LLM_API_KEY` (env var, NUNCA commitada), `LLM_BASE_URL` (default `https://llmrouter.abacus.ai/v1`), `LLM_MODEL` (default `gemini-2.5-flash`).
- **Consequências (+)**: Planos personalizados, catálogo real, multi-model flexibility, zero SDK deps, ~60-70% menos tokens no prompt.
- **Consequências (-)**: Dependência de API externa (requer LLM_API_KEY em .env), latência variável, possibilidade de respostas inválidas (mitigada com retry + Zod).
- **Endpoint**: `POST /api/v1/workouts/generate` (JWT, validate generateWorkoutSchema). Input: `{ level, focus?, description? }`. Returns single plan.
- **Files**: `services/aiWorkoutService.ts`, `utils/promptBuilder.ts`, `components/workoutPlans/GenerateWorkoutDialog.tsx`.
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
| Training Logs | WorkoutLog, WorkoutLogExercise, WorkoutLogSet | workoutLogService |
| Personal Records | PersonalRecord | personalRecordService |
| Body Tracking | BodyWeight | bodyWeightService |
| Analytics | (lê de várias entidades) | dashboardService |
| AI Generation | (usa Exercise, User, WorkoutPlan) | aiWorkoutService |

---

## 5. Padrões de Engenharia

### Padrões Obrigatórios
| Padrão | Onde | Propósito |
|--------|------|-----------|
| Repository | `repositories/*.ts` | Encapsular queries Prisma; interface única de acesso a dados |
| Repository DRY includes | `repositories/*.ts` (constantes no topo) | Includes reutilizáveis: `exercisesInclude`, `logInclude`, `toExerciseCreateData()` |
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
- **Alturas fixas em px para charts** — NÃO DEVE usar `height={N}` fixo em ResponsiveContainer. DEVE usar containers com aspect-ratio.

### Padrões de Frontend — Mobile-First & Responsividade
1. **Mobile-first obrigatório** — Todo componente DEVE ser projetado primeiro para viewports móveis (≥320px) e depois progressivamente aprimorado com `sm:`, `md:`, `lg:`. NUNCA projetar apenas para desktop.
2. **Sem alturas fixas em charts** — Gráficos (Recharts) DEVEM usar containers com `aspect-ratio` + `min-h`/`max-h` e `ResponsiveContainer width="100%" height="100%"`. NUNCA usar `height={300}` fixo.
3. **Padding responsivo** — Cards e containers DEVEM usar padding menor em mobile (`p-5 sm:p-6`). Stat cards usam `pb-3` entre header e content para breathing room.
4. **Textos escaláveis** — Títulos e valores DEVEM ter tamanhos progressivos (`text-sm sm:text-base`, `text-xl sm:text-2xl`).
5. **Sem overflow horizontal** — Layouts DEVEM prevenir scrollbar horizontal. Usar `overflow-x-auto` em tabelas/grids que podem exceder a viewport, e `overflow-x-hidden` no body.
6. **Flex/Grid stackável** — Layouts lado a lado DEVEM empilhar em mobile (`flex-col sm:flex-row`, `grid-cols-1 sm:grid-cols-2`).
7. **Truncate para textos longos** — Textos que podem exceder o container DEVEM usar `truncate` ou `line-clamp-*`.
8. **Toque amigável** — Botões e áreas clicáveis DEVEM ter ao mínimo `h-10 w-10` (44px) em mobile para facilitar toque.

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
  services/     # authService, bodyWeightService, dashboardService, exerciseService, personalRecordService, workoutLogService, workoutPlanService, aiWorkoutService
  utils/        # asyncHandler, errors, streakCalculator, promptBuilder
  helpers.ts    # Factories e mocks compartilhados
  setup.ts      # Setup global de testes
utils/          # Utilities (errors.ts, asyncHandler.ts, streakCalculator.ts, promptBuilder.ts)
app.ts          # Express app configuration
server.ts       # Server entry point
```

#### Frontend (`frontend/src/`)
```
components/     # Componentes React reutilizáveis
  bodyWeight/  # GoalDialog
  dashboard/   # ActivityHeatmap (heatmap de atividade anual)
  exercises/    # ExerciseDetailModal, ExerciseProgressionDialog, ExerciseSearchDropdown
  layout/       # AppLayout, Sidebar, ProtectedRoute
  ui/           # Design system primitives (Button, Input, Card, Dialog, etc.)
  workoutLogs/  # LogWorkoutDialog, AddSetForm
  workoutPlans/ # CreateWorkoutPlanDialog, GenerateWorkoutDialog
lib/            # Utilities compartilhados
  api.ts        # Axios instance com interceptors
  exerciseLabels.ts  # Mapeamento de enums para labels pt-BR
  schemas.ts    # Zod schemas centralizados (login, register) — single source para validação frontend
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
| Integração | SIM | Fluxo HTTP real com DB SQLite (supertest) | Vitest |
| E2E | NÃO (pode ser adicionado) | Fluxos de usuário completos | - |

- Cobertura mínima configurada: **80%** (statements, branches, functions, lines).
- Testes DEVEM usar factories de `tests/helpers.ts` para criar mocks.
- Testes unitários DEVEM rodar sem banco de dados real (mocks via `vi.mock`).
- Testes de integração DEVEM usar `vitest.integration.config.ts` e SQLite temporário (`prisma/test.db`).
- Testes unitários DEVEM ser executados com `npm run test:backend` ANTES de cada commit na branch `release`.
- Testes de integração DEVEM ser executados com `cd backend && npm run test:integration`.

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
| POST | /api/v1/workouts/generate | JWT | generateWorkoutSchema | workoutPlanController.generate |
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
| DELETE | /api/v1/auth/account | JWT | - | authController.deleteAccount |
| GET | /api/v1/dashboard/stats | JWT | - | dashboardController.getStats |
| GET | /api/v1/dashboard/exercise-progression/:exerciseId | JWT | - | dashboardController.getExerciseProgression |
| GET | /api/health | No | - | Inline handler |

## Apêndice: Database Schema Summary

| Model | Key Fields | Relations |
|-------|------------|-----------|
| User | id, email (unique), username (unique), password, goal?, initialWeight?, targetWeight?, height? | → WorkoutPlan[], WorkoutLog[], BodyWeight[], PersonalRecord[], RefreshToken[] |
| Exercise | id, name (unique), muscleGroup, type, equipment, videoUrl | → WorkoutPlanExercise[], WorkoutLogExercise[], PersonalRecord[] |
| WorkoutPlan | id, name, userId, isArchived | → User, WorkoutPlanExercise[], WorkoutLog[] |
| WorkoutPlanExercise | id, workoutPlanId, exerciseId, sets, reps, restSeconds, order, notes? | → WorkoutPlan, Exercise |
| WorkoutLog | id, userId, workoutPlanId?, date, startTime?, endTime?, notes?, isComplete | → User, WorkoutPlan?, WorkoutLogExercise[] |
| WorkoutLogExercise | id, workoutLogId, exerciseId, order, notes? | → WorkoutLog, Exercise, WorkoutLogSet[] |
| WorkoutLogSet | id, workoutLogExerciseId, setNumber, reps, weight, notes? | → WorkoutLogExercise |
| BodyWeight | id, userId, weight, date | → User |
| PersonalRecord | id, userId, exerciseId, weight, reps  (unique: userId+exerciseId) | → User, Exercise |
| RefreshToken | id, tokenHash (unique), userId, expiresAt | → User |

---

## Apêndice: NPM Scripts

### Root Monorepo (`package.json`)
| Script | Comando | Propósito |
|--------|---------|----------|
| `dev` | `concurrently "npm run dev:backend" "npm run dev:frontend"` | Inicia backend + frontend em paralelo |
| `dev:backend` | `cd backend && npm run dev` | Apenas backend |
| `dev:frontend` | `cd frontend && npm run dev` | Apenas frontend |
| `build` | `concurrently "npm run build:backend" "npm run build:frontend"` | Build de ambos |
| `test` | `concurrently "npm run test:backend" "npm run test:frontend"` | Testes de ambos |
| `lint` | `concurrently "npm run lint:backend" "npm run lint:frontend"` | Lint de ambos |
| `setup` | `npm install && cd backend && npm install && prisma generate && prisma db push && prisma db seed && cd ../frontend && npm install` | Setup completo do projeto |

### Backend (`backend/package.json`)
| Script | Comando | Propósito |
|--------|---------|----------|
| `dev` | `tsx watch src/server.ts` | Dev server com hot reload |
| `build` | `tsc` | Compilar TypeScript |
| `start` | `node dist/server.js` | Iniciar em produção |
| `test` | `vitest run` | Rodar testes unitários |
| `test:watch` | `vitest` | Testes em watch mode |
| `test:coverage` | `vitest run --coverage` | Testes com cobertura |
| `test:integration` | `vitest run --config vitest.integration.config.ts` | Testes de integração |
| `lint` | `eslint src/ --ext .ts` | Linting |
| `db:generate` | `prisma generate` | Gerar Prisma Client |
| `db:push` | `prisma db push` | Sincronizar schema com DB |
| `db:migrate` | `prisma migrate dev` | Criar migration |
| `db:seed` | `tsx prisma/seed.ts` | Popular DB com dados iniciais |
| `db:studio` | `prisma studio` | UI de gestão do banco |

### Frontend (`frontend/package.json`)
| Script | Comando | Propósito |
|--------|---------|----------|
| `dev` | `vite` | Dev server |
| `build` | `tsc -b && vite build` | Build de produção |
| `lint` | `eslint .` | Linting |
| `preview` | `vite preview` | Preview do build |

---

## Apêndice: Frontend Routes

| Path | Componente | Auth | Descrição |
|------|-----------|------|----------|
| `/login` | LoginPage | Não | Página de login |
| `/register` | RegisterPage | Não | Página de cadastro |
| `/dashboard` | DashboardPage | JWT | Dashboard principal com stats, charts e heatmap |
| `/workouts` | WorkoutPlansPage | JWT | Fichas de treino (CRUD) |
| `/logs` | WorkoutLogsPage | JWT | Registro de treinos (CRUD) |
| `/body-weight` | BodyWeightPage | JWT | Rastreamento de peso corporal, IMC, metas |
| `/profile` | ProfilePage | JWT | Perfil do usuário (meta, peso alvo, deletar conta) |
| `*` | → `/dashboard` | - | Redirect catch-all |

Rotas protegidas são envolvidas por `<ProtectedRoute>` e renderizadas dentro de `<AppLayout>` (sidebar + conteúdo).

---

## Apêndice: Dashboard — Features & Métricas

### Cards de Resumo
| Card | Dados | Fonte |
|------|-------|-------|
| Treinos na Semana | Semana atual vs semana anterior | `weeklyWorkouts.current / previous` |
| Streak | Dias consecutivos com treino | `streak` |
| Volume Total | kg levantados nos últimos 30d (Σ reps × weight) | `totalVolume` |
| Peso Corporal | Peso atual + meta (BULK/CUT/MAINTAIN) + peso alvo | `bodyWeight.current / goal / target / initial` |

### Gráficos (Recharts)
| Gráfico | Tipo | Dados | Container |
|---------|------|-------|----------|
| Distribuição Muscular | PieChart + Legend | Sets por grupo muscular (30d) | `aspect-4/3 min-h-50 max-h-70` |
| Evolução do Peso | LineChart | Histórico de peso (30d) | `aspect-video min-h-45 max-h-75` |
| Volume por Músculo | BarChart | Sets por grupo muscular (30d) | `aspect-5/2 min-h-45 max-h-75` |

Todos os charts usam `ResponsiveContainer width="100%" height="100%"` e cores via `useChartColors()`.

### Heatmap de Atividade Anual (`ActivityHeatmap`)
- Grid estilo GitHub: 52-53 colunas (semanas) × 7 linhas (dias)
- Intensidade de cor baseada na quantidade de treinos no dia
- Tooltip interativo com data e contagem
- **Sistema de milestones** baseado em percentis brasileiros:
  | Dias | Milestone | Emoji |
  |------|-----------|-------|
  | 78 | Acima de 50% dos brasileiros | 💪 |
  | 109 | Acima de 70% dos brasileiros | 🔥 |
  | 140 | Acima de 90% dos brasileiros | 🏆 |
  | 200 | Top 1% do Brasil | ⭐ |
- Backend: `dashboardRepository.getYearlyWorkoutDays(userId, year)` → retorna datas de treino do ano
- Tipo: `yearlyActivity: Record<string, number>` (data ISO → contagem de treinos)

### Recordes Pessoais
- Grid com top 10 PRs por exercício
- Exibe: nome do exercício, peso, reps, data, grupo muscular
- Link para vídeo do exercício (videoUrl)

### Progressão por Exercício (`ExerciseProgressionDialog`)
- Dialog (portal-rendered) with exercise progression charts
- LineChart: Evolução de carga máxima over time
- LineChart: Evolução de volume total over time
- Stats cards: carga atual, carga máxima, total treinos
- Progression highlight: kg gained/lost since first workout
- Stagnation detection: warns if no weight increase for 3+ consecutive sessions with actionable tips
- Triggered from: Dashboard PR cards, WorkoutLogsPage exercise names
- Tipo: `ExerciseProgression { date, sets[], maxWeight, totalVolume }`

---

## Apêndice: Inventário de Testes

### Testes Unitários (20 arquivos)
| Pasta | Arquivo | Foco |
|-------|---------|------|
| `tests/controllers/` | `authController.test.ts` | Handlers HTTP de autenticação (17) |
| `tests/controllers/` | `bodyWeightController.test.ts` | Handlers HTTP de peso corporal (7) |
| `tests/controllers/` | `dashboardController.test.ts` | Handlers HTTP de dashboard (4) |
| `tests/controllers/` | `exerciseController.test.ts` | Handlers HTTP de exercícios (7) |
| `tests/controllers/` | `workoutLogController.test.ts` | Handlers HTTP de logs de treino (11) |
| `tests/controllers/` | `workoutPlanController.test.ts` | Handlers HTTP de fichas de treino (14) |
| `tests/middlewares/` | `middleware.test.ts` | Auth middleware, errorHandler, validation (12) |
| `tests/schemas/` | `schemas.test.ts` | Validação Zod (inputs válidos/inválidos) (77) |
| `tests/services/` | `authService.test.ts` | Lógica de auth, refresh, revogação (27) |
| `tests/services/` | `bodyWeightService.test.ts` | CRUD peso corporal + ownership (6) |
| `tests/services/` | `dashboardService.test.ts` | Agregações, stats, PRs (18) |
| `tests/services/` | `exerciseService.test.ts` | Busca de exercícios (6) |
| `tests/services/` | `personalRecordService.test.ts` | PR check/update + bulk update from exercises (10) |
| `tests/services/` | `workoutLogService.test.ts` | Logs de treino (17) |
| `tests/services/` | `workoutPlanService.test.ts` | Fichas de treino + duplicação + arquivamento (16) |
| `tests/services/` | `aiWorkoutService.test.ts` | Geração AI: planos, filtro IDs, retry, API key (5) |
| `tests/utils/` | `asyncHandler.test.ts` | Wrapper async para controllers (3) |
| `tests/utils/` | `errors.test.ts` | Classes de erro customizadas (12) |
| `tests/utils/` | `streakCalculator.test.ts` | Cálculo de streak com dedup e timezone (7) |
| `tests/utils/` | `promptBuilder.test.ts` | Construção de prompt AI com exercícios, nível, foco (6) |

### Testes de Integração (6 suites)
| Arquivo | Endpoints cobertos |
|---------|-------------------|
| `auth.integration.test.ts` | register, login, refresh, logout, profile, updateProfile, deleteAccount |
| `exercises.integration.test.ts` | findAll, getMuscleGroups, findById |
| `workoutPlans.integration.test.ts` | findAll, findById, create, update, duplicate, archive |
| `workoutLogs.integration.test.ts` | findAll, findById, create, update, delete |
| `bodyWeight.integration.test.ts` | findAll, create, delete |
| `dashboard.integration.test.ts` | getStats, getExerciseProgression |

**Totais**: 283 testes unitários (20 arquivos) + 87 testes de integração (6 suites) = **370 testes**

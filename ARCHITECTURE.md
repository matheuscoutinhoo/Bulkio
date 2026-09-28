# Arquitetura do Bulkio

## 1. Visão geral

O Bulkio é uma aplicação web cliente-servidor para gestão de treinos. O frontend React consome uma API REST Express, e toda persistência é feita em PostgreSQL pelo Prisma ORM.

Em desenvolvimento, frontend e backend rodam em processos separados e o Vite encaminha `/api` para a porta `3001`. Em produção, o backend também entrega os arquivos estáticos do frontend. Assim, navegador e API compartilham a mesma origem.

```text
Navegador
   │ HTTPS
   ▼
Express ───── arquivos estáticos do React
   │
   ├──── API REST /api/v1
   │        │
   │        ▼
   │   services → repositories → Prisma
   │                              │
   └──── /api/health ─────────────┤
                                  ▼
                              PostgreSQL
```

## 2. Componentes

### Frontend

- `frontend/src/pages`: telas associadas às rotas.
- `frontend/src/components`: componentes de domínio, layout e interface.
- `frontend/src/services`: funções de acesso à API.
- `frontend/src/stores`: estado de autenticação, tema e notificações.
- `frontend/src/lib/api.ts`: cliente Axios, envio do access token e renovação coordenada do token.

As URLs da API são relativas (`/api/v1`). Isso permite usar o proxy do Vite localmente e a mesma origem do Express em produção sem gerar um build específico por ambiente.

### Backend

- `routes`: declaração dos endpoints, autenticação e validação.
- `controllers`: adaptação entre HTTP e serviços.
- `services`: regras de negócio e transações.
- `repositories`: consultas Prisma e isolamento da persistência.
- `models/schemas.ts`: contratos de entrada com Zod.
- `middlewares`: autenticação, logs, rate limit e erros.
- `config`: ambiente, logger e instância compartilhada do Prisma.

Controllers não acessam o Prisma diretamente. O fluxo esperado é `route → controller → service → repository`.

## 3. Modelo de domínio

| Modelo | Responsabilidade | Relações principais |
| --- | --- | --- |
| `User` | conta, objetivo e medidas de perfil | fichas, treinos, pesos, recordes e tokens |
| `Exercise` | catálogo de exercícios | itens de ficha, itens de treino e recordes |
| `WorkoutPlan` | ficha pertencente a um usuário | exercícios ordenados e treinos registrados |
| `WorkoutPlanExercise` | prescrição de séries, reps, descanso e carga | ficha e exercício |
| `WorkoutLog` | sessão de treino | usuário, ficha opcional e exercícios executados |
| `WorkoutLogExercise` | exercício dentro de uma sessão | exercício e séries executadas |
| `WorkoutLogSet` | série executada | reps, carga e observações |
| `BodyWeight` | medição corporal datada | usuário |
| `PersonalRecord` | melhor marca por usuário e exercício | usuário e exercício |
| `RefreshToken` | sessão renovável armazenada por hash | usuário e expiração |

As relações dependentes usam exclusão em cascata. Ao remover uma ficha referenciada por um treino, a referência do treino recebe `NULL`, preservando o histórico.

## 4. Banco e migrations

O datasource Prisma usa `provider = "postgresql"` e lê `DATABASE_URL`. Alterações de schema devem seguir este fluxo:

1. editar `backend/prisma/schema.prisma`;
2. executar `npm run db:migrate` dentro de `backend`;
3. revisar e versionar o SQL gerado;
4. executar os testes com PostgreSQL;
5. aplicar em produção com `npm run db:deploy`.

O seed de exercícios usa `upsert`, portanto pode rodar em cada deploy. Exercícios antigos sem referência podem ser removidos; itens já usados em fichas, histórico ou recordes são preservados.

Não se usa `prisma db push` no deploy. Produção é atualizada somente pelas migrations versionadas.

## 5. Autenticação e segurança

1. Registro ou login devolve um access token curto no corpo da resposta.
2. O refresh token é armazenado em cookie `httpOnly`, `sameSite=strict` e `secure` em produção.
3. O frontend mantém o access token em memória e o envia como Bearer token.
4. Diante de `401`, apenas uma renovação é executada; requisições concorrentes aguardam o novo token.
5. Refresh tokens são persistidos como hash e podem ser revogados no logout.

Outras proteções:

- senhas com bcrypt;
- Helmet;
- limite global de requisições fora dos testes;
- payload JSON limitado a 1 MB;
- validação Zod antes dos controllers;
- verificação de propriedade dos recursos nos serviços/repositórios;
- segredos obrigatórios quando `NODE_ENV=production`.

## 6. API

Todos os recursos protegidos exigem `Authorization: Bearer <token>`.

| Método | Caminho | Uso |
| --- | --- | --- |
| `POST` | `/api/v1/auth/register` | criar conta |
| `POST` | `/api/v1/auth/login` | autenticar |
| `POST` | `/api/v1/auth/refresh` | renovar access token |
| `POST` | `/api/v1/auth/logout` | encerrar sessão |
| `GET/PATCH` | `/api/v1/auth/profile` | consultar/alterar perfil |
| `DELETE` | `/api/v1/auth/account` | excluir conta |
| `GET` | `/api/v1/exercises` | listar exercícios |
| `GET` | `/api/v1/exercises/muscle-groups` | listar grupos musculares |
| `GET/POST` | `/api/v1/workouts` | listar/criar fichas |
| `GET/PATCH/DELETE` | `/api/v1/workouts/:id` | consultar/alterar/excluir ficha |
| `POST` | `/api/v1/workouts/:id/duplicate` | duplicar ficha |
| `GET/POST` | `/api/v1/workout-logs` | listar/registrar treinos |
| `GET` | `/api/v1/workout-logs/exercise-history/:exerciseId` | consultar última sessão de um exercício |
| `GET/PATCH/DELETE` | `/api/v1/workout-logs/:id` | consultar/alterar/excluir treino |
| `GET/POST` | `/api/v1/body-weight` | listar/registrar peso |
| `GET` | `/api/v1/dashboard/stats` | métricas do dashboard |
| `GET` | `/api/v1/dashboard/exercise-progression/:exerciseId` | progressão de exercício |
| `GET` | `/api/health` | processo e conexão PostgreSQL |

Respostas de sucesso seguem `{ success, data, message?, pagination? }`. Erros seguem `{ success: false, data: null, message, errors? }`.

## 7. Execução e deploy

### Docker Compose

O ambiente local possui:

- `postgres`: banco de desenvolvimento com volume persistente;
- `backend`: API, migrations e seed;
- `frontend`: Nginx com fallback da SPA e proxy de `/api`;
- `postgres-test`: banco isolado, habilitado apenas pelo profile `test`.

### Railway

O `Dockerfile` da raiz gera uma imagem multi-stage:

1. instala dependências e compila o backend;
2. instala dependências e compila o frontend;
3. copia o servidor, Prisma, migrations, seed e arquivos estáticos para a imagem final.

`.railway/railway.ts` é a fonte declarativa da infraestrutura. Ela provisiona PostgreSQL e o serviço `bulkio`, conecta `DATABASE_URL`, executa migrations/seed no pre-deploy e configura `/api/health` como health check. A Railway fornece `PORT`; o Express já a utiliza.

O pre-deploy falha antes da troca de versão se uma migration ou seed falhar. O health check só responde `200` quando o processo alcança o PostgreSQL.

## 8. Testes

- Testes unitários usam Vitest e mocks nos limites de serviço/repositório.
- Testes de integração usam Supertest e um PostgreSQL dedicado.
- `prisma migrate reset` recria o schema do banco de teste antes das suítes.
- `TEST_DATABASE_URL` nunca deve apontar para desenvolvimento ou produção.

Antes de entregar alterações:

```bash
npm test
npm run lint
npm run build
docker compose --profile test up -d postgres-test
npm run test:integration
```

## 9. Decisões arquiteturais

### PostgreSQL como único banco suportado

Desenvolvimento, testes e produção usam o mesmo mecanismo de banco. Isso elimina diferenças de tipos, constraints e comportamento transacional entre ambientes.

### Frontend e API no mesmo serviço de produção

Uma única origem simplifica cookies, autenticação, CORS e roteamento. Também reduz a configuração operacional: apenas o serviço web precisa de domínio público; PostgreSQL permanece na rede privada.

### Migrations antes da ativação do deploy

Migrations são executadas no pre-deploy, em um container separado, antes do novo processo receber tráfego. A aplicação não tenta alterar o schema durante requisições.

### Seed idempotente

O catálogo de exercícios é dado de referência. O uso de `upsert` permite atualização segura após migrations e em novos ambientes.

# Bulkio - Gerenciamento de Treinos de Musculação

Aplicação web completa para controle, anotação e gerenciamento de treinos de musculação.

## Stack

- **Frontend**: React 19+ / TypeScript / Vite / Tailwind CSS v4 / Recharts / Zustand
- **Backend**: Node.js / Express / TypeScript / Prisma ORM
- **Database**: SQLite (dev) / PostgreSQL-ready
- **Auth**: JWT + bcrypt + httpOnly cookies
- **AI**: Abacus.ai Route LLM (gemini-2.5-flash) via OpenAI-compatible API

## Funcionalidades

- 226 exercícios pré-cadastrados por grupo muscular
- Criação de fichas de treino (Treino A, B, C...)
- Geração de fichas de treino com IA (nível, foco muscular, descrição)
- Registro de treinos com séries, reps e carga
- Controle de peso corporal com gráficos
- Dashboard com analytics (volume, streak, PRs, distribuição muscular, heatmap de atividade)
- Exercícios customizados
- Personal Records automáticos
- Light/Dark mode

## Setup Rápido

```bash
# Instalar dependências
npm run setup

# Executar em desenvolvimento
npm run dev
```

O backend roda em `http://localhost:3001` e o frontend em `http://localhost:5173`.

## Setup Manual

```bash
# Backend
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev

# Frontend (outro terminal)
cd frontend
npm install
npm run dev
```

## Estrutura do Projeto

```
Bulkio/
├── backend/
│   ├── prisma/           # Schema + seeds (226 exercícios)
│   └── src/
│       ├── config/       # DB, JWT, logger
│       ├── controllers/  # Request handlers
│       ├── middlewares/   # Auth, validation, error handling
│       ├── models/       # Zod schemas + types
│       ├── repositories/ # Data access (Prisma)
│       ├── routes/       # API routes
│       ├── services/     # Business logic
│       └── utils/        # Error classes
├── frontend/
│   └── src/
│       ├── components/   # UI + layout components
│       ├── lib/          # API client, utils
│       ├── pages/        # Route pages
│       ├── services/     # API service functions
│       └── stores/       # Zustand stores
├── docker-compose.yml
└── package.json
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Registro |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Refresh token |
| GET | `/api/v1/auth/profile` | Perfil do usuário |
| PATCH | `/api/v1/auth/profile` | Atualizar perfil |
| GET | `/api/v1/exercises` | Listar exercícios |
| POST | `/api/v1/exercises` | Criar exercício custom |
| GET | `/api/v1/workouts` | Listar fichas |
| POST | `/api/v1/workouts` | Criar ficha |
| POST | `/api/v1/workouts/generate` | Gerar ficha com IA |
| POST | `/api/v1/workouts/:id/duplicate` | Duplicar ficha |
| DELETE | `/api/v1/workouts/:id` | Arquivar ficha |
| GET | `/api/v1/workout-logs` | Histórico de treinos |
| POST | `/api/v1/workout-logs` | Registrar treino |
| GET | `/api/v1/body-weight` | Histórico de peso |
| POST | `/api/v1/body-weight` | Registrar peso |
| GET | `/api/v1/dashboard/stats` | Stats do dashboard |
| GET | `/api/v1/dashboard/exercise-progression/:id` | Progressão de exercício |
| DELETE | `/api/v1/auth/account` | Deletar conta |

## Docker

```bash
docker compose up --build
```

## Variáveis de Ambiente

### Backend (`.env`)
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="change-me"
JWT_REFRESH_SECRET="change-me"
NODE_ENV="development"
PORT=3001
CORS_ORIGIN="http://localhost:5173"
LLM_API_KEY="your-abacus-ai-route-llm-key"
LLM_BASE_URL="https://llmrouter.abacus.ai/v1"
LLM_MODEL="gemini-2.5-flash"
```

## Testes

```bash
npm run test           # Todos
npm run test:backend   # Backend
npm run test:frontend  # Frontend
```

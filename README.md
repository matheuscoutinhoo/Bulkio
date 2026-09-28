# Bulkio

Aplicação web para criar fichas de musculação, registrar treinos e acompanhar evolução de carga e peso corporal.

## Funcionalidades

- catálogo de exercícios por grupo muscular, tipo e equipamento;
- criação, edição, duplicação e exclusão de fichas de treino;
- registro de séries, repetições, carga, duração e observações;
- histórico e progressão por exercício;
- controle de peso corporal e metas;
- dashboard com volume, sequência de treinos, recordes e mapa de atividade;
- autenticação com access token e refresh token em cookie `httpOnly`;
- tema claro/escuro e suporte a instalação como PWA.

## Stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS, Zustand e Recharts.
- Backend: Node.js 20, Express, TypeScript, Zod e Prisma ORM.
- Banco: PostgreSQL 16.
- Produção: Docker e Railway.

## Requisitos

- Node.js 20 ou superior;
- npm;
- Docker com Docker Compose.

## Desenvolvimento local

Suba o PostgreSQL, instale as dependências, aplique as migrations e carregue o catálogo de exercícios:

```bash
npm run db:up
npm run setup
npm run dev
```

Serviços disponíveis:

- frontend: `http://localhost:5173`;
- backend: `http://localhost:3001`;
- health check: `http://localhost:3001/api/health`;
- PostgreSQL: `localhost:5432`.

O Vite encaminha `/api` ao backend durante o desenvolvimento. O arquivo `backend/.env` é criado a partir de `backend/.env.example` quando ainda não existe.

### Ambiente completo em Docker

```bash
docker compose up --build
```

A aplicação fica disponível em `http://localhost`. O container do backend aguarda o PostgreSQL, aplica as migrations e executa o seed antes de iniciar.

## Variáveis de ambiente

Configuração local padrão em `backend/.env`:

```dotenv
DATABASE_URL="postgresql://bulkio:bulkio@localhost:5432/bulkio?schema=public"
JWT_SECRET="dev-jwt-secret-change-in-production"
JWT_REFRESH_SECRET="dev-jwt-refresh-secret-change-in-production"
NODE_ENV="development"
PORT=3001
CORS_ORIGIN="http://localhost:5173"
```

Em produção, `JWT_SECRET` e `JWT_REFRESH_SECRET` devem ser valores longos, aleatórios e diferentes. `PORT` é injetada pela Railway. `STATIC_FILES_PATH` é definida na imagem de produção e não precisa ser configurada manualmente.

## Banco de dados

O schema está em `backend/prisma/schema.prisma` e as migrations versionadas em `backend/prisma/migrations`.

```bash
cd backend
npm run db:generate       # gera o Prisma Client
npm run db:migrate        # cria uma migration durante o desenvolvimento
npm run db:deploy         # aplica migrations existentes
npm run db:seed           # atualiza o catálogo de exercícios
npm run db:studio         # abre o Prisma Studio
```

Os antigos arquivos SQLite não são usados pela aplicação. Se houver dados locais que precisem ser preservados, exporte-os e faça uma importação explícita no PostgreSQL antes de removê-los.

## Testes e qualidade

```bash
npm test                  # testes unitários do backend
npm run lint              # lint de backend e frontend
npm run build             # build completo
```

Os testes de integração usam um PostgreSQL isolado na porta `5433`:

```bash
docker compose --profile test up -d postgres-test
npm run test:integration
```

Para usar outra instância, defina `TEST_DATABASE_URL`. O banco informado será resetado durante os testes; nunca aponte essa variável para dados importantes.

## Deploy na Railway

O deploy usa um único serviço web para servir a API e o build do React no mesmo domínio. O PostgreSQL é provisionado como serviço separado. O arquivo `.railway/railway.ts` declara:

- o serviço PostgreSQL;
- a referência de `DATABASE_URL` pela rede privada;
- migrations e seed no pre-deploy;
- health check em `/api/health`;
- o comando de inicialização do servidor.

Fluxo com a Railway CLI:

```bash
railway login
railway init                  # ou railway link, para um projeto existente
railway config plan
railway config apply
```

Depois de aplicar a infraestrutura:

1. No serviço `bulkio`, defina `JWT_SECRET` e `JWT_REFRESH_SECRET`.
2. Conecte o repositório GitHub ao serviço `bulkio` para deploy contínuo, ou selecione o serviço com `railway service` e execute `railway up`.
3. Em **Networking**, gere um domínio público.
4. Confirme que `/api/health` retorna `status: "ok"` e `database: "connected"`.

A Railway detecta o `Dockerfile` da raiz. A imagem compila frontend e backend, mantém o Prisma CLI para o pre-deploy e inicia o Express usando a variável `PORT` fornecida pela plataforma.

Referências: [Infrastructure as Code](https://docs.railway.com/infrastructure-as-code), [PostgreSQL](https://docs.railway.com/databases/postgresql) e [pre-deploy commands](https://docs.railway.com/deployments/pre-deploy-command).

## Estrutura

```text
.
├── .railway/railway.ts       # infraestrutura Railway
├── backend/
│   ├── prisma/               # schema, migrations e seed
│   └── src/                  # API Express
├── frontend/
│   ├── public/               # PWA e arquivos públicos
│   └── src/                  # aplicação React
├── Dockerfile                # imagem unificada de produção
├── docker-compose.yml        # ambiente local
└── scripts/setup.mjs         # instalação e preparação local
```

Os endpoints da API usam o prefixo `/api/v1`. Consulte [ARCHITECTURE.md](./ARCHITECTURE.md) para os detalhes dos módulos e contratos.

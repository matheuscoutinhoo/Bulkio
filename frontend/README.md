# Frontend do Bulkio

SPA React responsável pelas telas de autenticação, fichas, registro de treinos, peso corporal, perfil e dashboard.

O dashboard inclui um mapa corporal 3D rotacionável com Three.js. As séries dos
últimos 30 dias definem a intensidade do roxo de cada grupo muscular. O modelo
local, sua licença e o processo de regeneração estão documentados em
[`public/models/README.md`](./public/models/README.md). O módulo 3D é carregado
sob demanda, com lista de valores disponível também quando WebGL falha.

## Desenvolvimento

Na raiz do projeto, suba o PostgreSQL e o backend antes do frontend:

```bash
npm run db:up
npm run setup
npm run dev
```

Para executar somente esta aplicação:

```bash
npm install
npm run dev
```

O servidor Vite usa `http://localhost:5173` e encaminha `/api` para `http://localhost:3001`.

## Scripts

```bash
npm run dev      # servidor de desenvolvimento
npm run build    # type-check e build de produção
npm run lint     # análise estática
npm run preview  # prévia local do build
```

## Produção

O cliente usa URLs relativas com prefixo `/api/v1`. No deploy da Railway, o Express entrega `frontend/dist` e a API no mesmo domínio. No Docker Compose local, o Nginx entrega a SPA e encaminha `/api` ao container do backend.

Consulte o [README principal](../README.md) para variáveis, banco, testes e deploy.

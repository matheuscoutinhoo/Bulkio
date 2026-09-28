import {
  defineRailway,
  postgres,
  preserve,
  project,
  service,
} from "railway/iac";

export default defineRailway(() => {
  const database = postgres("Postgres");

  const web = service("bulkio", {
    start: "node dist/server.js",
    preDeploy: "npm run db:deploy && npm run db:seed",
    healthcheck: "/api/health",
    healthcheckTimeout: 300,
    env: {
      DATABASE_URL: database.env.DATABASE_URL,
      NODE_ENV: "production",
      JWT_SECRET: preserve(),
      JWT_REFRESH_SECRET: preserve(),
    },
  });

  return project("bulkio", {
    resources: [database, web],
  });
});

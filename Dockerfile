FROM node:20-alpine AS backend-deps
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci

FROM backend-deps AS backend-build
COPY backend/tsconfig.json ./
COPY backend/prisma ./prisma
COPY backend/src ./src
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV STATIC_FILES_PATH=/app/public

COPY --from=backend-build /app/backend/node_modules ./node_modules
COPY --from=backend-build /app/backend/dist ./dist
COPY backend/package.json backend/package-lock.json ./
COPY backend/prisma ./prisma
COPY --from=frontend-build /app/frontend/dist ./public

EXPOSE 3001
CMD ["node", "dist/server.js"]

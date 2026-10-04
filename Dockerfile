# Dev image for both workspaces (used by docker-compose.yml). Each app's src/ is bind-mounted for hot reload.
FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN npm ci
COPY . .

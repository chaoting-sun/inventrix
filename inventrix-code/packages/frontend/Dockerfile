FROM node:22-slim AS build
RUN npm install -g pnpm@10.34.0
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/frontend/package.json packages/frontend/
RUN pnpm install --frozen-lockfile --filter frontend
COPY packages/frontend packages/frontend
RUN pnpm --filter frontend build

FROM nginx:1.28-alpine
COPY packages/frontend/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/packages/frontend/dist /usr/share/nginx/html

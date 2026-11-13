FROM node:22-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@10.34.0
ENV CI=true
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/api/package.json packages/api/
RUN pnpm install --frozen-lockfile --filter api
COPY packages/api packages/api
RUN pnpm --filter api build && pnpm install --frozen-lockfile --filter api --prod

FROM node:22-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /app /app
WORKDIR /app/packages/api
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]

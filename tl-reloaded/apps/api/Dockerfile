FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm --filter @repo/db db:generate
RUN pnpm --filter @repo/db build
RUN pnpm --filter api build

# Deploy the api package to a separate directory for production
RUN pnpm --filter api --prod deploy /out

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy the deployed files from the builder stage
COPY --from=builder /out ./

# Ensure the database package and generated prisma client are available
# (pnpm deploy handles workspace dependencies by copying them into node_modules)

EXPOSE 3001

CMD ["node", "dist/main"]

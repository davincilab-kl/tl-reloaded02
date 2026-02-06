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

# Diagnostic: check build output
RUN ls -la apps/api/dist

# Deploy the api package to a separate directory for production
# This should flatten the dependencies
RUN pnpm --filter api --prod deploy /out

# Diagnostic: check deploy output
RUN ls -la /out
RUN ls -la /out/node_modules || true

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy the deployed files from the builder stage
COPY --from=builder /out ./

# Diagnostic: check runner structure
RUN ls -la .

EXPOSE 8080
ENV PORT=8080

CMD ["node", "dist/main.js"]

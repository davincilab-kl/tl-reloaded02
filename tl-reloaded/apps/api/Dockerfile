FROM node:20-slim AS base
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app

# 1. Build stage
FROM base AS builder
# Invalidate cache for the following steps
ARG BUILD_ID=force_rebuild_002
ENV BUILD_ID=$BUILD_ID

COPY . .
RUN echo "Starting fresh install and build..."
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN echo "Generating Prisma client..."
RUN pnpm --filter @repo/db db:generate
RUN echo "Building @repo/db..."
RUN pnpm --filter @repo/db build
RUN echo "Building api..."
RUN pnpm --filter api build

# Diagnostic: Verify the generated client exists in the custom path
RUN ls -la packages/db/generated/client || echo "ERROR: Prisma client not found in custom path"

# 2. Runner stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Copy EVERYTHING from builder
COPY --from=builder /app /app

EXPOSE 8080
WORKDIR /app/apps/api
CMD ["node", "dist/main.js"]

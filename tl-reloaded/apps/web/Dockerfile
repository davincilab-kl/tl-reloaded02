FROM node:20-slim AS base
RUN corepack enable
WORKDIR /app

# 1. Build stage
FROM base AS builder
# Invalidate cache for the following steps
ARG BUILD_ID=force_rebuild_001
ENV BUILD_ID=$BUILD_ID

COPY . .
RUN echo "Starting fresh install and build..."
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN echo "Generating Prisma client..."
RUN pnpm --filter @repo/db db:generate
RUN echo "Building @repo/db..."
RUN pnpm --filter @repo/db build
RUN echo "Building web..."
RUN pnpm --filter web build

# 2. Runner stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy EVERYTHING from builder
COPY --from=builder /app /app

EXPOSE 3000
WORKDIR /app/apps/web
CMD ["pnpm", "start"]

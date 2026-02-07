FROM node:20-slim AS base
RUN corepack enable
WORKDIR /app

# 1. Build stage
FROM base AS builder
# Copy everything in the monorepo
COPY . .
# Install all dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
# Build everything (Next.js needs the full monorepo context)
RUN pnpm --filter @repo/db db:generate
RUN pnpm --filter @repo/db build
RUN pnpm --filter web build

# 2. Runner stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy EVERYTHING from builder to ensure all symlinks and workspace deps are intact
COPY --from=builder /app /app

# Expose the Web port
EXPOSE 3000

# Run the Web app from its workspace directory
WORKDIR /app/apps/web
CMD ["pnpm", "start"]

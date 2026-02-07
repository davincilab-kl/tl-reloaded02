FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 1. Prune the monorepo
FROM base AS builder
WORKDIR /app
RUN pnpm add -g turbo@^2
COPY . .
RUN turbo prune --scope=web --docker

# 2. Install dependencies
FROM base AS installer
WORKDIR /app
# Copy pruned json and lockfile
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
# Install dependencies (only for pruned structure)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# 3. Build the application
FROM base AS build
WORKDIR /app
COPY --from=builder /app/out/full/ .
COPY --from=installer /app/node_modules ./node_modules
# Need the workspace file for build
COPY pnpm-workspace.yaml ./ 

# Generate Prisma and build
RUN pnpm --filter @repo/db db:generate
RUN pnpm --filter @repo/db build
RUN pnpm --filter web build

# 4. Final runner image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Leverage standalone output
COPY --from=build /app/apps/web/public ./apps/web/public
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static

# Set the port and expose
EXPOSE 3000

CMD ["node", "apps/web/server.js"]

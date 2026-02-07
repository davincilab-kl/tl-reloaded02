FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 1. Prune the monorepo
FROM base AS builder
WORKDIR /app
RUN pnpm add -g turbo@^2
COPY . .
RUN turbo prune --scope=api --docker

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
RUN pnpm --filter api build

# 4. Final runner image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# We need the production node_modules. 
# Re-running install for production is safest in the runner if we want it small, 
# but for now we copy the build output and node_modules from build stage.
# pnpm prune --prod can be used in installer or build stage.

COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/package.json .

# Set the port and expose
EXPOSE 8080

CMD ["node", "dist/main.js"]

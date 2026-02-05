# @repo/db

Shared Prisma database package for the monorepo.

## Setup

1. Create a `.env` file in the root of the monorepo (or in `packages/db`) with:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
   DIRECT_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
   ```

2. Generate Prisma Client:
   ```bash
   pnpm db:generate
   ```

3. Push schema to database (for development):
   ```bash
   pnpm db:push
   ```

   Or create a migration:
   ```bash
   pnpm db:migrate
   ```

## Usage

### In NestJS API (Backend Only)

**Import the Prisma client:**
```typescript
import { prisma } from '@repo/db';

// Use prisma in your services
export class UserService {
  async findAll() {
    return prisma.user.findMany();
  }
}
```

### In Next.js Web App (Frontend - Types Only)

**⚠️ IMPORTANT: Only import types, never the client!**

```typescript
// ✅ CORRECT: Import types only (compile-time, zero bundle size)
import type { User, UserRole } from '@repo/db/types';

// Use types for type-safe API calls
const user: User = await fetch('/api/users').then(r => r.json());

// ❌ WRONG: Don't import the client in frontend
// import { prisma } from '@repo/db'; // This would bundle Prisma Client!
```

**Why separate exports?**
- `@repo/db` - Exports Prisma Client (backend only, ~2MB+ bundle)
- `@repo/db/types` - Exports only TypeScript types (frontend safe, 0KB bundle)
- Types are stripped at compile time and never included in the final bundle

## Scripts

- `pnpm db:generate` - Generate Prisma Client
- `pnpm db:push` - Push schema changes to database (dev)
- `pnpm db:migrate` - Create and apply migration
- `pnpm db:migrate:deploy` - Apply migrations (production)
- `pnpm db:studio` - Open Prisma Studio
- `pnpm db:seed` - Run database seed script

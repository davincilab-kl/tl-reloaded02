# TalentsLounge Reloaded (v2)

This is the monorepo for the TalentsLounge Reloaded platform, built with Turborepo.

## 🚀 Getting Started

### 1. Prerequisites
- Node.js > 18
- pnpm

### 2. Environment Setup
You need to configure environment variables for both the **Web** and **API** applications.

#### Web App (`apps/web/.env.local`)
Create `apps/web/.env.local` and add:
```bash
# Next.js Public API URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

#### API (`apps/api/.env`)
Create `apps/api/.env` and add for testing (not prod):
```bash
# API Configuration
PORT=3001

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key # Change in production
JWT_EXPIRATION=7d

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Database - Supabase Connection
DATABASE_URL=postgresql://postgres.jgvxlmpwsrxhorvvgoqq:J21O5Z57Xo0vU7sf@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```
#### Database Package (`packages/db/.env`)
Required for running migrations and generating the client.
Create `packages/db/.env` and add:
```bash
DATABASE_URL=postgresql://postgres.jgvxlmpwsrxhorvvgoqq:J21O5Z57Xo0vU7sf@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

#### Root (`.env`)
You can also place shared configuration in the root `.env` file (useful for Docker/deployment).
It shares the same structure as the API configuration.

### 3. Installation & Running
Run the following commands from the root (`tl-reloaded/`):

```bash
# Install dependencies
pnpm install

# Generate database client (Prisma)
pnpm db:generate

# Run development server (boots both Web and API)
pnpm dev
```

The apps will start:
- **Prisma build & db generate: gets the prisma client ready for web and api
- **Web**: [http://localhost:3000](http://localhost:3000)
- **API**: [http://localhost:3001](http://localhost:3001)

---

# Buzan Mind Mapper (BMM)

A Buzan-compliant mind mapping application built with React + TypeScript + ASP.NET Core 8.

## Prerequisites

- Node.js ≥ 18
- .NET 8 SDK
- Docker (for PostgreSQL and Redis)
- npm ≥ 10

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url>
cd radiant-mind-1/src
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your local values
```

### 3. Start infrastructure

```bash
# PostgreSQL
docker run -d --name bmm-postgres -p 5432:5432 \
  -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=bmm_dev postgres:16

# Redis
docker run -d --name bmm-redis -p 6379:6379 redis:7
```

### 4. Run migrations

```bash
cd src/Bmm.Api
dotnet ef database update
```

### 5. Start development servers

```bash
# From src/
npm run dev         # Starts all frontend packages via Turborepo
# From src/Bmm.Api/
dotnet run          # Starts ASP.NET Core API on https://localhost:5001
```

## Monorepo Structure

```
src/
├── apps/
│   └── web/               # React + Vite frontend (port 3000)
├── packages/
│   ├── data-model/        # @bmm/data-model — TypeScript types
│   ├── enforcement/       # @bmm/enforcement — Buzan rule engine
│   ├── canvas/            # @bmm/canvas — React Flow components + Storybook
│   ├── ui/                # @bmm/ui — Shared UI components
│   └── api-client/        # @bmm/api-client — API client
└── Bmm.Api/               # ASP.NET Core 8 backend
```

## Testing

```bash
# Unit tests (Vitest)
cd src && npx turbo run test

# E2E tests (Playwright)
cd src && npx playwright test

# Storybook
cd src/packages/canvas && npm run storybook
```

## CI/CD

GitHub Actions runs on every PR:
- Vitest unit tests
- .NET build
- Playwright smoke test
- Chromatic visual regression (requires CHROMATIC_PROJECT_TOKEN secret)

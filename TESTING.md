# Matriarch Testing Strategy

## 1. Overview

We use a two-tiered testing approach to ensure stability without slowing down development.

| Type | Tool | Scope | When to Write |
|------|------|-------|---------------|
| **Unit** | **Vitest** | Individual functions, hooks, logic | Components with logic, Utilities, API handlers |
| **E2E** | **Playwright** | Critical user flows | Major features, Critical paths (Login, Data Integrity) |

---

## 2. Unit Testing (Vitest)

### 2.1 Co-location
Test files should be continuously located next to the source file.
- Source: `src/main/api/notesApi.ts`
- Test: `src/main/api/notesApi.test.ts`

### 2.2 Mocking
Logic often depends on external services (Database, Electron).
- **Database**: Mock Prisma client or use an in-memory SQLite instance (preferred for logic tests).
- **Electron**: Mock `ipcMain` and `ipcRenderer` using Vitest's mocking capabilities.

### 2.3 What to Test
- **API Handlers**: Input validation, success/error responses.
- **Services**: Business logic, data transformation.
- **Utils**: Helper functions.
- **Complex Components**: Components with internal state reducers or complex effects.

---

## 3. E2E Testing (Playwright)

### 3.1 Location
All E2E tests are located in `e2e/`.

### 3.2 Principles
- **Black Box**: Test the app as a user. Click buttons, type text, assert UI changes.
- **Resilience**: Use `data-testid` attributes if semantic selectors (text, role) are unstable.
- **Isolation**: Each test should clean up its own data or run in a fresh environment.

### 3.3 Critical Flows
- App Launch & Initialization
- Note Creation & Persistence
- Collection Management
- Settings Updates

---

## 4. Running Tests

```bash
# Run all unit tests
npm run test

# Run unit tests in watch mode
npm run test -- --watch

# Run E2E tests
npm run test:e2e
```

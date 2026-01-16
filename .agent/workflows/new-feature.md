---
description: Workflow for implementing a new feature in Matriarch
---

1. **Plan & Design**
   - [ ] Review `requirements/phase-0.md` to ensure alignment with core principles.
   - [ ] Create an `Implementation Plan` artifact detailing changes.
   - [ ] Define any new IPC channels in `src/shared/api/channels.ts`.
   - [ ] Define any new API contracts in `src/shared/api/contracts.ts`.

2. **Backend Implementation (Main Process)**
   - [ ] Implement the service logic in `src/main/[feature]/[Feature]Service.ts`.
   - [ ] Implement the API handler in `src/main/api/[feature]Api.ts`.
   - [ ] Register the handler in `src/main/api/index.ts`.
   - [ ] Add unit tests in `src/main/api/` (co-located).

3. **Frontend Integration (Preload)**
   - [ ] Expose the new API in `src/preload/index.ts`.
   - [ ] Update `MatriarchApi` interface in `src/shared/api/contracts.ts` if not already done.

4. **Frontend Implementation (Renderer)**
   - [ ] Create UI components in `src/renderer/components/[feature]/`.
   - [ ] Use `window.matriarch.[feature]` to access the API.
   - [ ] Add unit tests for complex components.

5. **Verification**
   - [ ] Run `npm run test` to ensure no regressions.
   - [ ] Manually verify the feature in the running app.
   - [ ] (Optional) Add E2E test in `e2e/` if this is a critical flow.

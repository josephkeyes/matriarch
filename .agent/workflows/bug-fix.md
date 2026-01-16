---
description: Workflow for fixing a bug in Matriarch
---

1. **Reproduction**
   - [ ] Identify the steps to reproduce the issue.
   - [ ] Create a reproduction test case (Unit or E2E) if possible.

2. **Analysis**
   - [ ] Check logs (running the app in terminal shows main process logs).
   - [ ] Inspect the database state if relevant.
   - [ ] Identify if the issue is in Renderer (UI), Main (Logic), or IPC (Communication).

3. **Fix**
   - [ ] Apply the fix.
   - [ ] Ensure `CONVENTIONS.md` are followed (e.g., no direct node access in renderer).

4. **Verification**
   - [ ] Run the reproduction test to verify the fix.
   - [ ] Run `npm run test` to ensure no regressions.
   - [ ] Manually verify the fix in the running app.

---
description: Structured process for reviewing and improving code architecture
---

1. **Scope and Analysis**:
   - Limit the review to a specific subsystem or feature (e.g., "Navigation", "State Management").
   - Analyze the current implementation (`view_file`, `view_file_outline`).
   - Identify "Code Smells":
     - **Tight Coupling**: Are components importing too many specific implementation details?
     - **Disconnected State**: Is the same state duplicated across hooks/components?
     - **Spaghetti Logic**: Is control flow hard to follow?

2. **Problem Definition**:
   - Clearly state the architectural flaw (e.g., "Navigation hook instantiation is duplicated, causing state mismatch").
   - Define the goal (e.g., "Single source of truth for navigation state").

3. **Design Proposal**:
   - Propose a specific pattern to solve the problem (e.g., "Lift state to Context", "Use Event Bus", "Extract Service Layer").
   - **Crucial**: Check if existing patterns (like `contracts.ts` or `EventBus`) can be leveraged.

4. **Implementation Plan**:
   - Create or update `implementation_plan.md`.
   - List specific steps:
     - [NEW] Files to create.
     - [MODIFY] Components to refactor.
     - [DELETE] Legacy code to remove.
   - **User Review**: Pause and ask the user to review the plan via `notify_user` before writing code.

5. **Execution**:
   - **Scaffold**: Create new providers/services first.
   - **Refactor**: Update consumers to use the new system.
   - **Cleanup**: Aggressively remove the old "spaghetti" code. Do not leave dead code.

6. **Verification**:
   - Verify the specific bug/flaw is fixed.
   - Ensure no regressions in related features.
   - Update `walkthrough.md` with the architectural changes.

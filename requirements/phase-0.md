# Matriarch – Phase 0: Foundations & Requirements

## 1. Purpose of Phase 0

Phase 0 establishes the **non-negotiable foundations** of Matriarch before any feature development or coding begins. This document defines the architectural philosophy, system boundaries, and design constraints that all future phases, contributors, and AI agents must adhere to.

This document is intended to:

* Act as a **constitution** for AI agents and human contributors
* Prevent architectural drift
* Ensure long-term readability, flexibility, and extensibility
* Encode decisions explicitly to avoid implicit assumptions

No implementation work may begin until Phase 0 is accepted.

---

## 2. Product Identity & Core Principles

### 2.1 Product Definition

Matriarch is a **local-first, AI-augmented knowledge and task management system**, inspired by Obsidian but opinionated toward:

* Agent-driven organization and automation
* Structured knowledge extraction
* Explicit task-state governance
* Long-term knowledge curation over ad-hoc note-taking

### 2.2 Design Principles (Hard Constraints)

1. **Local-first, Offline-capable**
   The application must function fully offline with zero cloud dependency for core functionality.

2. **AI as a System Actor, Not a Chatbot**
   AI agents are first-class system actors with the ability to mutate state.

3. **Auditability over Explainability**
   Agent actions must be logged and inspectable. Full replayability or rationale generation is not required.

4. **Opinionated but Composable**
   Workflows are intentionally opinionated, but the underlying architecture must remain modular and extensible.

5. **Architecture over Velocity**
   Structural clarity, separation of concerns, and long-term maintainability take precedence over short-term speed.

---

## 3. Platform & Runtime Constraints

### 3.1 Application Shell

* Platform: **Electron**
* Target OS: macOS, Windows, Linux
* Offline-first operation is mandatory

### 3.2 Telemetry & Phone-Home Behavior

* The application may periodically phone home to central servers to report:

  * Install counts
  * Usage metrics
  * Version distribution
* Telemetry must:

  * Fail silently when offline
  * Never block or degrade core functionality
  * Be explicitly separable from core logic

---

## 4. Data & Storage Architecture

### 4.1 Storage Model

* Primary storage layer: **Turso (embedded, offline)**
* Storage is abstracted behind a dedicated data access layer
* No part of the application may directly depend on Turso APIs

### 4.2 Data Ownership & Portability

* Users are not required to manage raw files directly
* The system must support:

  * Exporting notes and tasks to Markdown
  * Bulk export of collections
* Internal storage format is not required to be human-readable

### 4.3 Note Representation

* Notes are logical documents, not files
* Markdown is the canonical **exchange format**, not the source of truth
* Metadata (frontmatter-equivalent) is stored structurally

### 4.4 Graph Model

* There is no standalone graph database
* Graph structure is **derived**, not stored:

  * Links
  * Tags
  * References
  * Shared metadata

---

## 5. AI Agent System

### 5.1 Agent Model

Matriarch uses a **hybrid agent system**:

* Long-running background agents
* On-demand, task-scoped agents
* All agents are coordinated by an **orchestrator**

### 5.2 Agent Authority

Agents are permitted to:

* Modify notes
* Create, update, and delete tasks
* Reorganize collections
* Annotate metadata

There is no hard requirement for user approval before action, but guardrails may be added later.

### 5.3 Agent Auditing

* All agent actions must be logged
* Logs must include:

  * Agent identity
  * Timestamp
  * Action type
  * Affected entities
* Agent rationale is optional
* Agent actions do not require versioning

### 5.4 Versioning

* Documents must be versioned
* Versioning applies to:

  * Notes
  * Tasks
  * Metadata
* Versioning is orthogonal to agent logging

---

## 6. AI Provider Abstraction

### 6.1 Provider Strategy

* **Local-first** (Ollama)
* **Cloud fallback** (user-configured)
* The system must operate fully without cloud models

### 6.2 Model Usage Constraints

* Each agent uses a single model
* Multi-model agents are a future consideration
* Architecture must not preclude future per-agent or per-task model selection

### 6.3 AI Integration Layer

* All AI interactions go through a single abstraction layer
* No agent or feature may call providers directly

---

## 7. Task System Architecture

### 7.1 Task Identity

* Tasks are notes or Markdown-backed documents
* Tasks may:

  * Reference other tasks
  * Depend on other tasks

### 7.2 Task State Machine

* Task state is stored as structured metadata
* Task transitions are governed by an internal state machine
* Agents and users must respect state transition rules

### 7.3 Note–Task Relationship

* Tasks cannot exist independently of documents
* Notes may auto-generate tasks via agents

---

## 8. API & Extensibility

### 8.1 Internal API Layer

Matriarch exposes a formal internal API used by:

* UI layers
* Agents
* Future plugins

No internal module may bypass this API.

### 8.2 Plugin Architecture (Future-Facing)

* Plugin support is not required in early phases
* Architecture must assume:

  * Sandboxed plugins
  * Controlled API access
  * No direct data layer access

---

## 9. UI & Experience Constraints

### 9.1 UX Philosophy

* Opinionated workflows
* AI-first dashboards and command palettes
* No conversational copilots

### 9.2 Target User

* Primary: technical users
* Secondary: mainstream users
* UX should favor power without excluding approachability

---

## 10. Non-Goals (Phase 0 Explicit Exclusions)

* Cloud-first collaboration
* Real-time multi-user editing
* AI explainability frameworks
* Public plugin marketplace
* Mobile clients

---

## 11. Phase 0 Exit Criteria

Phase 0 is complete when:

* This document is accepted as authoritative
* All contributors agree to its constraints
* Future phases reference this document explicitly

No code may be written that violates Phase 0 decisions.

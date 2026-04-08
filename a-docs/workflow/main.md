# A-Society: Workflow Directory

This directory contains A-Society's permanent execution workflows. Each workflow governs a distinct, ongoing operational cadence within the framework. This file is the entry point: load it to orient to the available workflows, then load the relevant workflow file for the work at hand.

---

## Phase-Linked Guidance

These workflow documents are also the delivery surface for phase-specific support docs. When a workflow phase or gate tells a role to read a supporting document, treat that reference as part of the phase definition rather than as optional background reading from the role file.

---

## Available Workflows

### Framework Development

**Summary:** Growing, maintaining, and quality-gating the reusable instruction library — from intake through proposal, review, implementation, and registration.

**File:** `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`

---

### Tooling Development

**Summary:** Implementing and extending the programmatic tooling layer — from Phase 0 documentation gate through component implementation, integration validation, and registration.

**File:** `$A_SOCIETY_WORKFLOW_TOOLING_DEV`

---

### Runtime Development

**Summary:** Designing and building A-Society's programmatic runtime orchestration layer — from Phase 0 TA architecture design through implementation, integration validation, registration, and closure.

**File:** `$A_SOCIETY_WORKFLOW_RUNTIME_DEV`

---

## Multi-domain pattern

**Summary:** Single coordinated flow across framework documentation, tooling, runtime, or other domains — parallel tracks where work is independent until a join.

**Full pattern:** `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN`

---

## Multi-Domain Flows

When work spans multiple role types or implementation domains, design a single flow that routes through all required roles — using parallel tracks where steps are independent. A feature that requires documentation changes, tooling changes, and runtime changes belongs in one flow with the right role sequence, not split into separate flows per work type. See `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN` for the full pattern.

---

## Forward Pass Closure

Every workflow defines a forward pass closure step as the terminal node of its forward pass. This step consolidates all closure obligations for that workflow — log updates, tooling invocations, and verification that all approved tasks have been executed, not merely approved — at the point where they are needed. Each workflow document specifies which obligations apply to it.

---

## Cross-Workflow Routing

The Owner is the cross-workflow routing layer. When a flow closes in one workflow, the Owner determines whether the result triggers a new flow in another, and routes accordingly. Workflows do not hand off directly to each other.

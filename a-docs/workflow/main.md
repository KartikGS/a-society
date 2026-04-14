# A-Society: Workflow Directory

This directory contains A-Society's permanent execution workflows. Each workflow governs a distinct, ongoing operational cadence within the framework. This file is the entry point: load it to orient to the available workflows, then load the relevant workflow file for the work at hand.

---

## Workflow Guidance

These workflow definitions are also the delivery surface for node-linked or phase-specific support docs. When a workflow node, phase, or gate tells a role to read a supporting document, treat that reference as part of the workflow definition rather than as optional background reading from the role file.

---

## Available Workflows

### Framework Development

**Summary:** Growing, maintaining, and quality-gating the reusable instruction library — from intake through proposal, review, implementation, and registration.

**Use it when:** the work targets A-Society's reusable library or documentation surfaces rather than executable implementation.

**File:** `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`

---

### Executable Development

**Summary:** Designing, implementing, validating, and registering A-Society's executable layer — deterministic framework services plus orchestration, with `runtime/` as the standing executable root.

**Use it when:** the work changes executable design, runtime behavior, standing executable contracts, or operator-facing executable references.

**File:** `$A_SOCIETY_WORKFLOW_EXECUTABLE_DEV`

---

## Multi-domain Pattern

**Summary:** Single coordinated flow across framework documentation, executable implementation, and related roles — parallel tracks where work is independent until a join.

**Full pattern:** `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN`

---

## Multi-Domain Flows

When work spans multiple role types or implementation domains, design a single flow that routes through all required roles — using parallel tracks where steps are independent. A feature that requires documentation changes, framework-service changes, and orchestration changes belongs in one flow with the right role sequence, not split into separate flows per work type.

---

## Forward Pass Closure

Every workflow defines a forward pass closure step as the terminal node of its forward pass. This step consolidates all closure obligations for that workflow — log updates, executable verification, and confirmation that all approved tasks have actually been executed.

---

## Cross-Workflow Routing

The Owner is the cross-workflow routing layer. When a flow closes in one workflow, the Owner determines whether the result triggers a new flow in another, and routes accordingly. Workflows do not hand off directly to each other.

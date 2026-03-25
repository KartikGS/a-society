# A-Society: Workflow Directory

This directory contains A-Society's permanent execution workflows. Each workflow governs a distinct, ongoing operational cadence within the framework. This file is the entry point: load it to orient to the available workflows, then load the relevant workflow file for the work at hand.

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

## Session Routing Rules

These rules apply across all A-Society workflows. Each workflow's session model may add workflow-specific routing details; these rules govern the defaults.

**Within an active flow:** Resume the existing session for the receiving role by default. Do not start a new session unless one of the following conditions applies:
- The existing session's context window is full or approaching limits
- The accumulated context from earlier phases would be more noise than signal for the remaining work
- Significant time has passed and the session may have expired

**At flow close:** When a flow completes, start fresh sessions for each role involved in the next flow. The accumulated context from a completed flow is almost always noise for a new one.

**Agents must not pass conditional language to the human** (e.g., "Resume, but start new if none exists"). State the instruction explicitly based on flow state. If a new session is required, provide a copyable session-start prompt.

**Multiple concurrent workflows:** When the identified work requires two or more separate workflow types, the Owner routes them as separate flows for the user to execute independently. The Owner does not orchestrate multiple concurrent flows within a single session.

---

## Forward Pass Closure

Every workflow defines a forward pass closure step as the terminal node of its forward pass. This step consolidates all closure obligations for that workflow — log updates, tooling invocations, and verification that all approved tasks have been executed, not merely approved — at the point where they are needed. Each workflow document specifies which obligations apply to it.

Two rules apply universally at forward pass closure, across all workflows:

- **Current-flow scoping:** backward pass initiation is scoped to the current flow only. Other flows' pending backward pass status is not referenced at this step.
- **Synthesis is terminal:** backward pass synthesis closes the flow unconditionally. If follow-up is identified during synthesis, it is filed as a new trigger input for a separate flow — not routed back into the current flow.

---

## Cross-Workflow Routing

The Owner is the cross-workflow routing layer. When a flow closes in one workflow, the Owner determines whether the result triggers a new flow in another, and routes accordingly. Workflows do not hand off directly to each other.

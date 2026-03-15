---

**Subject:** Tooling-general coupling surface — assessment for a standing change workflow
**Status:** PENDING
**Type:** Brief
**Date:** 2026-03-15
**Recipient:** Technical Architect

---

## Background

The A-Society framework now has two layers that must evolve together:

- `general/` — instructions and templates that agents read. Changes here determine what agents know and what behavior they produce.
- `tooling/` — programmatic components that validate, scaffold, and derive information from the documentation layer. Changes here determine what the tools can verify and enforce.

The current development workflow (Owner → Curator, Phases 1–5) governs `general/` changes only. The tooling implementation workflow (`$A_SOCIETY_TOOLING_ADDENDUM`) governed the one-time construction of the tooling layer. Neither governs ongoing changes that cross both layers simultaneously.

The test run of the Ink project surfaced this gap concretely: three framework fixes were applied to `general/` without any assessment of whether those fixes implied tooling changes. Separately, six tooling components were built without any mechanism to ensure agents know they exist or how to invoke them. The two layers are coupled but have no coupling check in any workflow.

---

## What Is Needed

A standing change workflow — or an extension of the existing workflow — that ensures `general/` and `tooling/` remain consistent as the framework evolves. The human has identified this as a priority before more changes accumulate.

Before the Owner can propose or approve such a workflow, the coupling surface needs to be mapped by someone who knows the tooling architecture. That is the TA's domain.

---

## Requested Output

Produce a **Coupling Surface Assessment** covering three questions. This is a scoped analysis artifact, not a full architecture proposal. Submit to the Owner for review as `02-ta-to-owner.md` in this record folder.

---

### Question 1: What is the current coupling surface?

For each of the six tooling components, identify:

- Which `general/` elements (instructions, templates, variable conventions) it reads from or validates against
- Which `general/` elements it requires agents to know about in order to be invoked correctly
- Whether there is currently a `general/` instruction that describes this component to agents — and if so, where; if not, flag the gap explicitly

The goal is a complete map of: `general/ element X ↔ tooling component Y` — so future changes to either side can be assessed against the other.

---

### Question 2: What types of changes trigger cross-layer impact?

Produce a taxonomy of change types that require both layers to move together. Examples to consider (not exhaustive):

- A new validation rule is added to `general/` that a tool is supposed to enforce
- A new tool is built that agents are supposed to invoke — requiring a `general/` instruction
- An existing tool's interface or behavior changes — requiring the corresponding `general/` instruction to be updated
- A `general/` document changes its structure in a way that the Scaffolding System needs to reflect
- A new consent type is added — requiring both a Consent Utility update and an agents.md instruction update

For each change type: identify which side typically initiates the change (general/ first, or tooling first), and what the other side needs to produce before the change is complete.

---

### Question 3: What would a coupling check require from the tooling layer?

For a future workflow to enforce coupling consistency, some mechanism must detect when a general/ change has an open tooling implication, or when a tooling change has an open general/ implication.

Assess:

- Whether any existing tooling components could be extended to serve this purpose (e.g., the Path Validator already traverses the documentation layer — could it check for the presence of expected tooling instruction sections?)
- Whether a new lightweight component would be warranted, or whether the coupling check is better kept as a workflow gate enforced by agents rather than by a programmatic validator
- What the minimum viable coupling check looks like — what it would need to read, what it would flag, and how an agent would act on its output

Do not propose a full new component design here. A direction recommendation with rationale is sufficient. Full design is a subsequent step if the Owner determines a programmatic check is warranted.

---

## Scope Constraint

This assessment covers the current coupling surface only. Do not redesign the tooling layer, propose new components beyond what Question 3 calls for, or propose governance structure — that is the Owner's responsibility based on your output.

---

## Reference Documents

Read `$A_SOCIETY_TOOLING_PROPOSAL` and `$A_SOCIETY_TOOLING_ADDENDUM` for the component designs. Read `$A_SOCIETY_WORKFLOW` for the current development workflow. Resolve `$VAR` references via `$A_SOCIETY_INDEX`.

---

## TA Confirmation Required

The TA must acknowledge this brief before acting:
- State: "Acknowledged. Beginning Coupling Surface Assessment for tooling-general coupling surface."

The TA does not begin until they have acknowledged in the session.

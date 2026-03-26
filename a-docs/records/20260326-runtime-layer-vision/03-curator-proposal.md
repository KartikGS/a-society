# Curator → Owner: Proposal

---

**Subject:** runtime-layer-vision — Vision and architecture update to acknowledge the runtime layer
**Status:** PROPOSED
**Date:** 2026-03-26

---

## Summary

This proposal covers the prose additions to `$A_SOCIETY_VISION` and `$A_SOCIETY_ARCHITECTURE` as specified in the brief. All insertions follow the brief's specified placement and framing. Two items require Owner resolution before implementation: the layer count in the vision, and the "documentation framework" characterization in the architecture opening. Both are flagged below.

---

## Proposed Changes

### 1. `$A_SOCIETY_VISION` — `a-society/a-docs/project-information/vision.md`

#### 1a. "What A-Society Is" — layer count update

**Current line:**
> A-Society has two work product layers:

**Proposed change:**
> A-Society has four work product layers:

**Rationale:** The current text already has three labeled layer sections (library, active, programmatic tooling) despite saying "two." Adding the runtime makes four. Changing "two" to "four" brings the count into agreement with the actual structure. See Flag 1 below for the discrepancy between this count and the brief's framing.

---

#### 1b. "What A-Society Is" — runtime layer subsection

**Placement:** New paragraph inserted immediately after the programmatic tooling layer paragraph (which ends "…have not yet been implemented."), before the paragraph beginning "Like any project using this framework…"

**Proposed text:**

> **The runtime layer** — a planned layer that will manage agent sessions, context injection, and handoff routing programmatically. Where the documentation layer gives agents the knowledge to operate correctly and the tooling layer makes deterministic operations reliable, the runtime layer moves process choreography from natural-language instruction to programmatic control: session management, context loading, handoff transitions, and backward pass triggers are handled mechanically rather than through agent instruction-following. This frees the in-context budget for behavioral guidance — how agents think, what they review, what quality means. The runtime calls LLM APIs directly and provides its own interface; it is not a plugin for existing editors. Technology: TypeScript/Node.js, consistent with the tooling layer. The natural evolution: the library defines what good looks like, the active agents produce it, the tooling makes deterministic operations reliable, and the runtime orchestrates the whole loop.

---

#### 1c. "Why Roles and Workflows Exist" — runtime acknowledgment

**Placement:** New paragraph inserted between the paragraph ending "…and the quality guarantee they provide." and the paragraph beginning "The investment is in the project setup…"

**Proposed text:**

> The runtime layer is the mechanism by which this compliance becomes structural rather than instructional. When the runtime is deployed, agents follow the workflow because they are routed through it — not because a document told them to. The case for designed workflows holds regardless: structure that is enforced programmatically is still structure that was designed because completeness requires multiple expert perspectives.

---

### 2. `$A_SOCIETY_ARCHITECTURE` — `a-society/a-docs/project-information/architecture.md`

#### 2a. "System Overview" — folder count and runtime entry

**Current line:**
> A-Society has four top-level folders, each with a distinct role:

**Proposed change:**
> A-Society has five top-level folders, each with a distinct role:

**Proposed new bullet** (inserted after the `tooling/` entry, before the `a-docs/` entry):

> - **`runtime/`** — the programmatic orchestration layer. Manages agent sessions end to end: injecting context from role definitions and workflow documents, routing handoffs between sessions, and triggering framework tools automatically. The runtime calls LLM APIs directly and provides its own interface — it is not a plugin for existing editors. Planned; not yet implemented. Technology: TypeScript/Node.js, consistent with the tooling layer.

---

#### 2b. "Architectural Invariants" — Layer Isolation update

The Layer Isolation invariant currently names `general/`, `agents/`, and `tooling/` as work product. The runtime is also work product and should be listed alongside them. Three edits within the Layer Isolation section:

**Edit 1 — opening sentence:**

Current:
> `a-docs/` is documentation about A-Society. `general/`, `agents/`, and `tooling/` are A-Society's work product.

Proposed:
> `a-docs/` is documentation about A-Society. `general/`, `agents/`, `tooling/`, and `runtime/` are A-Society's work product.

**Edit 2 — the "descriptions → products" test:**

Current:
> - The test: "Is this describing A-Society, or is this something A-Society produces?" Descriptions → `a-docs/`. Products → `general/`, `agents/`, or `tooling/`

Proposed:
> - The test: "Is this describing A-Society, or is this something A-Society produces?" Descriptions → `a-docs/`. Products → `general/`, `agents/`, `tooling/`, or `runtime/`

**Edit 3 — secondary placement test:**

Current:
> - The secondary test for work product placement: instructions and templates → `general/`; deployed agents that run on other projects → `agents/`; deterministic executable utilities → `tooling/`

Proposed:
> - The secondary test for work product placement: instructions and templates → `general/`; deployed agents that run on other projects → `agents/`; deterministic executable utilities → `tooling/`; programmatic orchestration and session management → `runtime/`

**Edit 4 — violation examples:**

Current:
> Violation: Placing tooling implementation code in `a-docs/` or `general/`.

Proposed:
> Violation: Placing tooling or runtime implementation code in `a-docs/` or `general/`.

---

## Flags

### Flag 1 — Layer count: discrepancy between proposal and brief framing

The brief describes the runtime as "a third work product layer alongside the library layer and the active layer." This count of three would treat the programmatic tooling layer as something other than a peer work-product layer — either as a component of the active layer, or as a named sub-element that doesn't count toward the top-level tally.

The current vision text has three labeled "**The X layer**" sections despite saying "two." After this change, there will be four. I am proposing "four" to match the structure, but if the Owner's intent is "three" (treating tooling as a sub-element rather than a peer layer), the intro line and the structure of the section may need a different adjustment — for example, nesting the tooling paragraph under the active layer rather than listing it as a peer.

**Owner resolution needed:** Should the vision say "four work product layers" (library, active, tooling, runtime as peers) or "three" (with tooling framed as a component rather than a top-level layer)?

---

### Flag 2 — Architecture opening: "documentation framework" characterization

The architecture document opens with:

> A-Society is a documentation framework, not a software application. Its "system" is a set of folders and files that agents read and write.

With a runtime layer, this characterization is no longer accurate — A-Society will include a programmatic orchestration system that manages sessions and calls LLM APIs. This is software, not just documentation.

The brief does not explicitly ask for this sentence to change. However, leaving it would create an internal inconsistency: the document would simultaneously assert that A-Society is "not a software application" and describe a programmatic runtime that calls LLM APIs directly.

**Owner resolution needed:** Should the opening be updated to reflect A-Society's expanded scope? A minimal correction would be: "A-Society began as a documentation framework, and documentation remains its foundation. Its work product has expanded to include programmatic layers — tooling utilities and a planned runtime — alongside the documentation layer." Or the Owner may prefer a different framing.

---

## Stale Reference Scan — `general/`

No `general/` instruction files contain references to A-Society's layer count or "documentation framework" characterization. The grep found only generic uses of "work product" in unrelated contexts. No flags to raise for `general/`.

---

## Checklist

- [x] Both target files read before drafting
- [x] Proposed text for all three vision insertions
- [x] Proposed text for all architecture edits (folder count, runtime entry, Layer Isolation — four edits)
- [x] Layer count discrepancy flagged (Flag 1)
- [x] Architecture opening tension flagged (Flag 2)
- [x] `general/` stale reference scan complete — nothing to flag
- [x] No `general/` writes proposed
- [x] No `$A_SOCIETY_INDEX` updates needed (no new files created)

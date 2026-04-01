# A-Society Framework Update — 2026-03-31

**Framework Version:** v27.0
**Previous Version:** v26.0

## Summary

Session routing (when to start new vs. resume sessions) is now managed programmatically by the runtime layer. This update removes the session routing instructions, human-as-orchestrator framing, and the `session_action`/`prompt` fields from the machine-readable handoff schema across all framework templates that adopting projects instantiate. Projects that have instantiated role templates or referenced handoff schema fields will need to review their `a-docs/` for consistency.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 3 | Gaps or contradictions in your current `a-docs/` — Curator must review |
| Recommended | 1 | Improvement worth adopting — Curator judgment call |
| Optional | 0 | — |

---

## Changes

### 1. Handoff Output: session-routing item removed from Owner and Curator role templates

**Impact:** Breaking
**Affected artifacts:** [`general/roles/owner.md`], [`general/roles/curator.md`]
**What changed:** Item 1 of the Handoff Output section ("Whether to resume the existing session or start a fresh session…") has been removed from both general role templates, along with the "New session (criteria apply):" format block. The numbered items that follow have been renumbered.
**Why:** Session routing is now determined programmatically by the runtime from flow state. Explicit instructions telling the human when to start or resume sessions are redundant and have been removed from the templates.
**Migration guidance:** In your project's instantiations of `$[PROJECT]_OWNER_ROLE` and `$[PROJECT]_CURATOR_ROLE` (and any other role documents derived from the general templates), check whether item 1 of the Handoff Output section still refers to session-start vs. resume decisions. If it does, remove that item and renumber the remaining items. Also remove any "New session (criteria apply):" format blocks from those role files. Other role documents in your project that have similar session-routing items in their Handoff Output sections should be assessed for the same removal.

---

### 2. Handoff schema: `session_action` and `prompt` fields removed

**Impact:** Breaking
**Affected artifacts:** [`general/instructions/communication/coordination/machine-readable-handoff.md`]
**What changed:** The `session_action` and `prompt` fields have been removed from the machine-readable handoff schema. The schema now contains two fields: `role` and `artifact_path`. The Conditional Constraint section has been removed. The worked examples have been updated to show two-field blocks.
**Why:** The runtime derives session routing from flow state (`flowId + roleKey`). Agents no longer need to signal session action in handoff output; the runtime determines it. The `prompt` field is correspondingly removed.
**Migration guidance:** In your project's `$[PROJECT]_HANDOFF_PROTOCOL` (or equivalent handoff coordination document), find any reference to `session_action` valid values or the conditional constraint on `prompt`. Remove those references and update the cross-reference to `$INSTRUCTION_MACHINE_READABLE_HANDOFF` by removing any clause that mentions "the conditional constraint on `prompt`." Check any handoff block examples in your project's documentation or record artifacts — historical examples are immutable, but any living template or instruction that models handoff blocks should be updated to show two-field blocks (`role` and `artifact_path` only).

---

### 3. Role instruction: session-routing content removed from Section 7 and archetype templates

**Impact:** Breaking
**Affected artifacts:** [`general/instructions/roles/main.md`]
**What changed:** In the mandatory Handoff Output section (Section 7) of the role authoring instruction, the bullet specifying "whether the human should resume an existing session or start a new one" has been removed, along with the session-start prompt clause from the "Copyable inputs" bullet and two explanatory paragraphs. All archetype template Handoff Output sections (Archetypes 1–6) have been updated to remove session-routing items and clauses.
**Why:** Session routing is now runtime-determined. Role documents no longer need to govern or document it.
**Migration guidance:** If your project used the archetype templates in `$INSTRUCTION_ROLES` to author or review role documents, check those role documents for session-routing items in their Handoff Output sections. Specifically: (1) remove any item that tells the human "whether to resume or start a new session"; (2) remove any "if a new session is required, also provide a session-start prompt" clause from the copyable-inputs item; (3) remove the "New session (criteria apply):" format block if present. Renumber remaining items after each removal.

---

### 4. Workflow instruction: "Sessions and the Human Orchestrator" section shortened

**Impact:** Recommended
**Affected artifacts:** [`general/instructions/workflow/main.md`]
**What changed:** Several paragraphs have been removed from the "Sessions and the Human Orchestrator" section: the "human as orchestrator" paragraph, the "current operational model" paragraph, the "session reuse — within a flow" and "session reuse — at flow close" paragraphs, the session-start-prompt bullet from the "Transition behavior" item, and the "Future automation" paragraph. The section now retains only the Session definition, the artifact-path transition-behavior bullet, and the Bidirectional mid-phase exchanges paragraph.
**Why:** The removed content described manual session-lifecycle management responsibilities that are now handled by the runtime.
**Migration guidance:** If your project's workflow document(s) were authored with explicit reference to or verbatim reproduction of the session reuse rules from `$INSTRUCTION_WORKFLOW`, check whether those rules were embedded directly in your workflow documents. If they were, assess whether they should be removed. If your workflow document's "Session Model" section contains language like "resume within a flow, fresh sessions at flow close, no conditional hedging," that language is no longer governed by the framework and may be removed at the Curator's discretion.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.

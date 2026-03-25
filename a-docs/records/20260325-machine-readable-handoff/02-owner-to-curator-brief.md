# Owner → Curator: Briefing

**Subject:** Machine-readable handoff format — new structured schema for agent session handoffs
**Status:** BRIEFED
**Date:** 2026-03-25

---

## Agreed Change

**Files Changed:**
| Target | Action |
|---|---|
| New `general/` instruction file (exact path TBD — see Likely Target) | additive |
| `$A_SOCIETY_INDEX` | additive (new variable row) |
| `$A_SOCIETY_PUBLIC_INDEX` | additive (new public index entry) |
| `$A_SOCIETY_COMM_HANDOFF_PROTOCOL` | assess — Curator determines whether a back-reference is warranted and what form it takes |

All items: `[Requires Owner approval]`

---

**What is changing and why:**

A-Society's handoff output — the instructions an agent produces at a session pause point — is currently natural-language prose. This prose is sufficient for a human reading it and routing the next session manually. It is insufficient for any automated orchestration tool: there is no structured contract a tool can parse to determine which role to invoke next, whether to start a new session or resume, what artifact to pass, or what prompt to use.

The framework's position is that A-Society owns the format contract; orchestrators are platform-specific and outside A-Society's scope. The format contract A-Society defines is what any orchestrator would consume. Without it, each orchestrator must reverse-engineer the format from natural-language prose — a fragile dependency on prose convention rather than a stable, declared schema.

This flow creates a new `general/` instruction that defines a machine-readable handoff schema. Agents emit this schema alongside their natural-language handoff prose at every session pause point. The instruction explains what the schema is, when to emit it, how to emit it, and what each field means. Projects adopt it by incorporating the instruction into their own handoff protocol.

**Starting schema definition:**

The following four-field schema is the defined starting point. The Curator's proposal evaluates this definition and may refine field names, types, or constraints — with explicit rationale for any change. The Curator may also propose additional fields if clearly warranted by the minimum-necessary principle.

```
role:            <string>       # Receiving role name (e.g., "Curator", "Owner")
session_action:  <enum>         # "resume" | "start_new"
artifact_path:   <string>       # Path to the artifact the receiving role reads;
                                # relative to the repository root (consistent with
                                # path conventions in the Handoff Output section
                                # of role documents)
prompt:          <string|null>  # Copyable session-start prompt;
                                # required when session_action = "start_new";
                                # null when session_action = "resume"
```

**What the instruction document must contain:**

1. What the machine-readable handoff format is — a brief, precise definition
2. Why it exists — the orchestration-readiness rationale; A-Society owns the format contract, not the orchestrator
3. When to emit it — at every session pause point where a natural-language handoff is produced
4. How to emit it — the emission mechanism (inline fenced code block or other; Curator to propose with rationale — see Open Questions)
5. The schema — field names, types, valid values, and the conditional constraint on `prompt`
6. A worked example — one complete handoff showing the natural-language prose alongside the machine-readable block
7. How projects adopt it — what adopting a project's a-docs needs to do to incorporate this instruction into their handoff protocol

---

## Scope

**In scope:**
- The new `general/` instruction document (all seven elements listed above)
- Registration in `$A_SOCIETY_INDEX` (new variable) and `$A_SOCIETY_PUBLIC_INDEX`
- Assessment of whether `$A_SOCIETY_COMM_HANDOFF_PROTOCOL` needs a back-reference to the new instruction; if yes, the reference text is in scope for the proposal
- Assessment of whether a tooling validator component is warranted; if yes, filing a new Next Priorities item for a separate Tooling Dev flow

**Out of scope:**
- The orchestrator itself — platform-specific; outside A-Society scope entirely
- The discovery mechanism by which orchestrators find or consume the schema (deferred; depends on distribution model)
- Tooling validator implementation — a separate Tooling Dev flow if the assessment concludes yes
- Modification of `$A_SOCIETY_COMM_HANDOFF_PROTOCOL` beyond a possible back-reference; the existing handoff protocol requirements are not being re-specified

---

## Likely Target

The instruction likely belongs in `general/instructions/communication/coordination/`, alongside the existing coordination instructions, since handoffs are defined in the coordination layer. The Curator should verify this placement against `$A_SOCIETY_STRUCTURE` during proposal formulation and propose an alternative if the governing principle of that folder does not include a format-specification artifact of this type.

---

## Open Questions for the Curator

1. **Serialization format** — YAML is the natural choice for framework consistency (the framework already uses YAML frontmatter in `workflow.md`, record artifacts, and workflow graph docs). JSON is more universally parseable by external tools. Propose one format with rationale; address the tradeoff explicitly.

2. **Emission mode** — should the machine-readable block be emitted inline as a fenced code block within the natural-language handoff prose (most practical; agents already produce handoff prose in a single pass), or should it constitute a separate artifact? Propose with rationale.

3. **Field completeness** — are the four starting fields sufficient, or are additional fields clearly warranted? Apply the minimum-necessary principle: each proposed additional field must have a concrete use case (what an orchestrator would do with it). Proposed field set must remain internally consistent — in particular, any conditional field must state its condition precisely.

4. **Coordination doc coupling** — does `$A_SOCIETY_COMM_HANDOFF_PROTOCOL` need a back-reference to the new instruction? If yes, propose the reference text and the exact insertion point (clause or phrase boundary, not just section name).

5. **Tooling validator assessment** — is a tooling validator component warranted for this schema? A validator would confirm that a handoff block is present and that its fields satisfy the schema constraints. Assess against the tooling layer's criterion: "deterministic, rule-derived operations." If warranted, propose a Next Priorities item; do not scope the implementation here.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for machine-readable handoff format — new structured schema for agent session handoffs."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.

**Update report draft:** This flow carries `[LIB]` scope and is expected to qualify for a framework update report. Include the update report draft as a named section in the proposal submission, following the Phase 1 requirement in `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`. The Owner will review and approve the draft as part of the Phase 2 decision — the content change and update report draft are not reviewed separately. Do not wait for a separate approval cycle for the update report.

Return to Owner when the proposal is complete and filed as the next sequenced artifact in the active record folder.

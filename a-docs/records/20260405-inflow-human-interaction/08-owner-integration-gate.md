**From:** Owner
**To:** Curator
**Subject:** Integration Gate — Approved; Curator Scope Authorization
**Record:** `a-society/a-docs/records/20260405-inflow-human-interaction/`
**Date:** 2026-04-05

---

## Decision

**Approved.** Implementation is faithful to the advisory. Two documentation gaps in `INVOCATION.md` are confirmed by TA integration review. Both are resolved in the Curator registration pass below.

---

## Curator Scope

Implement all items in a single pass. No proposal round is required — the full scope is derived from the approved TA advisory (§5) and the two TA integration findings.

### 1. `a-society/general/instructions/communication/coordination/machine-readable-handoff.md` — `[Curator authority — implement directly]`

Add `type: prompt-human` as a new typed signal form per TA advisory §5:

- **Schema:** `type: prompt-human` (no additional fields)
- **When to emit:** When the agent needs a human reply before continuing — a clarification question, missing input, or approval only the human can provide. The agent writes the question as normal response text and ends with this block.
- **Behavior:** The runtime pauses, prompts the human at the terminal, appends the reply to session history as a user turn, and resumes the same agent session. This may repeat across multiple exchanges until the agent emits a routing handoff.
- **Constraint:** Do not emit `type: prompt-human` when a routing target is already determinable. Use only when the agent genuinely cannot proceed without human input.

Place this alongside the existing `forward-pass-closed` and `meta-analysis-complete` typed signal forms in the schema section.

### 2. `a-society/runtime/INVOCATION.md` — `[Curator authority — implement directly]`

Apply both TA integration findings to the "In-Flow Human Interaction" section:

**Finding 1 — stream-close exit path:** Replace:
> "If the operator enters `exit` or `quit`, the flow status is set to `awaiting_human` and the session is suspended."

With:
> "If the operator enters `exit` or `quit`, or the input stream closes, the flow status is set to `awaiting_human` and the session is suspended."

**Finding 2 — empty-input re-prompt:** Add after the sentence above:
> "Empty input (Enter with no text) re-prompts without advancing the session."

### 3. Update report assessment

After implementation, consult `$A_SOCIETY_UPDATES_PROTOCOL` to determine whether the `machine-readable-handoff.md` addition warrants a framework update report. If warranted, publish to `$A_SOCIETY_UPDATES_DIR` using the filename format `[YYYY-MM-DD]-[brief-descriptor].md`.

### 4. Index registration

Verify whether any newly created or modified files in this flow require registration in `$A_SOCIETY_INDEX` or `$A_SOCIETY_PUBLIC_INDEX`. `runtime/src/` files are implementation details and are not individually indexed; `INVOCATION.md` is already registered.

---

```handoff
role: Curator
artifact_path: a-society/a-docs/records/20260405-inflow-human-interaction/08-owner-integration-gate.md
```

# Owner → Curator: Briefing

**Subject:** Streamlined backward-pass entry path and project log write authority
**Status:** BRIEFED
**Date:** 2026-03-12

---

## Agreed Change

Two `[ADR]` items from the Next Priorities queue. Both require direction decisions resolved here before the Curator can propose. Both are small, targeted additions to existing files — batched because they share no inter-dependencies and both direction decisions are ready.

---

**Item A — Streamlined backward-pass entry path**

The current workflow requires an Owner brief before every Curator proposal — including cases where the backward pass findings from a just-completed flow have already established direction. When the Owner findings in a completed flow explicitly name the target file(s) and fix type, and the Curator's findings are aligned, the brief step adds no information. A four-condition exception should be formalized in `$A_SOCIETY_WORKFLOW`.

**Direction decision:** Adopt the following four-condition gate exactly as specified:

> A Curator may initiate directly at `01-curator-to-owner.md` (without a preceding Owner brief) when ALL of the following are true:
> 1. The trigger is a backward pass finding from a completed flow
> 2. The Owner's findings artifact in that flow explicitly names: the target file(s) AND the fix type (not just the problem)
> 3. The Curator's findings are aligned — same or consistent root cause and direction
> 4. No direction decision is involved — the change is clearly within Curator execution scope

When these conditions are met, the findings artifacts from the prior flow serve as the shared direction record. The Curator creates the record folder and initiates at `01-curator-to-owner.md`. The sequence is otherwise unchanged.

Source of this gate: `$A_SOCIETY_RECORDS/20260311-classification-prespec-prohibition/04-owner-findings.md`.

---

**Item B — Project log write authority**

Neither the Owner role nor the Curator role currently specifies who writes to the project log. Practice has established a natural split; this change formalizes it.

**Direction decision:** Split by log section:
- **Curator** owns: Current State, Recent Focus, Previous, and Archive — the lifecycle entries that record what was done. Curator writes these when a flow closes.
- **Owner** owns: Next Priorities — the direction queue. Owner writes and maintains this section, including adding new items from backward pass findings and removing items when flows close.

---

## Scope

**In scope:**
- `$A_SOCIETY_WORKFLOW` — Add the four-condition backward-pass exception as a named variant of the standard entry path. The Curator should find the appropriate location (likely Phase 1 input conditions or a preamble to Phase 0) and propose language that presents the exception clearly without overstating it.
- `$A_SOCIETY_CURATOR_ROLE` — Add: Curator is responsible for writing and maintaining the project log lifecycle sections (Current State, Recent Focus, Previous, Archive) when a flow closes.
- `$A_SOCIETY_OWNER_ROLE` — Add: Owner is responsible for writing and maintaining the Next Priorities section of the project log, including surfacing new items from backward pass findings and removing items when closed.

**Out of scope:**
- Changes to the log format or lifecycle rules — those are governed by `$A_SOCIETY_LOG` itself and are not affected here.
- Any retroactive application of the streamlined entry path.
- Changes to any `general/` files.

---

> **Responsibility transfer note:** None. Both changes add to existing role files; no authority moves between roles.

---

## Likely Targets

- `$A_SOCIETY_WORKFLOW`
- `$A_SOCIETY_CURATOR_ROLE`
- `$A_SOCIETY_OWNER_ROLE`

---

## Open Questions for the Curator

1. **Item A placement in workflow** — The four-condition gate needs to be placed where agents will encounter it before deciding whether to initiate a flow. The Curator should read `$A_SOCIETY_WORKFLOW` and propose the right insertion point. A preamble to Phase 1 input conditions, or a named section before Phase 0, are both plausible homes — propose whichever is structurally cleanest.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for streamlined backward-pass entry path and project log write authority."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.

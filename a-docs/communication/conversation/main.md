# A-Society: Conversation Artifacts

This folder contains the live handoff files and the permanent templates that define their format. Every inter-agent exchange in the A-Society workflow passes through one of these artifacts.

---

## Artifacts

| File | Type | Direction | Trigger |
|---|---|---|---|
| `TEMPLATE-owner-to-curator-brief.md` | Template | Owner → Curator | Owner and human have aligned on a change; Curator session about to begin |
| `TEMPLATE-curator-to-owner.md` | Template | Curator → Owner | Any proposal submission or update report submission |
| `TEMPLATE-owner-to-curator.md` | Template | Owner → Curator | Any review decision (approved / revise / rejected) |
| `owner-to-curator-brief.md` | Live | Owner → Curator | Current active briefing for Curator |
| `curator-to-owner.md` | Live | Curator → Owner | Current active proposal or update report |
| `owner-to-curator.md` | Live | Owner → Curator | Current active decision |

**Templates** are never modified during use. Agents fill a copy; the template stays unchanged.

**Live artifacts** hold the current unit of work. They are replaced when a new unit of work begins — after a pre-replacement check confirms the prior unit is closed (see `$A_SOCIETY_COMM_HANDOFF_PROTOCOL`).

---

## Lifecycle

```
Owner and human align on a change (Phase 1)
    ↓
Owner fills owner-to-curator-brief.md from template → status: BRIEFED
    ↓
Curator reads brief, acknowledges → status: DRAFT
    ↓
Curator drafts proposal, fills curator-to-owner.md from template → status: PENDING_REVIEW
    ↓
Owner reads, issues decision in owner-to-curator.md → status: APPROVED / REVISE / REJECTED
    ↓
If REVISE: Curator updates curator-to-owner.md and resubmits → status: PENDING_REVIEW
    ↓
If APPROVED: Curator acknowledges, begins implementation
    ↓
Implementation complete → Curator registers files → status: REGISTERED
    ↓
If update report triggered: Curator drafts report, submits via curator-to-owner.md → Owner approves
    ↓
Pre-replacement check passes → live artifacts replaced for next unit of work
```

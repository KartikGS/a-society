# A-Society: Conversation Templates

This folder contains the permanent templates for all A-Society inter-agent conversation artifacts. Artifacts are not created here — they are created in the active record folder (see `$A_SOCIETY_RECORDS`) using these templates as format references.

---

## Templates

| File | Direction | Use When |
|---|---|---|
| `TEMPLATE-owner-to-curator-brief.md` | Owner → Curator | Creating the briefing artifact for a new flow |
| `TEMPLATE-curator-to-owner.md` | Curator → Owner | Submitting a proposal, update report, or maintenance change |
| `TEMPLATE-owner-to-curator.md` | Owner → Curator | Issuing a review decision (approved / revise / rejected) |

Templates are never modified during use. Create from a template into the active record folder at the next sequenced position; the template stays unchanged.

---

## Artifact Lifecycle

All conversation artifacts for a flow are created in that flow's record folder under `$A_SOCIETY_RECORDS`. See `$A_SOCIETY_RECORDS` for the identifier format, sequencing convention, and the canonical artifact sequence for A-Society flows.

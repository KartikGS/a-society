# A-Society: Conversation Templates

This folder contains the permanent templates for all A-Society inter-agent conversation artifacts. Artifacts are not created here — they are created in the runtime-provided active record folder using these templates as format references.

---

## Templates

| File | Direction | Use When |
|---|---|---|
| `TEMPLATE-owner-to-curator-brief.md` | Owner → Curator | Creating the briefing artifact for a new flow |
| `TEMPLATE-curator-to-owner.md` | Curator → Owner | Submitting a proposal or maintenance change |
| `TEMPLATE-owner-to-curator.md` | Owner → Curator | Issuing a review decision (approved / revise / rejected) |

Templates are never modified during use. Create artifacts from templates inside the active record folder; the template stays unchanged.

---

## Artifact Lifecycle

All conversation artifacts for a flow are created in that flow's active record folder under `.a-society/state/<project>/<flow-id>/record/`. See `$A_SOCIETY_RUNTIME_RECORDS_CONTRACT` for record placement, metadata, and writable-scope guidance.

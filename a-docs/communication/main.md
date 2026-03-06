# A-Society: Communication

This folder governs how the Owner and Curator communicate during framework work. It is the connective tissue between the workflow phases and the role documents — neither of which carries the inter-agent communication rules.

---

## Two Layers

### `conversation/`
The artifacts agents exchange: handoff templates, live working files, and the artifact lifecycle. When the Curator submits a proposal or the Owner issues a decision, the artifact lives here.

See `$A_SOCIETY_COMM_CONVERSATION`.

### `coordination/`
The standing rules governing that exchange: the shared status vocabulary, handoff protocol, feedback protocol, and conflict-resolution procedure. These rules do not change per task — they change only when the process changes.

See `$A_SOCIETY_COMM_COORDINATION`.

---

## Who Uses This

**Curator** — reads the handoff template before submitting a proposal or an update report draft. Uses the coordination rules to know what constitutes a valid submission and when to halt.

**Owner** — reads the decision template before issuing an approval, revision request, or rejection. Uses the coordination rules to understand what the Curator is required to confirm before acting.

Both roles use the status vocabulary defined in `coordination/` to describe the state of any work item in any document.

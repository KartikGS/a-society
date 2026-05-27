# A-Society: Communication

This folder contains A-Society's standing communication layer: the templates agents use for inter-role artifacts and the protocols that govern how those artifacts are produced, consumed, corrected, and escalated.

Artifacts created during a flow belong in the active record folder under `$A_SOCIETY_RECORDS`. The communication folder holds the stable references that make those artifacts consistent across flows.

---

## Structure

```text
communication/
|-- main.md
|-- conversation/
`-- coordination/
```

### `conversation/` - `$A_SOCIETY_COMM_CONVERSATION`

Use the conversation layer when drafting or interpreting A-Society handoff artifacts: Owner workflow plans, Owner briefs, Curator proposals or submissions, and Owner decisions.

### `coordination/` - `$A_SOCIETY_COMM_COORDINATION`

Use the coordination layer when evaluating handoff status, reporting a discrepancy in prior work, resolving a conflict, or checking escalation authority.

---

## Boundary

`$A_SOCIETY_WORKFLOW` defines phase order and routing. `$A_SOCIETY_RECORDS` defines where flow artifacts are stored. This communication folder defines the formats and protocols that make those handoffs readable and governable.

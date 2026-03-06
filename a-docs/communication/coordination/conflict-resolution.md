# A-Society: Conflict Resolution

## What This Covers

Conflicts arise when the Owner and Curator reach different conclusions about what should be done, what belongs in the framework, or what a document should say. This protocol defines who has authority over which type of decision and when the human must be consulted.

---

## Authority Matrix

| Decision type | Authority | Notes |
|---|---|---|
| What enters `general/` | Owner | Generalizability test is the Owner's judgment |
| Placement within `a-docs/` | Owner | Governed by `$A_SOCIETY_STRUCTURE` |
| Maintenance changes within existing scope | Curator | No escalation required unless direction is implied |
| Whether a change implies a direction decision | Owner | If Curator is unsure, escalate — do not assume it is maintenance |
| Framework update report: whether to publish | Owner | Owner approves before publication |
| Framework update report: impact classification | Owner | Owner reviews classification; Curator drafts |
| A-Society vision and scope | Human | Neither Owner nor Curator may change these unilaterally |
| New top-level folder creation in `a-society/` | Human | Structural changes at this level require explicit human approval |

---

## Escalation Path

**Curator → Owner:** The Curator raises the conflict in the session, stating the two positions and why they cannot be reconciled by referencing existing documents. The Owner makes the call.

**Owner → Human:** The Owner escalates when:
- The conflict requires a change to the framework's direction or scope
- Two reasonable interpretations of the vision lead to different decisions
- The conflict cannot be resolved by any existing A-Society document
- The resolution would create a precedent that affects projects beyond A-Society

When escalating to the human, the Owner must provide:
1. The two positions in conflict
2. The documents consulted
3. Why the conflict cannot be resolved internally
4. A recommended resolution (the Owner's view), clearly labeled as a recommendation not a decision

---

## Human Escalation Threshold

The human is not a tiebreaker for all disputes — over-escalation creates bottlenecks and signals that the framework's documents are insufficient. The threshold for human escalation is:

**Escalate when:** the decision would shape the direction of the framework, affect the structure of `a-society/` itself, or establish a precedent that adopting projects will follow.

**Do not escalate when:** the conflict is about the correct placement of content within an established structure, the correct format for an artifact, or any decision that can be resolved by reading the existing framework documents carefully.

If the Owner is uncertain whether to escalate, the default is to escalate. Unnecessary escalation is a recoverable mistake; proceeding without authority is not.

---

## Deadlock Resolution

If the Owner and Curator cannot reach agreement after one clarification round, the Owner escalates to the human with both positions stated. The session is paused on the conflicted item until the human responds. Other items may continue if they are not affected by the conflict.

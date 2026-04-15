# Owner Review Behavior

## Outcome Validation

Under the scoped delegation model, the Owner reviews **outcomes against requirements** — not implementation against constraints. Domain leads have design authority within their scope; the Owner validates that the stated requirement was met.

### The Validation Test

For each requirement in the original directive, ask:

1. **Was the requirement met?** Does the outcome achieve what was asked for? Check observable results, not implementation mechanics.
2. **Is the outcome vision-aligned?** Does the result serve the project's core bet? A technically correct outcome that drifts from the vision is still a failure.
3. **Is cross-domain coherence preserved?** When multiple domains worked in parallel, do their outputs tell a consistent story? Documentation and runtime must agree. Index entries and file contents must match.

### What the Owner Does NOT Review

- **Domain-internal implementation quality.** If the Curator chose a particular index structure, or the TA designed a particular interface shape, that is their domain expertise and their accountability. The Owner does not second-guess domain-internal decisions.
- **Implementation approach.** Whether the Curator modified two files or five to meet the documentation requirement is the Curator's design choice. The Owner checks: does the documentation accurately reflect the requirement?
- **Code correctness.** The Owner does not review runtime source for implementation quality. That is the TA's accountability (via integration review) and the developers' accountability (via testing).

### When Deeper Review Is Warranted

The outcome-only default has one exception: when the Owner has evidence that a domain lead's output violates the project vision or a cross-domain invariant, the Owner may investigate deeper. This is the "vision guardrail" — the Owner trusts domain expertise by default but remains the coherence backstop.

If investigation reveals a genuine vision or invariant violation, the Owner sends a corrective requirement-level directive — not implementation-level instructions for how to fix it. The domain lead designs the fix.

---

## Addition Review

When a new artifact is proposed for `general/`:

1. **Generalizability test:** Does this apply to a software project, a writing project, and a research project equally? If not, it belongs in a project-specific folder, not in `general/`.

2. **Abstraction level test:** Is this the right level of abstraction? Too specific (assumes a technology or domain) and it does not belong in `general/`. Too vague (says nothing actionable) and it is not useful.

3. **Duplication test:** Does this overlap with something that already exists? If so, should the existing artifact be extended, or is a new artifact genuinely warranted?

4. **Placement test:** Is this in the right folder? Does the folder's governing principle (per `$A_SOCIETY_STRUCTURE`) include this artifact?

5. **Quality test:** Is this written well enough that an agent unfamiliar with the project could read it and produce a correct artifact? If not, it needs more work before entering the library.

These tests remain the Owner's responsibility because adding to `general/` is a scope decision (coordination-level), not a documentation decision (domain-level).

---

## Review Artifact Quality

When a decision artifact makes a specific claim about current file state — for example, "this paragraph is already standalone" or "this field is not present" — verify that claim by re-reading the relevant passage at review time, not from session-start context. Session-start context may reflect the file as it was when the session opened, not as it exists after prior edits in the same session or in prior sessions. A wrong state claim is wasted instruction that the domain lead must detect and override; re-reading the relevant passage before issuing the claim eliminates the correction round.

When a decision artifact authorizes adding content to an existing shared document, read the target document's relevant section before issuing the authorization to check whether the proposed addition conflicts with existing content. Pre-existing prohibitions, behavioral specifications, or conditional rules in the target document may directly contradict the proposed addition. The state-claim re-reading obligation covers claims made in the artifact; this check covers the inverse case — content already in the target document that would become contradicted once the proposed addition is integrated.

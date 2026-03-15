---
artifact: 06-owner-findings
flow: 20260315-phase7-tooling-completion
from: Owner
to: Curator (synthesis)
---

# Owner — Backward Pass Findings

## What This Covers

The Owner's perspective across the full flow: the direction decision to add a programmatic tooling layer, the approval gate process, role design, and the outcome against the original intent.

---

## What Worked Well

**The step-by-step approach was correct.** The decision to start with TA scoping before any implementation — and to create the TA role before any TA work began — prevented the most common failure mode for large framework changes: building before the design is settled. The proposal-first gate held throughout. No component was built speculatively.

**The deviation escalation protocol produced the right outcomes.** Both Phase 1-2 deviations were improvements over the spec. More importantly, they were accepted through the correct channel — formal TA ruling, spec update, then implementation continues. The alternatives (Developer implements unilaterally, or every deviation requires Owner review) are both worse. The escalation path worked as designed.

**The phase dependency structure reflected real technical dependencies.** Phases 1-2 concurrent with Phase 3, hard dependency before Phase 4, scaffold depending on consent utility — these constraints were not artificial sequencing. They mapped directly onto what had to exist before what. The addendum's phase diagram was correct.

**The manifest as single source of truth is the right design.** The scaffolding system reads the manifest and creates exactly what it declares. Extension happens by updating the manifest, not the code. This is the correct application of the single-source invariant to the tooling layer — the same invariant that governs documentation duplication now governs the scaffolding system's scope.

**The integration test's two-category signal was valuable.** The integration test surfaced framework state drift (missing feedback directories, missing `protocol.md`) as informational findings distinct from tool errors. This is the correct design: the tool reports what it finds; it does not decide what to do about it. Agents consuming the tooling layer need this distinction.

---

## What to Improve

**The Phase 3 TA involvement gap.** The workflow graph schema — which Components 3 and 4 validate — was designed entirely by the Curator and Owner in Phase 3 without TA review. The TA's component designs assumed a schema format that the TA did not define. This worked because the schema was straightforward, but it created a real dependency gap: the TA designed validators for a format the TA never reviewed. **Recommendation:** Any format decision consumed by TA-designed components (schema, file structure, protocol shape) must include the TA in the review loop before the format is finalized. This is not a change to the TA's authority scope — advisory review of a format decision the TA's own components depend on is within the existing TA mandate.

**Spec silence was treated as permission in two places.** The Developer's `source_path`-on-stub decision and the consent-always-routed dispatch rule were both implemented by inference from spec-adjacent context rather than by escalation. The Owner flagged `source_path` as a watch item before Phase 5; despite this flag, the Developer resolved it by inference rather than escalation. The flag did not produce a TA question. **Recommendation:** The Tooling Developer role document should be explicit: spec silence at a named decision point is a required escalation trigger, not a license to infer. "The spec doesn't address this" is the escalation criterion, not the resolution.

**The Phase 0 gate relies entirely on human routing.** The Developer has no automated way to verify Phase 0 has cleared — it relies on the Owner's message at the start of the Developer session. This is acceptable at the current scale. If adoption increases and Developer sessions can be opened by agents without Owner routing, the gate would be invisible. **Observation:** This is not a Phase 7 action item — it is a design constraint to be aware of if the Initializer Agent is ever extended to open tooling sessions. Document this constraint in `$A_SOCIETY_ARCHITECTURE`.

---

## Direction Assessment

The tooling layer's scope was correctly drawn. The six components cover exactly the deterministic, rule-derived parts of the framework: initialization scaffolding, consent file creation, path validation, version comparison, workflow graph validation, and backward pass ordering. None of these required agent judgment to specify — they required agent judgment only to decide they were worth automating. That boundary held throughout.

The agent-invoked model (not CLI tools) was the right choice. It keeps the invocation model consistent with how agents work in practice, avoids adding a build step for non-technical adopters, and means the tooling layer adds no new entry points that human users must learn.

The non-technical adopter benefit is real and was the original motivation. The scaffolding system produces a complete `a-docs/` from the manifest without requiring agents to enumerate files manually or verify their own output. The backward pass orderer eliminates a class of backward pass sequencing errors that are easy to make and hard to notice. These are the right problems to solve programmatically.

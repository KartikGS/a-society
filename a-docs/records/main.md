# A-Society: Records Convention

This document declares A-Society's records structure — the naming convention, artifact sequence, and placement rules for flow-level artifact tracking.

See `$INSTRUCTION_RECORDS` for the general pattern this instantiates.

---

## Identifier Format

`YYYYMMDD-slug`

- `YYYYMMDD` — the date the flow begins (when the Owner creates the record folder at intake)
- `slug` — a short, descriptive kebab-case label for the flow (e.g., `records-infrastructure`, `role-minimum-set`)

If two flows begin on the same calendar date: append a disambiguating suffix to the slug (e.g., `20260308-records-infrastructure`, `20260308-tooling-update`).

The identifier is assigned when the Owner creates the record folder. It does not change after creation.

---

## Artifact Sequence

Within each record folder, artifacts are named with a zero-padded two-digit sequence prefix:

| Artifact | Produced By | Trigger | Must Follow |
|---|---|---|---|
| `owner-workflow-plan.md` | Owner | Flow intake — Phase 0 gate; all tiers | — (first artifact in every flow) |
| `owner-to-curator-brief.md` | Owner | Tier 2/3: plan complete, tier confirmed | `owner-workflow-plan.md` |
| `curator-to-owner.md` (proposal) | Curator | Proposal drafted | Brief; or backward-pass direct-entry conditions met |
| `owner-to-curator.md` | Owner | Review decision issued (Approved / Revise / Rejected) | `curator-to-owner.md` proposal |
| `curator-to-owner.md` (implementation confirmation) | Curator | Implementation and registration complete (Phase 4 exit) | `owner-to-curator.md` with Approved status |
| `[role]-findings.md` (one per participating role) | Each role, per Component 4 traversal order | Backward pass | All forward-pass submissions resolved |

**Tier 1 flows** use a shortened sequence: `owner-workflow-plan.md` (Phase 0 gate) followed by `owner-backward-pass.md` (findings). No brief, proposal, or decision artifacts are produced.

If the Owner issues a Revise decision, the Curator resubmits at the next available position (e.g., `05-curator-to-owner.md`), the Owner re-decides at `06-owner-to-curator.md`, and backward pass findings shift to `07-` and `08-`. The sequence continues as long as the flow requires.

If a flow includes an additional Curator → Owner submission after the main decision artifact, that submission takes the next available sequence slot **before** backward-pass findings. Backward-pass findings always occupy the final positions in the sequence.

**Naming convention for non-standard slots:** Use `NN-[role]-[descriptor].md`, where `[descriptor]` names the artifact type (e.g., `curator-addendum.md`, `owner-addendum.md`). Do not reuse the standard `[role]-to-[role].md` form for non-standard submissions.

**Parallel track sub-labeling:** When the Owner declares parallel tracks at intake, meaning the forward-pass path includes two or more roles working concurrently before a convergence point, the Owner must pre-assign sub-labeled sequence positions for the convergence artifacts expected from those tracks. Use `NNa-`, `NNb-`, and so on (for example, `08a-curator-findings.md`, `08b-developer-findings.md`). The Owner assigns these sub-labels in `workflow.md` and in the record folder convention at intake, before any parallel work begins. This is an intake obligation, not a post-hoc correction after a collision is discovered.

**Owner decision naming distinction:** Use `NN-owner-decision.md` when the Owner is recording a decision and the previously active role has no subsequent action in this flow. Use `NN-owner-to-[role].md` only when the named role has a next action in the flow. Mislabeling a terminal Owner decision as an active handoff creates ambiguity about whether the named role still has pending work in this flow.

**Reference stability:** Do not use hardcoded sequence IDs (e.g., `05-findings.md`) in standing instructions or templates to refer to trailing artifacts like backward-pass findings. Intermediate submissions or revisions will shift their sequence position. Always refer to them by function (e.g., "the backward-pass findings artifact after all submissions have resolved").

**Prerequisite before filing findings:** Confirm all submissions in this flow are resolved — meaning the Owner has responded to every Curator → Owner artifact produced after the main decision. Do not begin backward-pass findings until this check passes.

**Sequence verification before filing any artifact:** Before selecting a sequence number for a new artifact, read the record folder's current contents to identify the actual next available number. Do not derive the number from an expected preceding artifact's position — intermediate submissions (revisions, registration artifacts) filed between the forward pass and the backward pass may have shifted the sequence forward. This applies especially to backward-pass findings: the registration phase may have filed one or more artifacts before the backward pass begins, and a number derived from forward-pass position will collide with those artifacts.

---

## workflow.md — Forward Pass Path

`workflow.md` is a structured YAML file that lives in the record folder alongside the sequenced artifacts. It is not sequenced — it has no `NN-` prefix and does not appear in the artifact sequence table.

**Schema:**

```yaml
---
workflow:
  path:
    - role: <string>         # Role name (parsed by Component 4)
      phase: <string>        # Phase descriptor (human orientation; not parsed by Component 4)
---
```

The YAML content must be wrapped in `---` frontmatter delimiters as shown. The Backward Pass Orderer reads `workflow.md` as YAML frontmatter — a file missing the opening or closing `---` delimiter will cause a parse failure.

**Who creates it:** The Owner, at flow intake, alongside `01-owner-workflow-plan.md`.

**Completeness obligation:** When populating `workflow.md` at intake, the Owner must list every role step they expect, including intermediate Owner review and approval checkpoints between roles. If the Owner will review or approve work before the next non-Owner role acts, that checkpoint must appear as its own Owner entry in `workflow.md`. For example, `TA - Advisory` must be followed by `Owner - TA Review` when the Owner reviews the advisory before the Curator proceeds. No Owner checkpoint may be omitted because it was implied. Silent checkpoints produce `workflow.md` paths that do not match the flow that actually ran, which corrupt backward pass ordering.

**Who can edit it:** The Owner and any role explicitly designated as workflow-authority for this flow. Standard implementer roles do not edit `workflow.md`.

**When it is appended:** When a workflow-authority role defines their portion of the path that the Owner could not specify at intake.

**What Component 4 reads from it:** `workflow.path[].role`. The `phase` field is present for human orientation and is not parsed by Component 4.

**Relationship to the plan's `path` field:** `01-owner-workflow-plan.md` also contains a `path` field — a flat string list combining role and phase descriptor (e.g., `- Owner - Intake & Briefing`). These two representations coexist and serve distinct consumers:

- **Plan `path`** — human-oriented planning reference used for complexity assessment and routing decisions at intake. Not machine-parsed. Combined role + phase strings.
- **`workflow.md` path** — machine-readable schema parsed by Component 4. Structured `role` and `phase` fields. Used to compute backward pass traversal order.

When creating `workflow.md` at intake, populate it from the plan's `path`. The roles listed must be consistent between the two. `workflow.md` is the authoritative source for programmatic backward pass ordering; the plan's `path` governs human-oriented planning only.

**Pre-convention record folders:** Record folders created before the `workflow.md` requirement was established are exempt from that requirement. The absence of `workflow.md` in a pre-convention folder is not a convention violation — it is expected. Component 4 cannot be invoked for these folders; use manual backward pass ordering. Future agents encountering a record folder without `workflow.md` should verify whether the folder predates this requirement before treating the absence as an error.

**Bootstrapping exemption:** When a flow establishes a new record-folder requirement (such as the introduction of `workflow.md` itself), the current flow's record folder is exempt-by-origin from that requirement. The flow that creates a requirement cannot retroactively conform to it. This exemption must be noted explicitly in the flow's artifacts — it must not be handled by silence. An agent encountering this case must either (a) acknowledge the exemption in the initiation artifact and proceed with manual ordering, or (b) create the required file manually for the current folder if conformance is achievable without contradiction.

---

## What Belongs in a Record

- All conversation artifacts for this flow (briefing, proposal, decision, revisions)
- Backward pass findings from all participating roles

Not in a record:
- Templates — these remain in `$A_SOCIETY_COMM_CONVERSATION`
- Implementation work product — files created or modified during Phase 3 live at their own locations

---

## Creating a Record Folder

The Owner creates the record folder at flow intake:

1. Name the folder: `YYYYMMDD-slug`
2. Create `01-owner-workflow-plan.md` from `$A_SOCIETY_COMM_TEMPLATE_PLAN` — this is the Phase 0 gate; it must exist before any other artifact in the folder
3. Create `workflow.md` using the schema in [## workflow.md — Forward Pass Path] above. Populate `workflow.path` from the plan's `path` field. Wrap the YAML content in `---` frontmatter delimiters (opening `---` on line 1, closing `---` after the final field). `workflow.md` is required in any record folder where Component 4 will be invoked during the backward pass.
4. **Tier 2/3 only:** Create `02-owner-to-curator-brief.md` from `$A_SOCIETY_COMM_TEMPLATE_BRIEF`
5. **Tier 2/3 only:** Point the Curator at `02-owner-to-curator-brief.md`

Each subsequent artifact is created at the next available sequence position by the role responsible for it.

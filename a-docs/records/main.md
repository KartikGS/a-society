# A-Society: Records Convention

This document declares A-Society's records structure — the naming convention, artifact sequence, and placement rules for flow-level artifact tracking.

See `$INSTRUCTION_RECORDS` for the general pattern this instantiates.

---

## Record ID Format

`YYYYMMDDTHHmmssSSSZ-xxxxxx`

- `YYYYMMDDTHHmmssSSSZ` — the UTC timestamp when the runtime opens the flow
- `xxxxxx` — a short random hex suffix for collision resistance

The runtime uses this opaque record ID directly as the record folder basename. Human-facing meaning lives in `record.yaml`, not in the folder name.

The record ID is assigned when the runtime creates the record folder. It does not change after creation.

---

## `record.yaml` — Record Metadata

Each record folder contains a non-sequenced `record.yaml` file:

```yaml
record:
  id: <string>
  name: <string|null>
  summary: <string|null>
```

- `record.id` is the durable record identifier and should match the record folder basename for runtime-created A-Society flows
- `record.name` is the human-facing flow title
- `record.summary` is the one-line flow description

The runtime creates `record.yaml` when it opens the flow. When a runtime-drafted `workflow.yaml` later receives a real flow name or summary, the runtime copies those values into `record.yaml` once and then treats the metadata file as the durable record-identity surface.

---

## Artifact Sequence

Within each record folder, sequenced artifacts are named with a zero-padded two-digit prefix: `01-`, `02-`, ... followed by a descriptor. `record.yaml` and `workflow.yaml` are non-sequenced sidecar files and do not consume sequence positions.

**Correction loops do not reserve the originally planned downstream numbers.** The artifact names shown in `workflow.yaml` are planning descriptors, not permanently reserved sequence positions. If a `REVISE` or correction loop consumes the slots originally expected for later phases, resume the remaining forward-pass artifacts at the next available sequence position in the live record folder while keeping the same functional descriptor. For example, a planned `07-owner-to-curator-brief.md` may correctly become `10-owner-to-curator-brief.md` after `07-09` are used by an implementation correction loop.

**Naming convention for non-standard slots:** Use `NN-[role]-[descriptor].md`, where `[descriptor]` names the artifact type (e.g., `curator-addendum.md`, `owner-addendum.md`). Do not reuse the standard `[role]-to-[role].md` form for non-standard submissions.

**Parallel track sub-labeling:** When the Owner declares parallel tracks at intake, meaning the forward-pass path includes two or more roles working concurrently before a convergence point, the workflow-authority role must pre-assign sub-labeled sequence positions for the convergence artifacts expected from those tracks. Use `NNa-`, `NNb-`, and so on (for example, `08a-curator-findings.md`, `08b-developer-findings.md`). The workflow-authority role assigns these sub-labels in `workflow.yaml` and in the record folder convention at intake, before any parallel work begins. This is an intake obligation, not a post-hoc correction after a collision is discovered.

**Reference stability:** Do not use hardcoded sequence IDs (e.g., `05-findings.md`) in standing instructions or templates to refer to trailing artifacts like backward-pass findings. Intermediate submissions or revisions will shift their sequence position. Always refer to them by function (e.g., "the backward-pass findings artifact after all submissions have resolved").

**Sequence verification before filing any artifact:** Before selecting a sequence number for a new artifact, read the record folder's current contents to identify the actual next available number. Do not derive the number from an expected preceding artifact's position — intermediate submissions (revisions, registration artifacts, forward-pass closure artifacts) filed before the artifact you are about to produce may have shifted the sequence forward. This obligation applies at backward pass entry: every role producing findings or synthesis must read the record folder before selecting a sequence number, because forward-pass closure artifacts and registration artifacts may have been filed since the forward pass began.

---

## workflow.yaml — Forward Pass Path

`workflow.yaml` is a structured YAML file that lives in the record folder alongside the sequenced artifacts. It is not sequenced — it has no `NN-` prefix and does not appear in the artifact sequence table.

**Schema:**

```yaml
workflow:
  name: <string>             # Permanent workflow name; include flow identifier when helpful
  summary: <string>          # Optional; one-line workflow summary
  nodes:
    - id: <string>           # Unique node identifier
      role: <string>         # Role name (parsed by Component 4)
      human-collaborative: <string>  # Optional override; usually sourced from the canonical workflow by node id
      required_readings:     # Optional override; usually sourced from the canonical workflow by node id
        - $VARIABLE_NAME
      guidance: [<string>]   # Optional override
      inputs: [<string>]     # Optional override
      work: [<string>]       # Optional override
      outputs: [<string>]    # Optional override
      transitions: [<string>] # Optional override
      notes: [<string>]      # Optional override
  edges:
    - from: <string>         # Node id
      to: <string>           # Node id
      artifact: <string>     # Optional; artifact type carried by this handoff
```

**Who creates it:** The workflow-authority role or runtime intake surface at flow intake, alongside `01-owner-workflow-plan.md`.

**Completeness obligation:** When populating `workflow.yaml` at intake, the workflow-authority role must list every role step they expect, including intermediate Owner review and approval checkpoints between roles. Because the runtime opens the flow at Owner intake today, the first node in any A-Society `workflow.yaml` is currently an Owner intake node. If the Owner will review or approve work before the next non-Owner role acts, that checkpoint must appear as its own Owner node in `workflow.yaml`, with an incoming edge from the preceding node and an outgoing edge to the following node. No review checkpoint may be omitted because it was implied. Silent checkpoints produce `workflow.yaml` paths that do not match the flow that actually ran, which corrupt backward pass ordering.

**Who can edit it:** Any role explicitly designated as workflow-authority for the active flow. Standard implementer roles do not edit `workflow.yaml`.

**When it is appended:** When a workflow-authority role defines their portion of the path that the Owner could not specify at intake.

**What the runtime reads from it:** Component 4 reads `workflow.nodes[].role` and the graph structure in `workflow.nodes[].id` + `workflow.edges` for backward-pass planning. At forward-pass node entry, the runtime uses `workflow.nodes[].id` to resolve the standing node contract from the canonical workflow definition, then applies any override fields present in the record snapshot for that node. Record snapshots should therefore stay minimal by default: path topology first, node-contract overrides only when this flow truly needs them.

**Artifact names in `workflow.yaml` are descriptor-level labels, not frozen numeric filenames.** The `artifact` value documents the intended handoff type at intake. Later `REVISE` or correction loops may shift the live sequence numbering. When that happens, preserve the descriptor and use the next available sequence slot in the record folder rather than trying to restore the originally planned number.

**Relationship to the plan's `path` field:** `01-owner-workflow-plan.md` also contains a `path` field — a flat string list combining role and phase descriptor (e.g., `- Owner - Intake & Briefing`). These two representations coexist and serve distinct consumers:

- **Plan `path`** — human-oriented planning reference used for complexity assessment and routing decisions at intake. Not machine-parsed. Combined role + phase strings.
- **`workflow.yaml`** — machine-readable record snapshot parsed by the runtime. Used to compute backward pass traversal order and to define the active flow path the runtime executes.

When creating `workflow.yaml` at intake, derive the node list and edge structure from the plan's `path`. Each step in the plan's path corresponds to a node; the sequencing and branching structure of the workflow imply the edges. Roles must be consistent between the two representations. Keep node entries minimal by default, typically `id`, `role`, and any needed edge artifacts. Add node-level fields only when the active flow needs an explicit override to the canonical workflow definition. `workflow.yaml` is the authoritative runtime topology snapshot for this flow; the plan's `path` governs human-oriented planning only.

**Pre-convention record folders:** Record folders created before the `workflow.yaml` requirement was established are exempt from that requirement. The absence of `workflow.yaml` in a pre-convention folder is not a convention violation — it is expected. Component 4 cannot be invoked for these folders; use manual backward pass ordering.

**Bootstrapping exemption:** When a flow establishes a new record-folder requirement (such as the introduction of `workflow.yaml` itself), the current flow's record folder is exempt-by-origin from that requirement. The flow that creates a requirement cannot retroactively conform to it. This exemption must be noted explicitly in the flow's artifacts — it must not be handled by silence. An agent encountering this case must either (a) acknowledge the exemption in the initiation artifact and proceed with manual ordering, or (b) create the required file manually for the current folder if conformance is achievable without contradiction.

---

## What Belongs in a Record

- All conversation artifacts for this flow (briefing, proposal, decision, revisions)
- Backward pass findings from all participating roles

Not in a record:
- Templates — these remain in `$A_SOCIETY_COMM_CONVERSATION`
- Implementation work product — files created or modified during Phase 3 live at their own locations

---

## Initializing the Active Record

In runtime-managed A-Society flows, the runtime creates the active record folder at intake and seeds `record.yaml` with the opaque record ID.

The active workflow then determines which artifacts are created inside that folder and which role is responsible for them. Flow-specific intake gates, brief requirements, and routing obligations are defined by `$A_SOCIETY_WORKFLOW` and its linked support documents, not by this records convention.

When a flow uses `workflow.yaml`, the workflow-authority role creates or updates it in this folder using the schema above. Every sequenced artifact created after intake must use the next available sequence position in the live folder.

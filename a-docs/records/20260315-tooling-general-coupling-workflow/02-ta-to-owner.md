---

**Subject:** Coupling Surface Assessment — tooling/general coupling
**Status:** READY FOR OWNER REVIEW
**Type:** Assessment
**Date:** 2026-03-15
**From:** Technical Architect
**Recipient:** Owner

---

## Scope and Method

This assessment covers the current coupling surface between `general/` and the six implemented tooling components. I read every component source file, the manifest (`$GENERAL_MANIFEST`), the public index (`$A_SOCIETY_PUBLIC_INDEX`), the invocation reference (`$A_SOCIETY_TOOLING_INVOCATION`), and the relevant `general/` instructions. The TA assessment from Phase 1–2 was also reviewed to confirm which spec updates were already approved.

---

## Question 1: Current Coupling Surface

The coupling surface has two distinct types of dependency:

**Format dependencies** — `general/` elements whose file format a tool parses programmatically. If the format changes, the tool breaks.

**Invocation dependencies** — `general/` instructions that agents must know about in order to invoke a tool correctly. If the instruction doesn't mention the tool, agents won't invoke it.

These are listed separately because they have different implications for a coupling workflow: format dependencies are discovered when a tool breaks; invocation dependencies are gaps that may never surface as errors — they simply mean agents don't use the tool.

---

### Component 5: Path Validator

**Format dependencies:**
- Both index files (`$A_SOCIETY_PUBLIC_INDEX`, `$A_SOCIETY_INDEX`) — specifically the markdown table format: three columns, column 1 contains `` `$VARIABLE` `` in backticks, column 2 contains the path. The validator's parser relies on this structure: it skips rows without a backtick-wrapped `$`-prefixed variable in column 1, and treats everything in column 2 as the path. A change to the table format (column order, cell formatting, header convention) would require a parser update.

**`general/` elements agents must know to invoke correctly:**
- Both index file paths (public and internal). These are registered in both indexes, so agents can resolve them. No special knowledge is required beyond knowing which index to check.

**Current `general/` instruction that describes this component to agents:**
- None. The tool is registered in `$A_SOCIETY_PUBLIC_INDEX` as `$A_SOCIETY_TOOLING_PATH_VALIDATOR`, and `$A_SOCIETY_TOOLING_INVOCATION` describes how to call it. But no `general/` instruction for index maintenance (e.g., `$INSTRUCTION_INDEX`) mentions running validation as part of any workflow step.

**Gap:** No invocation pointer. An agent performing index maintenance has no instruction directing it to run the validator. The tool exists; agents doing index work won't know to use it.

---

### Component 6: Version Comparator

**Format dependencies:**
- `a-society/VERSION.md` — specifically: the `**Version:** vX.Y` line format (parsed by regex `\*\*Version:\*\*\s*(v\d+\.\d+)`), and the history table with three columns `| Version | Date | Update Report |`. The Update Report column must contain filenames in the `YYYY-MM-DD-slug.md` format for the comparator to extract them.
- `a-docs/a-society-version.md` per project — specifically: the `**Baseline Version:** vX.Y` line, and the Applied Updates table with `Version After` as the first column header, where version cells match `v\d+\.\d+`.

These formats are defined in `$INSTRUCTION_A_SOCIETY_VERSION_RECORD`. The comparator must be updated if either format changes.

**`general/` elements agents must know to invoke correctly:**
- The paths to both files (project version record and framework VERSION.md). These are registered in the indexes. Agents need to know the Version Comparator exists and when to invoke it — specifically, at the start of a Curator migration session to identify which update reports are pending.

**Current `general/` instruction that describes this component to agents:**
- None. `$INSTRUCTION_A_SOCIETY_VERSION_RECORD` tells agents how to read and update the version record manually. It does not mention the Version Comparator. The manifest description for `a-society-version.md` notes it is "used by the Version Comparator (Component 6)" — but this is a manifest field description, not an agent instruction.

**Gap:** No invocation pointer. The Curator performing migration work is the primary agent who would benefit from this tool. Nothing in the instructions for migration or version management directs the Curator to invoke it.

---

### Component 2: Consent Utility

**Format dependencies:**
- `$GENERAL_FEEDBACK_CONSENT` template format — the utility's `renderConsentFile()` function hardcodes the output structure: `# Feedback Consent: [type]`, `**Project:**`, `**Type:**`, `**Consented:**`, `**Date:**`, `**Recorded by:**`, `## What This Covers`, `## Agent Behavior`. The `checkConsent()` function parses `**Consented:**` by regex.
- The three feedback type identifiers (`onboarding`, `migration`, `curator-signal`) and their display names and directory names are hardcoded in `FEEDBACK_TYPES`. These correspond to the three feedback streams described in `$A_SOCIETY_ARCHITECTURE`. Adding a new feedback type requires updating both `$A_SOCIETY_ARCHITECTURE` (stream description) and the `FEEDBACK_TYPES` constant.
- The consent file path convention: `a-docs/feedback/[type]/consent.md`. This is derived from `$INSTRUCTION_CONSENT` and the architecture doc.

**`general/` elements agents must know to invoke correctly:**
- The three feedback type identifiers (available in `FEEDBACK_TYPES` export; agents need to pass the correct key).
- The project's `a-docs/` path (standard, always available).

**Current `general/` instruction that describes this component to agents:**
- None. `$INSTRUCTION_CONSENT` describes how to establish the consent system but does not mention the Consent Utility. `$A_SOCIETY_ARCHITECTURE` (internal doc) mentions it, but that is not a `general/` instruction.

**Gap:** No invocation pointer. An Initializer agent setting up a new project's feedback consent system would do so manually per `$INSTRUCTION_CONSENT`, without knowing the tool exists.

Note: the format co-maintenance dependency (`renderConsentFile()` and `$GENERAL_FEEDBACK_CONSENT` as a co-maintained pair) was approved in the Phase 1–2 TA assessment and is now in the spec. This is the one currently documented format dependency in `general/`.

---

### Component 3: Workflow Graph Validator

**Format dependencies:**
- The YAML frontmatter schema defined in `$INSTRUCTION_WORKFLOW_GRAPH` — specifically: the required presence of `workflow.name`, `workflow.phases` (array, non-empty), `workflow.nodes` (array, non-empty), `workflow.edges` (array); per-element required fields (`id`, `role`, `phase`, `first_occurrence_position`, `is_synthesis_role`); cross-referential constraints (node `phase` must match a declared phase id; edge `from`/`to` must match declared node ids); cardinality constraint (exactly one `is_synthesis_role: true`).
- The YAML frontmatter delimiter convention: triple-dashes at file start, content between first pair of `---` markers. This is defined in `$INSTRUCTION_WORKFLOW_GRAPH` ("Embed as YAML frontmatter at the top of `workflow/main.md`").

The validator and the instruction define the same schema. If the instruction changes (e.g., a new required field is added), the validator must be updated to enforce it.

**`general/` elements agents must know to invoke correctly:**
- The path to the workflow document (`workflow/main.md` in the project's `a-docs/`). Standard; always discoverable.
- The schema itself — already described in `$INSTRUCTION_WORKFLOW_GRAPH`.

**Current `general/` instruction that describes this component to agents:**
- None. `$INSTRUCTION_WORKFLOW_GRAPH` tells agents how to create a valid workflow graph. It does not mention running the validator before considering the graph complete.

**Gap:** No invocation pointer. An agent creating or updating a workflow graph follows `$INSTRUCTION_WORKFLOW_GRAPH` to produce the frontmatter, but is not directed to validate it programmatically. Validation errors are discovered only when Component 4 is invoked and fails.

---

### Component 4: Backward Pass Orderer

**Format dependencies:**
- Same YAML frontmatter schema as Component 3 (this component consumes the output of the validator).
- The backward pass ordering rule defined in the improvement protocol (`$GENERAL_IMPROVEMENT` / `$GENERAL_IMPROVEMENT_PROTOCOL`): non-synthesis roles in reverse first-occurrence order, synthesis role last. The orderer's algorithm directly encodes this rule. If the rule changes, the orderer must be updated.

**`general/` elements agents must know to invoke correctly:**
- The path to the workflow document. Standard.
- Optionally: the list of node ids that fired in this instance (requires the agent to know the node ids declared in the workflow graph).

**Current `general/` instruction that describes this component to agents:**
- None. `$GENERAL_IMPROVEMENT` / `$GENERAL_IMPROVEMENT_PROTOCOL` describe the backward pass ordering rule and how to apply it. Neither mentions the Backward Pass Orderer tool. Agents computing backward pass order follow the improvement protocol manually.

**Gap:** No invocation pointer. This is the most significant missed-use gap: the backward pass is a recurring operation in every workflow cycle. Every A-Society agent session that runs a backward pass is a missed opportunity to use the orderer. Nothing in the improvement instructions tells agents the tool exists.

---

### Component 1: Scaffolding System

**Format dependencies:**
- `$GENERAL_MANIFEST` (`general/manifest.yaml`) — the primary input. The scaffolding system reads the YAML `files` array, requiring each entry to have `path`, `scaffold` (`'copy'` or `'stub'`), and `source_path` fields. The `required` field controls inclusion when `includeOptional: false`.
- All `source_path` values in the manifest pointing to `copy`-type entries: `general/roles/owner.md`, `general/roles/curator.md`, `general/thinking/main.md`, `general/thinking/reasoning.md`, `general/thinking/keep-in-mind.md`, `general/improvement/main.md`, `general/improvement/reports/main.md`, `general/feedback/consent.md`, and the three communication templates. If any of these files is moved, renamed, or deleted, the scaffolding system produces `failed` entries for those items.
- The feedback consent path convention `feedback/[type]/consent.md` — detected internally to route consent file creation through Component 2 rather than a plain copy.

**`general/` elements agents must know to invoke correctly:**
- The manifest path (`$GENERAL_MANIFEST`) — registered in the public index.
- The `a-society/` root path (contextual; always available to agents in the A-Society environment).

**Current `general/` instruction that describes this component to agents:**
- None in the standard `general/instructions/` layer. INVOCATION.md (`$A_SOCIETY_TOOLING_INVOCATION`) describes the full invocation including the manifest-based entry point. The Initializer agent role (`$A_SOCIETY_INITIALIZER`) may reference it, but that is not a `general/` instruction.

**Gap:** No `general/`-layer invocation pointer. The Initializer is the primary consumer, and INVOCATION.md covers it, but the gap is structural: there is no `general/` instruction that closes the loop between "the manifest defines what to create" and "the scaffold creates it."

---

### Coupling Surface Map (Summary)

| general/ element | Format dependency | Tool that depends on it |
|---|---|---|
| Index table format (3-col markdown, `` `$VAR` `` in col 1, path in col 2) | Yes | Component 5: Path Validator |
| `VERSION.md` format (`**Version:** vX.Y`, 3-col history table, `YYYY-MM-DD-slug.md` filenames) | Yes | Component 6: Version Comparator |
| `a-society-version.md` format (`**Baseline Version:** vX.Y`, `Version After` column) | Yes | Component 6: Version Comparator |
| `$GENERAL_FEEDBACK_CONSENT` template format (`**Consented:**` field, section headers) | Yes | Component 2: Consent Utility (`renderConsentFile`, `checkConsent` parser) |
| Feedback type identifiers and directory names (`onboarding`, `migration`, `curator-signal`) | Yes | Component 2: Consent Utility (`FEEDBACK_TYPES` constant) |
| Workflow graph YAML frontmatter schema (per `$INSTRUCTION_WORKFLOW_GRAPH`) | Yes | Component 3: Workflow Graph Validator (enforces it); Component 4: Backward Pass Orderer (consumes it) |
| Backward pass ordering rule (per `$GENERAL_IMPROVEMENT_PROTOCOL`) | Yes | Component 4: Backward Pass Orderer (encodes the rule) |
| `$GENERAL_MANIFEST` file format (`files` array, `path`/`scaffold`/`source_path`/`required` fields) | Yes | Component 1: Scaffolding System |
| All `copy`-type `source_path` files in the manifest | Yes | Component 1: Scaffolding System (reads them at scaffold time) |

| general/ instruction | Invocation gap | Tool that should be mentioned |
|---|---|---|
| `$INSTRUCTION_INDEX` (or index-related maintenance context) | Yes | Component 5: Path Validator — not mentioned |
| `$INSTRUCTION_A_SOCIETY_VERSION_RECORD` | Yes | Component 6: Version Comparator — not mentioned |
| `$INSTRUCTION_CONSENT` | Yes | Component 2: Consent Utility — not mentioned |
| `$INSTRUCTION_WORKFLOW_GRAPH` | Yes | Component 3: Workflow Graph Validator — not mentioned |
| `$GENERAL_IMPROVEMENT_PROTOCOL` (improvement/backward pass context) | Yes | Component 4: Backward Pass Orderer — not mentioned |
| Initializer context (no `general/` instruction covers Initializer invocation flow) | Yes | Component 1: Scaffolding System — not mentioned in any `general/` instruction |

**Summary:** All six components have invocation gaps. All nine format dependencies are currently undocumented as standing co-maintenance contracts (with the single exception of the Component 2 / `$GENERAL_FEEDBACK_CONSENT` co-maintenance pair, which was established in the Phase 1–2 TA assessment and is now in the spec).

---

## Question 2: Taxonomy of Change Types That Trigger Cross-Layer Impact

For each type, I identify which side typically initiates the change and what the other side must produce.

---

### Type A: A `general/` format changes that a tool parses

**Examples:** consent file template adds a new field; index table gains a fourth column; version record format changes; workflow graph schema adds a required field; improvement protocol changes the backward pass ordering rule; manifest YAML adds a required entry field.

**Initiates:** `general/` first (Owner/Curator proposal, review, approval, implementation).

**Other side needs:** The affected tooling component updated to parse or produce the new format. Specifically: the format co-maintenance contract must be identified at the time the `general/` change is proposed so the tooling update is scoped before the change is approved — not discovered afterward when the tool breaks.

**Note on the reverse:** A format change that originates in a tooling refactor (e.g., the path validator wants to handle a wider range of index formats) is not within Developer authority — that requires a `general/` format decision, which is Owner-scoped.

---

### Type B: A new tool is built that agents should invoke

**Examples:** All six current components when first deployed. Any future component.

**Initiates:** Tooling first (designed by TA, approved by Owner, implemented by Developer).

**Other side needs:** A `general/` instruction update (or new instruction) that tells agents in the relevant context to invoke the tool. This is the gap the brief identified: six tools were built without any `general/` instruction updates directing agents to use them.

**Who owns the `general/` update:** Curator drafts, Owner approves, per the standard workflow. The TA specifies which instruction(s) need updating as part of the component design or integration documentation.

---

### Type C: An existing tool's interface or behavior changes

**Examples:** Component 6's `_updatesDir` parameter is removed; Component 3 adds a new validation rule; Component 1 adds a new scaffold type.

**Initiates:** Tooling (Developer raises, TA reviews, Owner approves deviation or design change).

**Other side needs:** INVOCATION.md updated. If any `general/` instruction references the old interface, it must also be updated. Currently no `general/` instructions reference tool interfaces, so INVOCATION.md is the only affected document. Once invocation gaps are closed (Type B above), every `general/` instruction that references a tool becomes a secondary update target whenever that tool's interface changes.

**Implication:** Closing invocation gaps (Type B) creates new Type C coupling. The assessment recommends noting this in any workflow that introduces invocation pointers.

---

### Type D: A `general/` document changes structure in a way the Scaffolding System must reflect

**Examples:** A new template file is added to `general/`; an existing template file is renamed or moved; a new artifact type is defined in `general/instructions/`.

**Initiates:** `general/` first.

**Other side needs:** `$GENERAL_MANIFEST` updated (new entry or source_path corrected). The Scaffolding System itself requires no code change unless the manifest YAML format changes (Type A). But a `general/` change that doesn't update the manifest causes silent gaps: the scaffold creates an incomplete `a-docs/`. The manifest header documents this obligation ("update this file when a new artifact type is added"), but no `general/` change workflow currently includes "check manifest" as a step.

**Note:** The manifest is the single source of truth for what the scaffold creates. It is the most maintenance-sensitive coupling point because every addition to `general/` is a potential manifest update trigger.

---

### Type E: A new consent type is added

**Examples:** A new feedback stream is established (e.g., an adopter-improvement stream).

**Initiates:** Either side can initiate. More likely: Owner/human decides on the new feedback stream (`general/` first), then tooling must follow.

**Other side needs:** All of the following must move together:
1. `$GENERAL_FEEDBACK_CONSENT` updated or confirmed compatible with the new type
2. `$A_SOCIETY_ARCHITECTURE` updated with the new stream description
3. Consent Utility's `FEEDBACK_TYPES` constant updated (new key, display name, directory name, description)
4. `$GENERAL_MANIFEST` updated with a new consent file entry for the new type
5. `$INSTRUCTION_CONSENT` updated to mention the new type

This is the highest-coordination change type because it touches the most coupling points simultaneously.

---

### Type F: The backward pass protocol rule changes

**Examples:** The rule for handling roles that appear zero times in a workflow instance changes; a new exception is added.

**Initiates:** `general/` first (improvement protocol document updated by Owner/Curator).

**Other side needs:** Backward Pass Orderer algorithm updated. Because the orderer encodes the rule in code (not by reading the prose), it will not automatically reflect a prose change. The orderer's correctness must be verified against the updated rule before the protocol change is considered complete.

---

### Summary Table

| Change type | Initiating side | Other side must produce | Currently documented? |
|---|---|---|---|
| A: `general/` format change (parsed by tool) | `general/` | Tooling component updated | Partially — only for Component 2 (TA assessment). Others undocumented. |
| B: New tool built, agents should invoke | Tooling | `general/` instruction update naming the tool | No — all six current components lack this. |
| C: Existing tool interface/behavior changes | Tooling | INVOCATION.md + any `general/` instructions referencing it | Partially — INVOCATION.md covers it; no `general/` instructions reference interfaces yet. |
| D: `general/` structural change affecting manifest | `general/` | Manifest updated | Partially — manifest header states the obligation; no workflow step enforces it. |
| E: New consent type added | Either (Owner/human decides) | All five items above (multi-point change) | No — no consolidated procedure. |
| F: Backward pass protocol rule changes | `general/` | Backward Pass Orderer updated | No — undocumented dependency. |

---

## Question 3: What a Coupling Check Would Require from the Tooling Layer

### Assessment of extending existing components

**Path Validator extension:** The validator currently checks file existence. It could theoretically be extended to check for the *presence* of specific tooling sections in `general/` instruction files — e.g., checking whether `$INSTRUCTION_CONSENT` contains a reference to the Consent Utility. This would require:
1. A machine-readable definition of what each instruction file should contain (hardcoded expected strings, or a separate registry)
2. Content parsing rather than existence checking — significantly more complex
3. Maintenance of the expected-strings registry whenever invocation language changes

The result would be a coupling checker that is itself tightly coupled to the exact language used in instructions, creating a third artifact that can drift. The cost exceeds the benefit at current scale. Not recommended.

**More useful Path Validator extension:** A narrower extension — checking whether tooling paths registered in `$A_SOCIETY_PUBLIC_INDEX` are consistently referenced in the internal index and vice versa — is lower-complexity and addresses index-level coupling. This is a watch item for future consideration, not an immediate need.

### Assessment of a new lightweight component

A dedicated coupling checker — a tool that reads the coupling map and verifies that each documented dependency is satisfied in both directions — is architecturally sound but has a prerequisite: the coupling map must be a machine-readable artifact, not a prose table. Maintaining a machine-readable coupling map adds a third artifact alongside `general/` and `tooling/` that must be kept current. At six components, this is overhead without proportionate benefit.

A programmatic coupling checker becomes warranted when the coupling surface grows large enough that agent review is unreliable — approximately 20+ dependencies, or when tooling and `general/` are changing rapidly enough to outpace manual review. That threshold has not been reached.

### Recommendation: agent-enforced workflow gate

The minimum viable coupling check is a two-part addition to the existing workflow, backed by a standing coupling map artifact:

**Part 1 — The coupling map artifact.** The Q1 tables in this document serve as the coupling map. This should be extracted from this assessment and maintained as a standing reference (suggested path: `a-society/a-docs/tooling-general-coupling-map.md`). It lists, for each tooling component: (a) which `general/` formats it depends on, and (b) whether a `general/` instruction currently directs agents to invoke it. It is updated whenever Q1's answer changes — i.e., whenever a Type A, B, C, D, E, or F change is completed.

**Part 2 — Workflow gate additions.** Two places in the existing workflow:

*For `general/` changes (Phase 2 — Owner review):* Add a coupling check step: before approving a `general/` proposal, the Owner checks the coupling map for whether the proposed element appears as a format dependency for any tooling component. If it does, the proposal is not approvable until a tooling update is scoped and the scope is documented in the record. The tooling update goes through the TA (as design/scope work) and Developer (as implementation) per the existing tooling modification path.

*For tooling changes (TA advisory phase — currently informally defined):* Extend the TA's review scope: whenever a tooling deviation or design change is reviewed, check whether the affected component's invocation pointer exists in `general/` (per the coupling map's invocation gap column). If not, note it as an open item for Curator follow-up. This is not a hard blocker on tooling changes, but it is a standing gap to surface rather than allow to accumulate.

**What the coupling check would read:** The coupling map artifact (`tooling-general-coupling-map.md`) — a prose document with two tables (format dependencies and invocation gaps), maintained by the Curator as part of Phase 7 registration after any cross-layer change.

**What it would flag:** Any `general/` proposal that touches a format dependency without a scoped tooling update; any tooling completion that doesn't have an associated invocation pointer in `general/`.

**How an agent would act on output:** Owner pauses Phase 2 approval until the tooling implication is scoped. TA notes the invocation gap as a standing item. Neither is a hard stop — they are coordination checks.

---

## Scope Note

This assessment covers the current coupling surface as built. I have not proposed new components beyond what Question 3 called for, and I have not proposed governance structure. The standing workflow additions in Question 3 are a direction recommendation only — full design is the Owner's responsibility based on this output.

---

## Readiness

This assessment is ready for Owner review.

Record folder: `a-society/a-docs/records/20260315-tooling-general-coupling-workflow/`
This artifact: `02-ta-to-owner.md`

---

*Produced by: Technical Architect. No implementation changes made or recommended.*

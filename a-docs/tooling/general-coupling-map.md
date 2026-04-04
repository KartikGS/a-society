# A-Society: Tooling/General Coupling Map

This document is the standing reference for the coupling surface between `a-society/tooling/` and `a-society/general/`. It records two things:

1. **Format dependencies** — which framework elements (in `general/` or `a-docs/`) each tooling component parses programmatically, such that a format change would break the component
2. **Invocation status** — whether a `general/` instruction currently directs agents to invoke each component

Updated as part of Phase 7 (Registration) in the tooling workflow after any change classified as Type A, B, C, D, E, or F in the taxonomy section below.

**Who uses this document:**
- **Owner** — checks the format dependency table at Phase 2 (Coupling Test) before approving any `general/` proposal
- **Technical Architect** — checks the invocation gap column when reviewing any tooling deviation or change; notes open gaps as standing open items in advisory output

---

## Format Dependencies

Note: rows annotated `[a-docs]` represent co-maintenance dependencies on `a-docs/` files rather than `general/` elements. These are tracked in this table because they require the same update discipline: when the referenced `a-docs/` artifact changes its schema or field structure, the dependent tooling component's validation constants must be updated to match.

| `general/` or `[a-docs]` element | Format dependency | Component that depends on it |
|---|---|---|
| Index table format (3-col markdown, `` `$VAR` `` in col 1, path in col 2) | Yes | Component 5: Path Validator |
| `VERSION.md` format (`**Version:** vX.Y`, 3-col history table, `YYYY-MM-DD-slug.md` filenames) | Yes | Component 6: Version Comparator |
| `a-society-version.md` format (`**Baseline Version:** vX.Y`, `Version After` column) | Yes | Component 6: Version Comparator |
| `$GENERAL_FEEDBACK_CONSENT` template format (`**Consented:**` field, section headers) | Yes | Component 2: Consent Utility (`renderConsentFile`, `checkConsent` parser) |
| Feedback type identifiers and directory names (`onboarding`, `migration`, `curator-signal`) | Yes | Component 2: Consent Utility (`FEEDBACK_TYPES` constant) |
| Workflow graph YAML frontmatter schema (per `$INSTRUCTION_WORKFLOW_GRAPH`): `workflow.name`, `workflow.nodes[].id`, `workflow.nodes[].role`, optional `workflow.nodes[].human-collaborative` (non-empty string when present), `workflow.edges[].from`, `workflow.edges[].to`, optional `workflow.edges[].artifact`; removed `workflow.phases`, `workflow.nodes[].phase`, `workflow.nodes[].first_occurrence_position`, `workflow.nodes[].is_synthesis_role` | Yes | Component 3: Workflow Graph Validator (enforces it) |
| Project-specific improvement phase file convention `[a-docs]`: `[projectRoot]/a-docs/improvement/meta-analysis.md` and `[projectRoot]/a-docs/improvement/synthesis.md` are the runtime injection targets; `$GENERAL_IMPROVEMENT_META_ANALYSIS` and `$GENERAL_IMPROVEMENT_SYNTHESIS` remain templates only | Yes | `runtime/src/improvement.ts` |
| `workflow.md` YAML frontmatter schema in record folder `[a-docs]`: `workflow.name` (string, optional), `workflow.nodes[].id` (string, required), `workflow.nodes[].role` (string, required), `workflow.nodes[].human-collaborative` (string, optional), `workflow.edges[].from` (string, required), `workflow.edges[].to` (string, required), `workflow.edges[].artifact` (string, optional); removed `workflow.path[]`. | Yes | Component 4: Backward Pass Orderer |
| `$GENERAL_MANIFEST` file format (`files` array, `path`/`scaffold`/`source_path`/`required` fields) | Yes | Component 1: Scaffolding System |
| All `copy`-type `source_path` files in the manifest | Yes | Component 1: Scaffolding System (reads them at scaffold time) |

**Type A status note (2026-03-22):** Component 3 alignment for optional `workflow.nodes[].human-collaborative` is fully complete. Implementation alignment was completed 2026-03-21; documentation parity in `$INSTRUCTION_WORKFLOW_GRAPH` was completed 2026-03-22 (general-lib-sync-bundle flow).

---

## Invocation Status

| `general/` instruction | Component that should be mentioned | Invocation Status |
|---|---|---|
| `$INSTRUCTION_INDEX` (index maintenance context) | Component 5: Path Validator | Closed (2026-03-15) |
| `$INSTRUCTION_A_SOCIETY_VERSION_RECORD` | Component 6: Version Comparator | Closed (2026-03-15) |
| `$INSTRUCTION_CONSENT` | Component 2: Consent Utility | Closed (2026-03-15) |
| `$INSTRUCTION_WORKFLOW_GRAPH` | Component 3: Workflow Graph Validator | Closed (2026-03-15) |
| `$GENERAL_IMPROVEMENT` (improvement/backward pass context) | Component 4: Backward Pass Orderer | Closed (2026-03-15); Type C updates: 2026-03-18, 2026-03-20, 2026-03-22, 2026-04-02, 2026-04-04 (Closed via runtime library shift) |
| Initializer context (`$A_SOCIETY_INITIALIZER`, Phase 3) | Component 1: Scaffolding System | Closed (2026-03-15) |

**Type C status note (2026-04-04):** Component 4 interface updated. `computeBackwardPassPlan`, `buildBackwardPassPlan`, `locateFindingsFiles`, and `locateAllFindingsFiles` added; `orderWithPromptsFromFile` and `computeBackwardPassOrder` removed. Component 4 is now a runtime library and is not invoked directly by agents. No new invocation gap is introduced.

---

## Change Taxonomy

This document is updated after any of the following change types. The change type determines which rows are affected.

| Type | Description | Initiating side | What the other side must produce |
|---|---|---|---|
| **A** | A `general/` format changes that a tool parses | `general/` | Affected tooling component updated to parse or produce the new format |
| **B** | A new tool is built that agents should invoke | Tooling | (1) `$A_SOCIETY_TOOLING_INVOCATION` updated with the new component's invocation entry; (2) a `general/` instruction updated or created naming the tool and directing agents to invoke it. Note: Component 5 (Path Validator) validates all entries in `$A_SOCIETY_TOOLING_INVOCATION` — a component not registered there will fail Path Validator checks. |
| **C** | An existing tool's interface or behavior changes | Tooling | `$A_SOCIETY_TOOLING_INVOCATION` updated; any `general/` instructions referencing the old interface updated |
| **D** | A `general/` document changes structure in a way the Scaffolding System must reflect | `general/` | `$GENERAL_MANIFEST` updated (new entry or corrected `source_path`) |
| **E** | A new consent type is added | Either (Owner/human decides) | All five items: `$GENERAL_FEEDBACK_CONSENT` confirmed compatible; `$A_SOCIETY_ARCHITECTURE` updated; Consent Utility `FEEDBACK_TYPES` constant updated; `$GENERAL_MANIFEST` updated; `$INSTRUCTION_CONSENT` updated |
| **F** | The backward pass protocol rule changes | `general/` | Backward Pass Orderer algorithm updated and verified against the updated rule |

**Maintenance instruction:** When a Type A–F change completes, the Curator updates this document in Phase 7 (Registration): add, remove, or revise rows in the format dependency table and invocation status table as appropriate. The change type column above identifies which table(s) are affected.

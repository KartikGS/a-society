# A-Society: Executable/General Coupling Map

This document is the standing reference for the coupling surface between A-Society's executable layer and its maintained documentation surfaces. It records:

1. format dependencies — which `general/` or `a-docs/` elements each executable capability depends on
2. guidance status — whether the relevant maintained guidance surfaces refer to that capability in project-agnostic, capability-based terms

---

## Format Dependencies

| Element | Dependency | Executable capability |
|---|---|---|
| Index table format | Yes | Path validation |
| `VERSION.md` format | Yes | Update comparison |
| `a-society-version.md` format | Yes | Update comparison |
| `$GENERAL_FEEDBACK_CONSENT` template format | Yes | Consent handling |
| Feedback type identifiers and directory names | Yes | Consent handling |
| Workflow graph YAML frontmatter schema | Yes | Workflow graph validation |
| Record-folder `workflow.yaml` schema | Yes | Backward-pass planning |
| `$GENERAL_MANIFEST` file format and `copy` source paths | Yes | Scaffolding |
| `a-docs/roles/<role-id>/required-readings.yaml` schema | Yes | Runtime context injection |

Rows that depend on `a-docs/` content are still standing executable dependencies and require the same co-maintenance discipline as `general/` format changes.

---

## Guidance Status

| Maintained guidance surface | Executable capability | Status |
|---|---|---|
| `$INSTRUCTION_INDEX` | Path validation | Closed — capability wording plus manual fallback |
| `$INSTRUCTION_A_SOCIETY_VERSION_RECORD` | Update comparison | Closed — capability wording plus manual fallback |
| `$INSTRUCTION_CONSENT` | Consent handling | Closed — capability wording plus manual fallback |
| `$INSTRUCTION_WORKFLOW_GRAPH` | Workflow graph validation / backward-pass planning | Closed — generic executable-capability wording |
| `$INSTRUCTION_WORKFLOW_MODIFY` | Backward-pass planning | Closed — capability wording plus manual fallback |
| `$INSTRUCTION_WORKFLOW_COMPLEXITY` | Backward-pass planning | Closed — capability wording plus manual fallback |
| `$INSTRUCTION_RECORDS` | Backward-pass planning | Closed — generic executable-capability wording |
| `$A_SOCIETY_RUNTIME_INVOCATION` | Operator-facing executable behavior | Closed — sole surviving default operator-facing reference |

---

## Change Taxonomy

| Type | Description | Initiating side | Required follow-through |
|---|---|---|---|
| **A** | A maintained format changes that an executable capability parses | `general/` or `a-docs/` | Affected executable implementation updated |
| **B** | A new standing executable capability is added | Executable layer | Coupling-map row added; standing guidance updated where relevant; operator reference added only if explicitly approved |
| **C** | An existing executable capability changes interface or behavior | Executable layer | Coupling-map row updated; affected guidance surfaces updated |
| **D** | A maintained document changes structure in a way scaffolding or runtime injection must reflect | `general/` or `a-docs/` | Executable implementation and coupling rows updated |
| **E** | A new consent or feedback contract is added | Either | Consent handling, manifest, and consent guidance updated together |
| **F** | The backward-pass contract changes | `general/` or `a-docs/` | Backward-pass planning updated together |

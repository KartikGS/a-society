# Backward Pass Synthesis: Curator — 20260328-runtime-tool-calling

**Date:** 2026-03-28
**Task Reference:** `20260328-runtime-tool-calling`
**Role:** Curator (Synthesis)

---

## Findings Reviewed

Four artifacts:
- `12-curator-findings.md` — four findings: registration/log ownership conflict, technical-summary factual drift, sequence-collision confirmation, and a generalizable summary-discipline signal.
- `13-runtime-developer-findings.md` — four findings: typed parse-error gap, no-tool-path fallback gap, constructor-threading friction, and the general extraction-error pattern.
- `14-ta-findings.md` — five ranked findings: typed parse-error gap, unspecified no-tool error path, a reported Component 4 synthesis-role defect, advisory-standard gap, and the generalizable extraction-error pattern.
- `15-owner-findings.md` — four ranked findings: Owner review gap on data-extraction types and non-happy-path behavior, resolution of the Component 4 issue as invocation error rather than component defect, provider error re-wrapping, and the Curator/Owner log-boundary clarification.

---

## Items Actioned Directly (a-docs/)

### 1. Runtime workflow registration/log boundary — `$A_SOCIETY_WORKFLOW_RUNTIME_DEV`

**Finding:** The Registration Phase described Curator registration work but did not explicitly exclude the project log's `Recent Focus` entry, which created overlap with the Owner's Forward Pass Closure responsibility.
**Source:** `12-curator-findings.md` (Finding 1); `15-owner-findings.md` (Finding 4).
**Fix applied:** Registration Phase now states explicitly that registration does not include writing the closing flow's `Recent Focus` entry; that summary is written by the Owner during Forward Pass Closure.

### 2. Curator role boundary and summary discipline — `$A_SOCIETY_CURATOR_ROLE`

**Finding:** Two Curator-side gaps surfaced: the role document did not explicitly exclude writing the closing flow's `Recent Focus` entry, and technical summaries drifted into generic terminology instead of using approved project-specific names.
**Source:** `12-curator-findings.md` (Findings 1 and 2); `15-owner-findings.md` (Finding 4).
**Fix applied:** `$A_SOCIETY_CURATOR_ROLE` now explicitly states that the Curator does not write the closing flow's `Recent Focus` entry during registration, and its Implementation Practices now require verbatim retrieval of exact type names, method signatures, and methodology terms when producing technical summaries.

### 3. Owner review and invocation discipline — `$A_SOCIETY_OWNER_ROLE`

**Finding:** The Owner review criteria did not explicitly require checking whether parsed-model-output types represent parse failure, and the role file did not state that tooling invocations at Forward Pass Closure must be taken from `$A_SOCIETY_TOOLING_INVOCATION` rather than reconstructed from memory.
**Source:** `15-owner-findings.md` (Findings 1 and 2).
**Fix applied:** `$A_SOCIETY_OWNER_ROLE` now includes a data-extraction type coverage check in TA Advisory Review and a Forward Pass Closure discipline section requiring documented tooling invocations, including the required `synthesisRole` argument for `orderWithPromptsFromFile`.

### 4. Technical Architect advisory standard: typed parse-failure state — `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`

**Finding:** The TA advisory standards did not require typed parse-failure representation for data extracted from model output, which permitted the `_parseError` sentinel workaround.
**Source:** `13-runtime-developer-findings.md` (Finding 1 / 4.1); `14-ta-findings.md` (Findings 1 and 4); `15-owner-findings.md` (Finding 1).
**Fix applied:** `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` Advisory Standards now require data-extraction types to model the unparseable state explicitly rather than hiding it in sentinel payload keys.

---

## Items Evaluated — Not Actioned

### Component 4 synthesis-role defect report

**Finding:** `14-ta-findings.md` reported a live Component 4 defect because the synthesis step role was emitted as `undefined`.
**Evaluation:** `15-owner-findings.md` traced this to an invocation error, not a component defect: `orderWithPromptsFromFile` was called without the required `synthesisRole` argument. The correct fix is role guidance for the invoker, not a corrective flow against Component 4. No Next Priorities item created.

### Sequence-number collision risk

**Finding:** `12-curator-findings.md` reconfirmed the backward-pass sequence-number collision risk.
**Evaluation:** This is already represented in `$A_SOCIETY_LOG` as the existing `[S][LIB]` Next Priorities item "Backward pass sequence filing: verify folder state before selecting sequence number." No duplicate item created.

---

## Next Priorities Updates Applied

### Updated existing item: "Role guidance quality"

Merged three new general-role findings into the existing `[S][LIB][MAINT]` item:
- Curator summary discipline: use exact approved technical names rather than generic substitutes.
- Owner TA review: require data-extraction type coverage and explicit non-happy-path behavior review.
- Owner tooling invocation discipline: use documented tooling invocations rather than reconstructing calls from memory.

Merge assessment: same target files/design area (`general/roles/owner.md`, `general/roles/curator.md`), compatible authority level, same Framework Dev role path. Existing item updated rather than creating separate backlog entries.

### Updated existing item: "Generalizable advisory standards"

Merged the typed extraction-error finding into the existing `[S][LIB]` advisory-standards item.

Merge assessment: same design area (generalized TA/advisory-document standards), compatible authority level, same Framework Dev role path. Existing item updated rather than creating a separate advisory-standards entry.

### New item: provider catch blocks must preserve classified gateway errors

`[S]` Runtime Dev item added to `$A_SOCIETY_LOG` for the pre-existing provider catch-block issue surfaced in `15-owner-findings.md` (Finding 3): already-classified `LLMGatewayError`s should be re-thrown before provider-SDK-specific remapping so their codes and messages are preserved.

Merge assessment: existing runtime Next Priorities items target synthesis-role configuration, invocation docs, or test infrastructure; different files/design area, so no merge applied.

---

## Flow Closure

Backward pass synthesis complete. This flow is closed.

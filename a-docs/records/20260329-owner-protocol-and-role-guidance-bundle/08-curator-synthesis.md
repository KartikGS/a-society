# Backward Pass Synthesis: Curator — 20260329-owner-protocol-and-role-guidance-bundle

**Date:** 2026-03-29
**Role:** Curator (Synthesis)
**Findings input:** 06-curator-findings.md, 07-owner-findings.md

---

## Findings Reviewed

**Curator Top Findings (06-curator-findings.md):**
1. **OwnerBriefStateClaimError** — Brief-Writing Quality should require re-reading target passage before making specific state claims. Target: `$GENERAL_OWNER_ROLE`, `$A_SOCIETY_OWNER_ROLE` § Brief-Writing Quality.
2. **ImplementationPhaseComplexity** — Phase 4 (Implementation & Registration) handoff should explicitly list required record-folder artifacts. Target: `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`.
3. **GeneralAgentsPlaceholder** — A project-agnostic `$GENERAL_AGENTS` variable could simplify instruction-text references. Target: `$A_SOCIETY_INDEX`.

**Owner Top Findings (07-owner-findings.md):**
1. **BriefStateClaimWithoutReading** — Same as Curator #1; concurs. Target: `$GENERAL_OWNER_ROLE`, `$A_SOCIETY_OWNER_ROLE` § Brief-Writing Quality.
2. **ImplementationPortabilityGap** — Curator should explicitly verify portability when adapting project-specific text for general templates. Target: `$GENERAL_CURATOR_ROLE`, `$A_SOCIETY_CURATOR_ROLE` § Implementation Practices.
3. **BackwardPassSequenceVerification** — Sequence verification obligation should be explicitly named as a backward-pass entry check, not only an implementation-phase concern. Target: `$A_SOCIETY_RECORDS`. Marked `[Curator synthesis MAINT]`.

---

## Routing Decisions

### Implemented Directly (within `a-docs/`)

**BackwardPassSequenceVerification** → `$A_SOCIETY_RECORDS`

Scope: MAINT. The "Sequence verification before filing any artifact" bullet was updated to: (1) expand the list of artifacts that can shift the sequence to include "forward-pass closure artifacts" alongside revisions and registration artifacts; (2) explicitly name this as a backward-pass entry obligation — every role producing findings or synthesis must read the record folder before selecting a sequence number.

Status: **Done.** `a-society/a-docs/records/main.md` updated.

---

**ImplementationPhaseComplexity** → `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`

Scope: MAINT. A "Phase 4 exit checklist" paragraph was added to the Phase 4 Output section, enumerating five completion conditions that must be verified before filing the completion artifact: (1) all approved content files created or modified; (2) all required index rows added; (3) a-docs-guide entry added if new `a-docs/` files were created; (4) update report published if approved in Phase 2; (5) the `curator-to-owner` completion artifact itself filed. The artifact enumerates each deliverable, making omissions visible.

Status: **Done.** `a-society/a-docs/workflow/framework-development.md` updated.

---

### Queued to Next Priorities (outside `a-docs/` — require Owner approval)

**BriefStateClaimWithoutReading + ImplementationPortabilityGap** → merged bundle

Merge rationale: Both target role files in `general/` and `a-docs/`, share `[LIB]` authority, and follow the same Framework Dev workflow path. Both are role guidance precision improvements. Bundled as `[S][LIB]` **Role guidance precision bundle: brief-state-claim verification and implementation portability gap**. Targets `$GENERAL_OWNER_ROLE`, `$A_SOCIETY_OWNER_ROLE` (Brief-Writing Quality) and `$GENERAL_CURATOR_ROLE`, `$A_SOCIETY_CURATOR_ROLE` (Implementation Practices).

Status: **Queued** in `$A_SOCIETY_LOG` Next Priorities.

---

**GeneralAgentsPlaceholder** → `$A_SOCIETY_INDEX`

Requires Owner direction on what `$GENERAL_AGENTS` should point to and whether a new `general/` file is warranted — a direction decision. Queued as `[S][LIB][ADR]` **General agents entry-point variable**.

Status: **Queued** in `$A_SOCIETY_LOG` Next Priorities.

---

## Merge Assessment (Next Priorities)

Existing items reviewed: TA advisory completeness addendum (`$GENERAL_TA_ROLE`), Component 4 parallel-flow bundle (tooling), machine-readable handoff validator (tooling), runtime integration test, static registry replacement (runtime), workflow-derived synthesis role routing (runtime). No existing item targets `$GENERAL_OWNER_ROLE` (Brief-Writing Quality), `$GENERAL_CURATOR_ROLE` (Implementation Practices), or `$A_SOCIETY_INDEX` in this design area. No merges applied to existing items.

---

Synthesis complete. This flow is closed.

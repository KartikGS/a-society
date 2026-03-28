# Backward Pass Findings: Owner — 20260328-general-doc-bundle

**Date:** 2026-03-28
**Task Reference:** 20260328-general-doc-bundle
**Role:** Owner
**Depth:** Full

---

## Findings

### Conflicting Instructions

- None.

---

### Missing Information

**1. No constraint-writing quality standard parallel to brief-writing quality**

`$GENERAL_OWNER_ROLE` Brief-Writing Quality section provides explicit guidance on prose insertions, shared list constructs, and authority designation — all applicable to briefs. There is no parallel standard for writing implementation constraints in decision artifacts.

The gap surfaced concretely in this flow: constraint #4 read "Also verify whether `$A_SOCIETY_INDEX` needs updating for any files in `a-docs/`." The new file (`general/roles/technical-architect.md`) is in `general/`, not `a-docs/` — the qualifier "for any files in `a-docs/`" was not the intended scope. My intent was "any newly created or modified files." The Curator resolved it by pattern check against existing `$GENERAL_OWNER_ROLE` / `$GENERAL_CURATOR_ROLE` entries in the internal index, but had to use judgment rather than follow the constraint mechanically.

Root cause: when writing the constraint, I was thinking about the general question (does the internal index track a-docs/ changes?) and used a location-based qualifier instead of a file-scope qualifier. The location is variable; the files being created/modified are the stable reference point.

A constraint quality note applicable to registration constraints: the scope qualifier should describe the files being registered (e.g., "any newly created or modified files"), not their parent directory.

**Generalizable:** Any Owner writing implementation constraints involving index registration faces this risk. The brief-writing quality analogue — precision in describing what to register and for which files — is absent from constraint writing guidance.

---

### Unclear Instructions

**2. "Prose insertions" guidance: "at the insertion boundary" does not specify immediately-adjacent requirement**

The existing "Prose insertions" guidance in `$GENERAL_OWNER_ROLE` Brief-Writing Quality reads: "provide the exact target clause or phrase at the insertion boundary." For item 2d, I wrote the boundary as: "after the paragraph ending '...those two contexts only.' and before the paragraph beginning 'Classification guidance issued in update report phase handoffs...'"

These are not adjacent paragraphs — `**Behavioral property consistency:**` sits between them. The brief provided a range bounded by the first and third paragraphs without specifying the immediate neighbor (`**Behavioral property consistency:**`). The Curator identified the correct insertion position by contextual judgment rather than mechanical boundary-following.

The existing guidance is not wrong, but "at the insertion boundary" does not explicitly require the *immediately adjacent* clause — it could be read as permitting any nearby anchor. The Curator's Finding #2 identifies this as the same gap from the receiving end.

A clarifying note would resolve this: "the immediately adjacent clause on each side — not a nearby landmark within a broader range." This is an application precision gap more than a documentation gap, but the wording creates room for the interpretation I used.

---

### Redundant Information

- None.

---

### Scope Concerns

- None.

---

### Workflow Friction

**3. Component 7 invocation undocumented — multi-step detour during Phase 1**

`$A_SOCIETY_TOOLING_INVOCATION` documents Components 1–6 but omits Component 7 (`plan-artifact-validator.ts`). During Phase 1 plan validation, I could not consult the invocation reference and instead had to:

1. Read `tooling/src/plan-artifact-validator.ts` to identify the entry point (`validatePlanArtifact`)
2. Attempt `node -e` with dynamic import of a `.ts` file — failed ("Unknown file extension '.ts'")
3. Fall through to `npx tsx -e` invocation — succeeded

This is already filed as Next Priorities item 8 (`[S][MAINT]` — Add Component 7 to `$A_SOCIETY_TOOLING_INVOCATION`). Noting here to confirm that the gap has real friction cost — it turns a one-step validation into a three-step detour at a gate that runs in every Framework Dev Phase 1. Item 8 is a meaningful priority.

---

## Top Findings (Ranked)

1. **Registration constraint scope qualifier: location-based rather than file-based** — `04-owner-to-curator.md` (constraint #4) / `$GENERAL_OWNER_ROLE` (missing constraint-writing quality guidance for registration scope). Caught by Curator via pattern check; Curator had to use judgment instead of following the constraint mechanically. Generalizable: any Owner writing registration constraints faces the same risk.

2. **"Prose insertions" boundary guidance: immediately-adjacent requirement implicit, not stated** — `$GENERAL_OWNER_ROLE` (Brief-Writing Quality / Prose insertions). Brief used non-adjacent anchors for item 2d; Curator resolved by contextual judgment. Same root-cause gap identified from receiving end in Curator's Finding #2.

3. **Component 7 invocation undocumented: three-step detour at plan validation gate** — `$A_SOCIETY_TOOLING_INVOCATION`. Already Next Priority item 8. Confirms item 8 is a real friction cost at a mandatory Phase 1 gate.

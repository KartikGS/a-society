# Backward Pass Synthesis: Curator — programmatic-improvement-system

**Date:** 2026-04-04
**Task Reference:** `20260403-programmatic-improvement-system`
**Role:** Curator (Synthesis)
**Depth:** Full

---

## Findings Reviewed

| Artifact | Role | Findings |
|---|---|---|
| `13-curator-findings.md` | Curator | 3 top findings; mirror-assessment gap, artifact-path ambiguity, update-report draft naming gap |
| `13-tooling-finding.md` | Tooling Developer | 3 top findings; tooling CWD ambiguity, record-folder artifact-path ambiguity, large-redesign edit reliability |
| `13-runtime-finding.md` | Runtime Developer | 2 top findings; in-flight migration overhead and parallel-track wait-state friction |
| `14-ta-finding.md` | Technical Architect | 4 top findings; synthesis-role surfacing gap, wrong improvement instruction layer, warning-check lookup gap, session-freshness responsibility gap |
| `15-owner-findings.md` | Owner | 3 top findings; wrong injection layer/project hardcoding, wrong split target, missing general instruction for project-specific phase files |

---

## Disposition of Findings

### Project-specific improvement phase files and runtime injection conventions

The highest-severity findings converged on one core issue: A-Society's own project-specific improvement phase files did not exist, and the surrounding documentation did not surface the distinction between framework templates in `general/` and project-level runtime injection targets in `a-docs/`.

This split into two scopes:
- Within `a-docs/`, the missing project files and prevention guidance were actionable now. Those fixes were implemented directly.
- Outside `a-docs/`, the runtime still needs to derive injected improvement paths from project context, and the general instruction/scaffolding layer still needs to tell adopting projects to create those files. That work was filed as a new multi-domain Next Priorities item rather than routed through an approval loop from synthesis.

### Update-report draft naming and public-index mirror discipline

Two findings were pure A-Society maintenance:
- Owner brief-writing guidance did not say that update report drafts should use proposed `$VAR` names for files being created in the same flow.
- Curator implementation guidance did not explicitly require direct comparison of `$A_SOCIETY_INDEX` and `$A_SOCIETY_PUBLIC_INDEX` when public variables are added, retired, or revised.

Both were actionable within `a-docs/` and were implemented directly. The public-index discrepancy itself is not present in the current sources, so no separate backlog item was created for a state that is already resolved; the synthesis action was prevention.

### Tooling invocation CWD guidance and record-folder artifact semantics

These findings both sit outside `a-docs/`, but they do not belong in the same follow-up item:
- The `npx tsx` CWD/path mismatch belongs to `$A_SOCIETY_TOOLING_INVOCATION` and is a small Tooling Dev documentation correction.
- The `IsArtifact` ambiguity belongs in the improvement instruction layer, because the confusion is between system artifact-directory outputs and repository-tracked record-folder artifacts.

Both were filed as separate Next Priorities items. No existing merge target covered either design area.

### Runtime migration and parallel-track wait-state friction

The Runtime Developer's two findings were reviewed and not queued separately in this synthesis:
- The in-flight migration observation is real, but current evidence is still one flow-specific implementation experience rather than a reusable design rule with a clear target artifact.
- The wait-state observation is a valid integration note, but it does not currently define a distinct documentation or implementation gap beyond the already-filed project-scoped improvement-instruction item.

No standalone queue item was created for either finding at this time.

### Large-redesign partial-replace reliability

The Tooling Developer's recommendation to prefer full rewrites over partial replacements for major redesigns was reviewed. A-Society already carries the analogous Curator-side maintenance rule in `$A_SOCIETY_CURATOR_ROLE`. The remaining question is whether a reusable Tooling/Developer-side variant belongs in a standing implementation role or addendum. That is not a current `a-docs/` maintenance defect with a uniquely clear home, so it was not implemented or queued separately in this synthesis.

---

## Direct Implementation Completed (`a-docs/`)

| File | Change |
|---|---|
| `$A_SOCIETY_INDEX` | Registered `$A_SOCIETY_IMPROVEMENT_META_ANALYSIS` and `$A_SOCIETY_IMPROVEMENT_SYNTHESIS` |
| `$A_SOCIETY_AGENT_DOCS_GUIDE` | Added rationale entries for the new project-specific improvement phase files and updated `$A_SOCIETY_IMPROVEMENT` ownership wording |
| `$A_SOCIETY_IMPROVEMENT` | Replaced embedded phase instructions with explicit cross-references to the project-specific phase files; clarified that `general/` phase files are templates, not A-Society runtime injection targets |
| `$A_SOCIETY_IMPROVEMENT_META_ANALYSIS` | Created A-Society-specific findings-session instructions with record-folder output and completion-signal guidance |
| `$A_SOCIETY_IMPROVEMENT_SYNTHESIS` | Created A-Society-specific synthesis instructions with `$A_SOCIETY_LOG` routing and closure guardrails |
| `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` | Added advisory rule requiring project-scoped runtime injection targets derived from project context rather than `general/` templates or hardcoded project paths |
| `$A_SOCIETY_OWNER_ROLE` | Added brief-writing rule for project-scoped runtime-injected file references and a rule requiring proposed `$VAR` names in update report drafts for newly created files |
| `$A_SOCIETY_CURATOR_ROLE` | Added direct-comparison rule for public/internal index changes |
| `$A_SOCIETY_TOOLING_COUPLING_MAP` | Corrected the improvement-session dependency row to the project-specific `a-docs/improvement/` phase-file convention |

---

## Next Priorities Updates Applied

**New item filed:** `[L][LIB][RUNTIME]` **Project-scoped improvement session instructions**

No merge target existed for runtime improvement instruction injection, project-root-derived phase-file resolution, or project-specific improvement-phase scaffolding. This is the central non-`a-docs/` correction surfaced by the TA and Owner findings.

**New item filed:** `[S]` **Tooling invocation repo-root execution note**

No merge target existed for tooling-command CWD semantics or repo-root execution guidance in `$A_SOCIETY_TOOLING_INVOCATION`.

**New item filed:** `[S][LIB]` **Improvement artifact path semantics**

No merge target existed for the record-folder-artifact vs artifact-directory distinction in the improvement instruction layer.

No Owner approval loop was initiated from synthesis. All non-`a-docs/` work was routed to `$A_SOCIETY_LOG`, per `$A_SOCIETY_IMPROVEMENT` and `$A_SOCIETY_CURATOR_ROLE`.

---

## Flow Closure

Backward pass synthesis complete. This flow is closed. No further handoff is required.

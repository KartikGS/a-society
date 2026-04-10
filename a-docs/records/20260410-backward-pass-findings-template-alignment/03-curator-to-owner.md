# Curator → Owner: Proposal

**Subject:** Backward-pass findings template alignment for standing analysis families
**Status:** PROPOSED
**Date:** 2026-04-10

---

## Summary

The backward-pass findings template (`$GENERAL_IMPROVEMENT_TEMPLATE_FINDINGS`) is missing two reporting surfaces that the meta-analysis instructions (`$GENERAL_IMPROVEMENT_META_ANALYSIS`) require agents to use:

1. **Role File Gaps** — a reflection category (#7) with no corresponding subsection in the template's `## Findings` section
2. **a-docs Structure Checks** — eight specific checks with no dedicated section in the template

This proposal aligns the template with the meta-analysis instructions by adding both surfaces and establishing a standing alignment rule for future updates.

---

## Proposed Changes

### 1. Add `### Role File Gaps` Subsection

**Location:** Under `## Findings`, after `### Workflow Friction`

**Rationale:** This reflection category is defined in the meta-analysis instructions but has no reporting surface in the template. Agents have been improvising — either adding it manually or embedding results in other categories.

**Content:**
```markdown
### Role File Gaps
- [Finding or "none"]
```

---

### 2. Add `## a-docs Structure Check Notes` Section

**Location:** After `## Findings`, before `## Top Findings (Ranked)`

**Rationale:** The meta-analysis instructions require eight specific checks for artifacts that live in `a-docs/` or affect the agent-documentation layer. These checks are structural diagnostics distinct from the reflection categories. They deserve their own section because:
- They apply conditionally (only when the reviewed artifact lives in `a-docs/`)
- They are a defined checklist, not free-form reflection
- The meta-analysis instructions explicitly enumerate them, and the template should surface them as actionable items

**Design decision:** Enumerate all eight checks explicitly with individual placeholders.

**Why not a consolidated placeholder?**
- Each check has a distinct purpose and different failure modes
- Explicit enumeration ensures agents apply all checks rather than selecting a subset
- Consolidated placeholders create risk of "N/A" responses when individual checks might apply
- The checks are already well-defined in meta-analysis.md — the template should make them immediately actionable

**Content:**
```markdown
## a-docs Structure Check Notes

*Complete this section if the reviewed artifact lives in `a-docs/` or affects the agent-documentation layer. Otherwise, note "N/A — artifact does not live in a-docs/" and proceed.*

- **Redundancy check:** [Result or "N/A"]
- **Phase-coupling check:** [Result or "N/A"]
- **Workflow-conditioning check:** [Result or "N/A"]
- **Workflow-delivery check:** [Result or "N/A"]
- **Role document scope check:** [Result or "N/A"]
- **agents.md scope check:** [Result or "N/A"]
- **Addition-without-removal check:** [Result or "N/A"]
- **Repeated-header matching guidance:** [Result or "N/A"]
```

---

### 3. Add Standing Alignment Rule

**Location:** End of template, after `## Top Findings (Ranked)`

**Rationale:** This gap formed because there was no explicit rule linking template updates to meta-analysis instruction changes. A standing rule prevents recurrence.

**Content:**
```markdown
---

## Template Maintenance

When `$GENERAL_IMPROVEMENT_META_ANALYSIS` adds a new recurring reflection category or check family, update this template in the same flow or explicitly specify where those results should be reported.
```

---

## Open Question Resolution

The brief asked whether to enumerate all eight checks explicitly or provide a consolidated placeholder.

**Recommendation:** Enumerate explicitly.

**Reasons:**
1. Each check addresses a distinct structural failure mode
2. Explicit enumeration creates a true checklist — agents verify each item
3. Consolidated placeholders encourage summary responses that may omit actionable findings
4. The eight checks are stable and well-defined — no maintenance burden from listing them

---

## Impact Assessment

| Stakeholder | Impact |
|---|---|
| Agents producing findings | Clearer, more complete reporting surface; less improvisation |
| Curator(s) conducting synthesis | Consistent artifact structure; all expected sections present |
| Framework maintainers | Alignment rule prevents future drift |
| Adopting projects | No breaking change — template additions are additive, not structural |

**No breaking changes.** This proposal adds sections; it does not remove or rename existing ones.

---

## Files Changed

| File | Action |
|---|---|
| `$GENERAL_IMPROVEMENT_TEMPLATE_FINDINGS` | modify |

---

## Alternatives Considered

**Alternative 1: Consolidated placeholder for structure checks**
- Discarded: Reduces actionability, increases risk of incomplete application

**Alternative 2: Add structure checks as subsections under `## Findings`**
- Discarded: Structure checks are conditional (apply only to `a-docs/` artifacts) and are diagnostic checks, not reflection categories. A separate section with conditional applicability guidance is cleaner.

**Alternative 3: No alignment rule**
- Discarded: The gap formed because there was no standing rule. Without one, the same drift will recur.

---

## Requested Decision

Approve this proposal to:
1. Add `### Role File Gaps` subsection
2. Add `## a-docs Structure Check Notes` section with explicit eight-check enumeration
3. Add standing template-maintenance rule

---
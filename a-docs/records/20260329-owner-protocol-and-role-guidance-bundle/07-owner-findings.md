# Backward Pass Findings: Owner — 20260329-owner-protocol-and-role-guidance-bundle

**Date:** 2026-03-29
**Task Reference:** 20260329-owner-protocol-and-role-guidance-bundle
**Role:** Owner
**Depth:** Full

---

## Findings

### Conflicting Instructions

- **None.**

### Missing Information

- **Brief-writing state claim verification** — The brief (02) asserted that criterion 3 existed in `$GENERAL_OWNER_ROLE` without re-reading the file. The Review Artifact Quality rule requires re-reading at review time; no analogous rule exists for brief-writing time. The same class of error — asserting a specific state claim about a file without reading it — applies equally to briefs. Root cause: the Brief-Writing Quality section covers many dimensions of brief precision but does not include a "verify current file state before making state claims" obligation.

- **Implementation-stage portability check** — During forward pass closure verification, two issues were found where the Curator adapted text from `$A_SOCIETY_OWNER_ROLE` for `$GENERAL_OWNER_ROLE` without adapting project-specific references to generic equivalents: (1) `$A_SOCIETY_INDEX` appeared in the example sentence of the general template's Constraint-Writing Quality section; (2) "user" was used in `$A_SOCIETY_OWNER_ROLE` where "human" is the consistent term. The brief-writing rules (C4 for variable names, C1 for rendering) were implemented in this very flow but apply to proposal-stage output — not to implementation-stage text. The Curator has no explicit obligation to check portability when adapting project-specific text for general templates during implementation.

### Unclear Instructions

- **None.**

### Redundant Information

- **None.**

### Scope Concerns

- **None.**

### Workflow Friction

- **Sequence collision at position 06** — The forward pass closure artifact was filed as `06-owner-forward-pass-closure.md` before the backward pass began. The Curator then filed their findings as `06-curator-findings.md` rather than checking the folder first and selecting `07`. The sequence verification obligation (records convention: read folder contents before selecting a sequence number) was not applied. Both `06-` files now coexist as a numbering inconsistency. This confirms that sequence verification at backward pass entry is a real gap — meta-analysis roles may not think to check, since the sequence verification guidance in `$A_SOCIETY_RECORDS` is framed around the implementation phase, not the backward pass entry.

---

## Top Findings (Ranked)

1. **BriefStateClaimWithoutReading** — The Brief-Writing Quality section should require re-reading the relevant passage of the target file before making specific state claims (e.g., "this criterion exists," "this section reads X"). This mirrors the existing Review Artifact Quality rule and prevents the same class of error at brief-writing time. Concurs with Curator Top Finding 1. — `$GENERAL_OWNER_ROLE`, `$A_SOCIETY_OWNER_ROLE` / § Brief-Writing Quality

2. **ImplementationPortabilityGap** — When adapting text from a project-specific source for a general template (or vice versa), the Curator should explicitly verify that variable references, terminology, and examples are valid in the target context. The current `$GENERAL_CURATOR_ROLE` Implementation Practices covers rendering consistency and schema terminology sweeps but does not address context-portability when text crosses the general/project-specific boundary. — `$GENERAL_CURATOR_ROLE` / § Implementation Practices

3. **BackwardPassSequenceVerification** — The sequence verification obligation in `$A_SOCIETY_RECORDS` ("read the record folder's current contents before selecting a sequence number") should be explicitly noted as applying at backward pass entry, not only during forward-pass implementation. Meta-analysis roles do not naturally think of checking sequence at this point. — `$A_SOCIETY_RECORDS` (Curator synthesis MAINT)

---

Next action: Perform your backward pass synthesis (step 3 of 3 — final step)
Read: all findings artifacts in `a-society/a-docs/records/20260329-owner-protocol-and-role-guidance-bundle/`, then ### Synthesis Phase in `a-society/general/improvement/main.md`
Expected response: synthesis artifact at the next available sequence position in `a-society/a-docs/records/20260329-owner-protocol-and-role-guidance-bundle/`

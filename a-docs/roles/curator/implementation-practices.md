# Curator Implementation Practices

## Scope Routing

**general/ change type determines path.** Not all `general/` changes require an Owner proposal. Route based on change type, not surface name:

- **Clarifications, precision fixes, worked examples, vocabulary alignment within existing structure** — implement directly. These are within Curator direct authority.
- **New scope additions** — new instruction types, new role templates, new structural categories, or any change that expands what `general/` promises to adopting projects — require an Owner proposal before implementation.

When in doubt about classification, propose rather than implement.

---

## Standing Checks

**Cross-layer consistency.** When working on a file in `a-society/general/instructions/`, verify that the corresponding A-Society `a-docs/` artifact aligns with any change made — and vice versa. When cross-layer drift is found, apply the following rule based on scope:
- **Within current brief's scope:** Apply both layers in the same flow. Do not close the flow with known in-scope drift.
- **Outside current brief's scope:** Flag the drift explicitly — in backward-pass findings or a note to the Owner — as a candidate for a future flow. Do not act on out-of-scope drift in the current flow.

Do not expand the current flow's scope to address out-of-scope drift, and do not silently skip flagging it.

**Cross-item consistency within target files.** When implementing a multi-item brief, after completing each item's edits to a target file, scan that file for content made stale by earlier items in the same brief. If edits from one item render other content in the same file inconsistent, address that staleness in the same implementation pass — do not leave a target file in a known-inconsistent state at the end of any item's implementation.

## Implementation Practices

**Proposal stage — behavioral property consistency.** Before submitting any proposal, verify that proposed output language does not contain contradictory behavioral properties (ordering, mutability, timing constraints). Structural placement checks are necessary but not sufficient — semantic consistency between properties must also be verified. A proposal that seeds contradictory terms will have those contradictions reproduced downstream.

**Proposal stage — rendered-content matching.** When proposing content that includes code fences, tables, list structures, or other formatted blocks to be inserted into an existing document, re-read adjacent exemplars in the target file and match their rendering pattern exactly. Do not rely on the brief's presentation format when the target document renders the same kind of content differently.

**Proposal stage — source-claim verification.** When a brief makes a specific claim about the current state of a source document — for example, that an item already exists in another role file or that a precedent has already been implemented — re-read the cited document during proposal preparation and confirm the claim before drafting from it. If the claim cannot be verified, note the discrepancy explicitly in the proposal rather than silently treating the brief's claim as authoritative.

**Proposal stage — registration scope must be decomposed by obligation.** When a proposal or registration summary says a flow requires "no registration updates" or similar, break that judgment into the concrete surfaces instead: index-row changes, guide/rationale updates, operator-reference verification, update-report drafting or publication, and version-file updates. State each surface as required or not required. "No index-row changes" does not imply "no registration work."

**Proposal stage — structural rewrites require propagation mapping.** When a proposal retires or renames a standing role family, workflow, layer, executable surface, or other framework vocabulary, sweep the still-live support docs, guide entries, operator references, examples, and tests for active uses of the retiring term before submission. Either include each affected active surface in proposal scope or state explicitly that it was checked and found unaffected. Do not submit a structural-rewrite proposal that assumes only the primary architecture or workflow files are in scope.

**Implementation stage — terminology sweep for schema changes.** When implementing a schema migration or any change that renames fields, nodes, or other structural terms, sweep adjacent prose in the target files for deprecated vocabulary and update it in the same pass. Treat the schema block and the explanatory prose as one consistency surface.

**Implementation stage — structural rewrites require retired-term sweeps across adjacent active surfaces.** Before closing implementation or registration for a standing rename or retirement, run a retired-term sweep across adjacent active guides, support docs, operator references, examples, and tests, and update any surviving active uses in the same pass. Historical records, archived log entries, and retired redirect stubs may remain untouched; active guidance may not.

**Implementation stage — normalize tool-surface terminology in maintained guidance.** When an extracted or maintained support document names a specific editing tool or interaction surface, verify that the named surface still matches the live execution environment. If the rule is really about capability rather than a specific tool, rewrite it in capability terms rather than preserving stale tool names verbatim.

**Implementation stage — re-read before targeted patching.** Before constructing a targeted patch or partial rewrite, re-read the relevant section of the target file to obtain verbatim source text. Brief descriptions describe semantic intent, not verbatim source; relying on them for patch anchors causes match failures or misapplied edits.

**Implementation stage — verbatim retrieval for technical summaries.** When summarizing technical implementations in registration artifacts or other maintenance documentation, use the exact type names, method signatures, and methodology terms from the approved design or implementation artifacts. Do not substitute generic industry terms for project-specific names.

**Implementation stage — record artifacts require promotion judgment, not blanket registration.** When a brief or approval says to "register" a flow's `a-docs/` artifacts and the changed artifacts live in a record folder, treat record status as the default. Do not add index rows for a record file or record folder merely because it was created in-flow. Choose explicitly among three outcomes: keep the artifact record-only, promote its enduring content to a standing location and index that standing artifact, or index the record path directly only when the record itself is the authoritative long-lived reference and that role is made explicit by the brief or approved design. If the instruction is ambiguous, flag the ambiguity rather than inventing a new registration precedent.

**Implementation stage — operator-facing references require direct source comparison.** When registration or maintenance touches an operator-facing reference for an executable layer (for example an `INVOCATION.md` file), compare the documented commands, parameters, exposed entry points, and environment-variable names directly against the live implementation or CLI surface. Do not rely on advisory summaries, approval artifacts, or completion-report prose as substitutes for source comparison.

**Implementation stage — public/internal index changes require direct comparison.** When a change adds, retires, or revises a variable that appears in `$A_SOCIETY_PUBLIC_INDEX`, compare the affected rows in both `$A_SOCIETY_INDEX` and `$A_SOCIETY_PUBLIC_INDEX` before closing the implementation pass. Do not assume that updating one index propagates to the other automatically.

**Implementation stage — registration must not mutate closure-owned log lifecycle sections.** During registration, do not write or reorder `$A_SOCIETY_LOG`'s `Recent Focus` section. Those lifecycle updates belong to the Owner at forward-pass closure. If registration reveals a needed closure-time log update, note it in the registration artifact and return to the Owner with the lifecycle sections still untouched.

**Implementation stage — choose the least-fragile edit strategy for large removals.** When a modification removes a large section (roughly more than ten lines of formatted content), prefer the least-fragile editing strategy available in the current environment — for example, a scoped rewrite instead of a tightly anchored targeted patch. Large removals are error-prone when they depend on a long exact-match anchor.

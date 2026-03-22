# A-Society: Framework Update Report Protocol

## What a Framework Update Report Is

A framework update report is an artifact published by A-Society when changes to `general/` or `agents/` are significant enough that adopting projects may need to update their own `a-docs/`. It is the outbound communication channel from A-Society to its ecosystem: a structured record of what changed, why it changed, and what each project's Curator should assess.

It is not a changelog for A-Society's own development. It is a migration guide for projects that have already been initialized.

---

## When to Publish

Publish a framework update report when one or more of the following is true:

- A new artifact type has been added to `general/` that initialized projects should have but do not
- An existing `general/` instruction or template has changed in a way that affects the guidance adopting projects received at initialization
- The Initializer protocol has changed in a way that affects what a correct `a-docs/` contains
- A new mandatory section has been added to any general template or instruction

Do NOT publish for:
- Typo corrections or clarifications that do not change meaning
- A-Society-internal changes (`a-docs/` only) that do not affect what adopting projects were given
- Additive changes to `general/` that adopting projects may optionally adopt — include these as **Optional** entries in the next qualifying report, not as standalone triggers

---

## Impact Classification

Every change in an update report must be classified:

**Breaking** — Adopting projects are currently operating with a gap or contradiction introduced by this change. The Curator must review their project's `a-docs/` and determine whether to adopt the change. Examples: a new mandatory section was added to a template; a protocol was corrected that projects may have implemented incorrectly. This includes additive changes that make existing instantiations incomplete — for example, a new mandatory step added to a role template creates a gap in any project that instantiated the template before the addition.

**Recommended** — The change improves clarity, completeness, or consistency. Projects would benefit from adopting it, but the absence does not create a gap or contradiction. The Curator should review and make a judgment call.

**Optional** — An improvement or addition that some projects may benefit from depending on their context. The Curator may ignore this unless they recognize the problem it solves in their own project.

---

## Who Produces It and When

The A-Society Curator drafts the report after a significant change cycle completes — once Phase 4 (Registration) is done and the changes qualify under the trigger conditions above. The Owner reviews and approves before the report is finalized and placed in `a-society/updates/`.

This is a publication step, not an internal retrospective. The backward pass (Phase 5) and the update report are separate artifacts serving different purposes: the backward pass is internal reflection on the process; the update report is outbound communication to the ecosystem.

Both may happen after the same change cycle, but they are produced independently.

---

## Migration Guidance Format

Update reports are addressed to all adopting project Curators. Migration guidance must be written generically — it describes what any Curator should check and do, regardless of which project they are maintaining.

- Use `$[PROJECT]_*` as a placeholder wherever a project-specific index variable is referenced. Each Curator maps this to their own project's variable names.
- Do not address a specific known adopter by name in migration guidance. Listing known adopters in the Summary for awareness is acceptable; targeting them in the guidance is not.
- Project-specific migration analysis is the responsibility of each project's Curator, not A-Society's. A-Society provides the what and the generic how; the Curator maps it to their project's actual structure.
- On special request, A-Society may produce a project-specific migration addendum — but the base report must always be generic.

---

## Report Naming Convention

```
a-society/updates/[YYYY-MM-DD]-[brief-descriptor].md
```

The date is the publication date. The descriptor is a short phrase naming the primary change batch: 2–4 words, lowercase, hyphen-separated.

Example: `a-society/updates/2026-03-06-minimum-role-set.md`

---

## Programmatic Parsing Contract

The naming convention and version field format described above are stable contracts that programmatic tooling may depend on. Do not change either without a corresponding update to the Version Comparator implementation and a Curator maintenance proposal.

### File discovery

The Version Comparator scans `$A_SOCIETY_UPDATES_DIR` for files matching the pattern:

```
YYYY-MM-DD-[descriptor].md
```

- `YYYY-MM-DD` — ISO 8601 date (publication date); four-digit year, two-digit month, two-digit day, hyphen-separated
- `[descriptor]` — one or more lowercase hyphen-separated words
- Extension: `.md`

Files that do not match this pattern are ignored. No other file types are present in `$A_SOCIETY_UPDATES_DIR`.

### Version field format

Every update report declares two version fields in the header, on their own lines, before the first `##` heading in the report body:

```
**Framework Version:** vMAJOR.MINOR
**Previous Version:** vMAJOR.MINOR
```

- `vMAJOR.MINOR` — integer major version, dot, integer minor version, no patch level
- No trailing text on the version field lines
- Both fields are always present; a report missing either field is malformed

The Version Comparator extracts the `**Previous Version:**` field to determine whether a report applies to a given project.

### Comparison rule

A report applies to a project if:

```
report's Previous Version >= project's recorded version
```

The project's recorded version is read from the project's `a-docs/a-society-version.md` (see `$INSTRUCTION_A_SOCIETY_VERSION_RECORD`).

The Comparator returns all matching reports ordered by Previous Version ascending. The Curator applies them in that order — sequential application is required because each report moves the project from one version to the next.

### Stability guarantee

The filename format and version field format defined in this section are stable. A change to either requires:

1. A Curator maintenance proposal to this section
2. A concurrent update to the Version Comparator implementation
3. Owner approval before the change is published

Do not modify the filename format or version field format without all three steps complete.

---

## Version Requirements

Every update report must declare two version fields in the report header, before the Summary section:

- **Framework Version:** The version A-Society is at *after* this update is applied (e.g., `v1.1`). Increment per the scheme in `$A_SOCIETY_VERSION`: MAJOR for Breaking changes, MINOR for Recommended or Optional.
- **Previous Version:** The version A-Society was at *before* this update (e.g., `v1.0`). Curators of adopting projects use this field to determine their position in the update sequence — they apply all reports whose Previous Version ≥ their project's recorded version.

The Curator updates `$A_SOCIETY_VERSION` as part of Phase 4 (Registration), at the same time the report is published. These two writes are a single atomic registration step. Updating `$A_SOCIETY_VERSION` involves two distinct write targets: (1) the `**Version:**` header field at the top of the file, and (2) a new row in the History table. A Curator who updates only the History table row has not completed the registration step.

### Deferred Reports in Subsequent Publication Cycles

When a flow defers an update report (e.g., because update report assessment was not completed in that flow's Phase 4) and that deferred report is included in a later flow's publication cycle, apply this ordering rule:

1. **Publish the deferred report first**, before the current flow's report. The deferred report's changes pre-date the current flow's changes; publishing order must reflect implementation chronology.
2. **Assign version numbers at publication time**, continuing from the last published version — not from the version at which the report was deferred. The deferred report's `Previous Version` is the last published version; its `Framework Version` increments per the standard scheme (MAJOR for Breaking, MINOR for Recommended or Optional).
3. **The current flow's report follows**, using the deferred report's `Framework Version` as its own `Previous Version`.

Example: Last published version is v18.0. Two reports are due — one deferred from a prior flow (Breaking changes), one from the current flow (Recommended changes). Publish order: deferred report as v18.0 → v19.0 (Breaking), then current flow's report as v19.0 → v19.1 (Recommended).

---

## Delivery

How adopting projects discover update reports is an open problem. The distribution mechanism depends on how A-Society is deployed and how many projects are using it. Until a mechanism is defined:

- Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle
- Each report should note this delivery gap explicitly so consuming Curators understand the limitation is known and acknowledged

---

## Submission Requirements

When the Curator submits an update report draft to the Owner for review, the submission artifact (`curator-to-owner.md`) must declare:

1. **Implementation status** — whether the underlying implementation (Phases 3 and 4) is complete or still in progress.
2. **Files changed** — a list of files modified during implementation, using `$VAR` references where registered.
3. **Publication condition** — whether any condition for publication remains outstanding (e.g., version increment pending, delivery note incomplete), and if so, what is blocking.

The Owner reviews the report against these declared statuses. A submission that omits implementation status is malformed — the Owner should return it as `REVISE` with this field named.

When the submission template no longer contains the relevant fields — because the template itself was updated within the same flow — the Submission Requirements in this section are the fallback specification. File the submission against these requirements directly.

---

## Template

See `$A_SOCIETY_UPDATES_TEMPLATE`.

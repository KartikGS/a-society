# Instruction: A-Society Version Record

## What This Artifact Is

The A-Society version record is a file in a project's `a-docs/` that records:

1. The version of the A-Society framework that was active when the project was initialized
2. A log of framework update reports the project's Curator has applied since initialization

It is the project's ledger for its position in the A-Society version history. Without it, a Curator joining mid-lifecycle has no way to determine which update reports have already been applied and which are still pending.

---

## Who Creates It

The Initializer creates this file during Phase 3 — after all other `a-docs/` documents are drafted but before the index is finalized. The Initializer reads A-Society's current version from `$A_SOCIETY_VERSION` and records it as the baseline.

---

## Who Maintains It

The project's Curator. After each migration cycle — after implementing a framework update report — the Curator adds a row to the Applied Updates log.

---

## File Location

`[project a-docs root]/a-society-version.md`

This file lives at the root of `a-docs/`, alongside `agents.md` and `a-docs-guide.md`. Register it in the project's `indexes/main.md`.

---

## File Format

```markdown
# A-Society Version Record

**Baseline Version:** v[X.Y]
**Initialized:** [YYYY-MM-DD]

---

## Applied Updates

| Version After | Update Report | Applied | Notes |
|---|---|---|---|
| — | — | — | No updates applied since initialization. |
```

Replace the placeholder row once the first update is applied. Each row records: the version the project is at after applying the report, the report filename (from `a-society/updates/`), the date applied, and optional notes.

---

## How to Create It (Initializer)

1. Read `$A_SOCIETY_VERSION` to get the current framework version
2. Create `a-docs/a-society-version.md` using the format above, stamping the current version as the baseline and today's date as the initialization date
3. Register the file in `a-docs/indexes/main.md` before closing Phase 3

---

## How to Apply Update Reports (Curator)

When performing migration tasks:

1. Read `a-docs/a-society-version.md` to determine the project's recorded version (last row of Applied Updates, or baseline if none applied)
2. Use the project's executable update-comparison capability, if one exists, to identify which update reports have not yet been applied. Pass the path to `a-docs/a-society-version.md`. The capability reads the project's recorded version and A-Society's current version and returns the list of pending update report filenames in version order. If no such capability exists, check `a-society/updates/` manually for all reports whose **Previous Version** >= the project's recorded version.
3. Apply update reports in version order — lowest Previous Version first — through to the latest
4. After implementing each report, add a row to the Applied Updates log with the resulting version, report filename, and date applied
5. When all pending reports are applied, the project's recorded version matches `$A_SOCIETY_VERSION`

**If the project has no `a-society-version.md`** (initialized before versioning was introduced): create one, set the baseline to `v1.0`, leave Applied Updates empty, and apply reports from v1.0 forward.

---

## Invariant

The project's recorded version is always ≤ A-Society's current version (`$A_SOCIETY_VERSION`). A project that is behind has pending update reports; a project that is current needs no migration action.

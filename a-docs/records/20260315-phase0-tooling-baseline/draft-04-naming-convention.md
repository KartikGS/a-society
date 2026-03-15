# Draft: Update Report Naming Convention — Programmatic Parsing Contract

**Target:** `$A_SOCIETY_UPDATES_PROTOCOL` — `/a-society/a-docs/updates/protocol.md`
**Type:** Addition — new section inserted after the existing "Report Naming Convention" section.

---

## What This Changes and Why

The existing "Report Naming Convention" section describes the filename format and version field requirements as authoring guidance — written for human and agent authors producing update reports. It is not written as a machine-parseable contract.

The Version Comparator (Component 6 of the tooling layer) must parse update report filenames and version fields programmatically to determine which reports a project has not yet applied. For the Comparator to operate correctly and reliably, the format must be formally declared as a stable contract — one that tooling may depend on. A change to the format without a corresponding Comparator implementation update would silently break the tool.

This addition does not change the existing naming convention or version field format. It formalizes them.

---

## Section to Insert

Insert the following section immediately after the existing "Report Naming Convention" section (after the example line `a-society/updates/2026-03-06-minimum-role-set.md`) and before the "Version Requirements" section.

---

```markdown
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
```

---

## No other changes to the protocol document

The "What a Framework Update Report Is", "When to Publish", "Impact Classification", "Who Produces It and When", "Migration Guidance Format", "Report Naming Convention", "Version Requirements", "Delivery", and "Submission Requirements" sections require no changes.

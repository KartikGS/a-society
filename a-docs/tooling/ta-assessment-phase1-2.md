# TA Assessment: Phase 1–2 Implementation Deviations

**Role:** Technical Architect
**Scope:** Review of two deviations identified in Phase 1–2 implementation output
**Components under review:** Version Comparator (Component 6), Consent Utility (Component 2)
**Status:** For Owner review — Phase 3 does not begin until Owner receives this assessment

---

## Deviation 1: Version Comparator — VERSION.md history as report source instead of updates/ directory scan

### What the spec said

The Component 6 design specified:
- Accepts: "path to `a-society/updates/` directory"
- Interface: "Reads the `a-society/updates/` directory listing and report filenames"
- Output: each report entry includes filename and version stamp

### What the implementation does

The implementation (`version-comparator.js`) accepts all three specified arguments — project version path, framework version path, and updates directory path — but the updates directory argument is unused (prefixed `_updatesDir`, conventional dead-code marker in Node.js). Instead, the tool parses the history table from `VERSION.md` to extract the list of reports and their associated version stamps. Report filenames are extracted from the history table's "Update Report" column using the `YYYY-MM-DD-slug.md` naming pattern.

### Analysis

**The spec's approach (directory scan) has a structural weakness the TA did not anticipate at design time.** A directory scan produces filenames but no version stamps. The spec output requires each unapplied report entry to include both the filename and its version stamp. To satisfy that requirement via directory scan, the tool would need to either (a) parse version stamps from filenames, which couples correctness to naming convention, or (b) open and parse each report file to extract its version — significantly increasing complexity and I/O.

**The implementation's approach (VERSION.md history table) resolves this cleanly.** The history table is the explicitly curated, authoritative record of which report corresponds to which version. It is maintained by A-Society's Curator as part of the version bump process. Using it as the source gives the tool a single read (already required) that provides both version stamps and filenames without additional I/O or filename parsing.

**The remaining concern is the dead-code parameter.** `_updatesDir` is accepted but never used. This creates a misleading interface: callers provide a path that does nothing. Two options: (1) remove the parameter, simplifying the interface; (2) use it for existence validation only — confirm the updates directory exists and is readable, even though reports are identified from VERSION.md. Option 2 adds a useful sanity check at low cost.

**There is one genuine risk.** If a report is published to `a-society/updates/` but VERSION.md's history table is not updated, the tool silently misses it. This is a maintainer discipline problem, not a tool design problem — but it should be acknowledged in the spec so future maintainers understand the dependency.

### Ruling

**Accept with spec update.**

The deviation is correct. The VERSION.md history table is more reliable than the updates/ directory scan for this operation. The spec must be updated to reflect the actual interface.

### Required spec update (Component 6)

Replace the "What it does" and "Interface with the documentation layer" sections:

**Current:** "Lists all update reports in the updates directory" / "Reads the `a-society/updates/` directory listing and report filenames"

**Replace with:**
- Identifies applicable update reports from the VERSION.md history table, which records the version stamp and report filename for each published update. Does not scan the `a-society/updates/` directory.
- The `updates-dir` parameter is accepted for interface compatibility and future use; current implementation does not use it.
- Dependency: VERSION.md history table must be kept current when update reports are published. Reports published to `a-society/updates/` but not recorded in VERSION.md's history table will not be identified by this tool.

---

## Deviation 2: Consent Utility — hardcoded rendering instead of template file read

### What the spec said

The Component 2 design specified:
- "Instantiates the consent template (`$GENERAL_FEEDBACK_CONSENT`) at the correct path"
- Interface: "Reads `$GENERAL_FEEDBACK_CONSENT` template"

### What the implementation does

The implementation (`consent-utility.js`) renders the consent file content from `renderConsentFile()` — a hardcoded function that constructs the output using inline string interpolation and per-type metadata from the `FEEDBACK_TYPES` constant. The template file at `$GENERAL_FEEDBACK_CONSENT` is never read.

The rendered output differs from the template in one structural way: the implementation adds a `**Project:**` field that does not appear in the template. All other sections — heading, Type, Consented, Date, Recorded by, What This Covers, Agent Behavior — are present and structurally consistent with the template format.

### Analysis

**The spec requirement was not implementable as written.** The template at `$GENERAL_FEEDBACK_CONSENT` is a prose document with the consent file format embedded inside a markdown code fence, surrounded by agent instructions ("Copy it, fill in the fields"). It is not a machine-parseable substitution template. To read and instantiate it programmatically, the tool would need to: (1) locate and extract the content inside the code fence, (2) identify placeholder tokens (e.g., `[Type]`, `[YYYY-MM-DD]`), (3) substitute values, and (4) handle the per-type "What This Covers" section, which requires type-specific descriptive text not inferable from the placeholder alone.

This is substantially more complex than the spec anticipated. The spec also did not include the A-Society root path in the parameter list for `createConsentFile`, which would be required to locate the template file at runtime. The spec therefore contained an internal inconsistency: it described reading a template file but provided no mechanism for the tool to locate it.

**The implementation's hardcoded approach is a reasonable resolution.** Given the template's structure, programmatic reading would have required either a fragile code-fence parser or a redesigned, machine-parseable template format (which would be a documentation layer change requiring Owner approval — outside Developer authority).

**The `**Project:**` field addition is within Developer authority.** The spec described "minimal template instantiation (e.g., filling in project name in the front-matter)" — adding project name as a labeled field is consistent with that description. The check operation parses only `**Consented:**`, so existing consent files without the `**Project:**` field parse correctly. This addition creates no compatibility problem.

**The format-drift risk is real and must be acknowledged.** The rendered format is now defined in `renderConsentFile()`, not in `$GENERAL_FEEDBACK_CONSENT`. If the template file is updated (new fields, changed sections), the tool will not automatically reflect the change — they will diverge silently. This risk must be documented so future maintainers know that updating the template requires updating the tool.

### Ruling

**Accept with spec update.**

The deviation is justified by a spec inconsistency: the template is not machine-parseable in a straightforward way, and no parameter was specified for locating it. The rendered output is functionally correct. The format-drift risk must be documented in the spec.

### Required spec update (Component 2)

In the "What it does — Create operation" section:

**Current:** "Instantiates the consent template (`$GENERAL_FEEDBACK_CONSENT`) at the correct path"

**Replace with:** "Renders consent file content programmatically using hardcoded structure consistent with `$GENERAL_FEEDBACK_CONSENT` format, and writes the result to the correct path. Does not read the template file at runtime."

In the "Interface with the documentation layer" section:

**Current:** "Reads `$GENERAL_FEEDBACK_CONSENT` template"

**Replace with:** "Does not read `$GENERAL_FEEDBACK_CONSENT` at runtime. The rendered format is maintained in `renderConsentFile()` in the tool source. When `$GENERAL_FEEDBACK_CONSENT` is updated, `renderConsentFile()` must be updated to match — these are treated as a co-maintained pair."

Add a new dependency note:

**Add:** "Format co-maintenance dependency: `$GENERAL_FEEDBACK_CONSENT` and `renderConsentFile()` must be kept in sync manually. A change to the template format is a trigger for a tooling update."

---

## Summary for Owner

| Deviation | Component | Ruling | Action required |
|---|---|---|---|
| VERSION.md history vs. directory scan | Component 6 | Accept with spec update | Update Component 6 spec as described above; no code change needed |
| Hardcoded rendering vs. template read | Component 2 | Accept with spec update | Update Component 2 spec as described above; no code change needed |

Neither deviation requires implementation correction. Both require spec updates to `$A_SOCIETY_TOOLING_PROPOSAL` before Phase 3 begins.

**The spec updates are documentation changes to an `a-docs/` file.** Under the existing workflow, these are within Curator authority to implement after Owner approval — or the Owner may direct the Curator to implement them as part of Phase 3 pre-work.

Phase 3 may proceed once the Owner has reviewed this assessment.

---

*Assessment produced by: Technical Architect. No implementation changes made or recommended.*

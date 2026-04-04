# Owner → Curator: Briefing

**Subject:** Required readings authority restructure — required-readings.yaml + context injection cleanup
**Status:** BRIEFED
**Date:** 2026-04-04

---

## Agreed Change

**Files Changed:**

| Target | Action | Authority |
|---|---|---|
| `a-society/general/instructions/required-readings.md` (new; register as `$INSTRUCTION_REQUIRED_READINGS`) | additive | Requires Owner approval |
| `$GENERAL_OWNER_ROLE` | modify — remove `required_reading` frontmatter block; remove prose required-reading section; remove context confirmation ritual | Requires Owner approval |
| `$GENERAL_CURATOR_ROLE` | modify — same three removals | Requires Owner approval |
| `$GENERAL_TA_ROLE` | modify — same three removals | Requires Owner approval |
| All other role templates under `a-society/general/roles/` | modify — same three removals for any that carry them | Requires Owner approval |
| `$GENERAL_MANIFEST` | modify — add `roles/required-readings.yaml` as a required entry | Requires Owner approval |
| `$A_SOCIETY_PUBLIC_INDEX` | modify — register `$INSTRUCTION_REQUIRED_READINGS` | Requires Owner approval |
| Framework update report (new file in `$A_SOCIETY_UPDATES_DIR`) | additive — assess classification per `$A_SOCIETY_UPDATES_PROTOCOL` | Requires Owner approval |
| `a-society/a-docs/roles/required-readings.yaml` (new; register as `$A_SOCIETY_REQUIRED_READINGS`) | additive — A-Society's own instance | Curator authority — implement directly |
| All role files under `a-society/a-docs/roles/` | modify — remove `required_reading` / `universal_required_reading` frontmatter blocks; remove prose required-reading sections; remove context confirmation ritual | Curator authority — implement directly |
| `$A_SOCIETY_AGENTS` | modify — remove prose required-reading sections; remove context confirmation ritual | Curator authority — implement directly |
| `$A_SOCIETY_INDEX` | modify — register `$A_SOCIETY_REQUIRED_READINGS` | Curator authority — implement directly |
| `$A_SOCIETY_AGENT_DOCS_GUIDE` | modify — add rationale entry for `required-readings.yaml` | Curator authority — implement directly |
| `$INSTRUCTION_AGENTS` | assess — if agents.md no longer carries required-reading sections, the instruction for creating agents.md may need updating | Curator authority — implement directly if in scope |
| `$INSTRUCTION_ROLES` | assess — if role documents no longer carry required_reading frontmatter, the instruction for creating role documents may need updating | Curator authority — implement directly if in scope |
| `$A_SOCIETY_INITIALIZER_ROLE` (`a-society/agents/initializer.md`) | assess — if the Initializer is responsible for producing required-readings.yaml during bootstrap, update accordingly | Curator authority — implement directly if in scope |

**Timing of direct-authority items:** All `[Curator authority — implement directly]` items are batched into the post-approval implementation pass. Do not implement a-docs changes before the general/ proposal is approved — the A-Society required-readings.yaml content and the a-docs role file cleanup must align with the approved general/ instruction form.

---

**What is changing and why:**

The runtime currently reads required readings from `required_reading` frontmatter in individual role files. This has two problems: (1) it is scattered — the runtime must open and parse every role file to discover what to load; (2) it creates duplication — the same list appears in machine-readable frontmatter and in prose sections of the same file, and both get stale independently.

The new model: a single `a-docs/roles/required-readings.yaml` file, keyed by role, is the sole machine-readable authority for required readings. The runtime reads one file and gets everything. Prose required-reading sections and frontmatter blocks in role files become vestigial and are removed.

The approved schema (from `01-owner-workflow-plan.md`):

```yaml
universal:
  - $VAR_NAME       # loaded for every role in this project
roles:
  owner:
    - $VAR_NAME
  curator:
    - $VAR_NAME
  # one key per role; key matches the role name used by the runtime parser
```

Variable names reference entries in the project's own index. Every project that uses A-Society creates one instance of this file at `a-docs/roles/required-readings.yaml`.

Additionally, the context confirmation ritual ("Context loaded: agents.md, vision, structure... Ready.") is theater under runtime injection — the agent did not choose to load those documents, and confirming that it did provides false confidence rather than a real check. It is removed from all injected content: role files, agents.md, and the general/ templates.

---

## Scope

**In scope:**
- New general/ instruction: how to create and maintain `a-docs/roles/required-readings.yaml` for any project — what the file is, the authoritative schema, how to populate it, and how to keep it current as roles are added
- Updates to existing general/ role templates: remove `required_reading` frontmatter, prose required-reading sections, and context confirmation rituals from all role templates in `general/roles/`
- Manifest update: `roles/required-readings.yaml` added as a required file
- Framework update report: this is a Breaking change for adopting projects — their Curators must create `required-readings.yaml` and their runtimes (if deployed) must be updated. Include the update report draft as a named section in the proposal submission, with classification fields marked `TBD` if not yet determinable; resolve classification per `$A_SOCIETY_UPDATES_PROTOCOL` before submitting.
- A-Society's own `required-readings.yaml` instance and a-docs cleanup (direct authority, post-approval)
- Assessment of `$INSTRUCTION_AGENTS`, `$INSTRUCTION_ROLES`, and `$A_SOCIETY_INITIALIZER_ROLE` — scope any warranted changes as direct-authority items in the same implementation pass

**Out of scope:**
- Runtime implementation — covered by a parallel brief to the Runtime Developer
- Any changes to workflow files, records convention, or improvement protocol
- The "General agents entry-point variable" Next Priorities item — different design area, separate flow

---

**Responsibility transfer note:** Role files currently own their own required-reading declaration (frontmatter + prose). After this change, `required-readings.yaml` owns it. Any instruction that currently tells the role-author to add a `required_reading` frontmatter block (`$INSTRUCTION_ROLES`) is now stale and must be updated in scope.

---

## Likely Target

- New instruction: `a-society/general/instructions/required-readings.md`
- General role templates: `a-society/general/roles/` (all files)
- Manifest: `a-society/general/manifest.yaml`
- A-Society instance: `a-society/a-docs/roles/required-readings.yaml`
- A-Society role files: `a-society/a-docs/roles/` (all files)
- agents.md: `a-society/a-docs/agents.md`
- Update report: `a-society/updates/2026-04-04-required-readings-authority.md`

---

## Open Questions for the Curator

1. Do any general/ role templates beyond owner, curator, and TA carry `required_reading` frontmatter or prose required-reading sections? Enumerate all that do during proposal preparation.
2. Does `$INSTRUCTION_AGENTS` currently specify that agents.md should include a required-reading section or context confirmation ritual? If so, scope the update.
3. Does `$INSTRUCTION_ROLES` currently specify that role documents should include `required_reading` frontmatter? If so, scope the update.
4. Does the Initializer role (`$A_SOCIETY_INITIALIZER_ROLE`) already produce an `a-docs/roles/` structure? If it produces role files during initialization, it should also produce `required-readings.yaml`. Assess and scope if warranted.
5. The new general/ instruction should note that `required-readings.yaml` is the machine-readable authority and that the runtime parser uses the role key to look up role-specific readings. Is there a naming convention for role keys (exact role name, lowercase, hyphenated) that should be stated explicitly in the instruction?

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Required readings authority restructure — required-readings.yaml + context injection cleanup."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment. Return to the Owner session when the proposal is complete with a path to the proposal artifact.

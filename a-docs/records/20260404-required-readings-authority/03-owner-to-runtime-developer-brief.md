# Owner → Runtime Developer: Brief

**Subject:** Required readings authority restructure — runtime context injection overhaul
**Status:** BRIEFED
**Date:** 2026-04-04

---

## Context

The runtime currently loads required readings by parsing `required_reading` frontmatter from individual role files. This is being replaced with a single `a-docs/roles/required-readings.yaml` file per project that the runtime reads once. Additionally, three other context injection problems have been identified and are in scope for this brief.

This brief is part of a multi-domain flow (`20260404-required-readings-authority`). The Curator track runs in parallel — it handles documentation and general/ changes. This brief covers all runtime implementation.

---

## Agreed Changes

Four changes are in scope. All are within Runtime Developer authority; no proposal phase applies to this track.

### Change 1 — Role announcement before context injection

**Current behavior:** Required readings are injected, then (implicitly or separately) the agent learns its role.

**Required behavior:** The first content a new session receives is a role announcement, before any required-reading documents are injected. Format:

```
You are the [Role Name] agent for [project name]. Below is information that will help you play your role.
```

Where `[Role Name]` is the role's display name (e.g., "Owner", "Curator") and `[project name]` is the project identifier (e.g., "a-society", or the adopting project name). This framing gives the agent a reference frame before it reads any documents.

### Change 2 — Date injection

**Current behavior:** No date is injected. Models infer or hallucinate the current date.

**Required behavior:** Inject the current date as part of session initialization, immediately after the role announcement and before required-reading documents. Format:

```
Today's date is [YYYY-MM-DD].
```

Use the system clock at session start time.

### Change 3 — Parse `a-docs/roles/required-readings.yaml` for required readings

**Current behavior:** The runtime reads `required_reading` / `universal_required_reading` frontmatter from individual role files to determine what to load.

**Required behavior:** The runtime reads `a-docs/roles/required-readings.yaml` from the project root. Authoritative schema:

```yaml
universal:
  - $VAR_NAME       # resolved against the project's index; loaded for every role
roles:
  owner:
    - $VAR_NAME
  curator:
    - $VAR_NAME
  # one key per role; key is the lowercase role identifier used internally
```

Loading sequence per session:
1. Read `a-docs/roles/required-readings.yaml`
2. Resolve variable names against the project index
3. Load `universal` entries (every session)
4. Load the role-specific entries for the active role (keyed by the role identifier)
5. Inject role announcement (Change 1), date (Change 2), then resolved document contents in order

If `a-docs/roles/required-readings.yaml` is absent, emit a clear error to the operator (not to the model): `"required-readings.yaml not found at [path] — cannot initialize session."` Do not fall back to frontmatter parsing.

### Change 4 — Return workflow errors to the model instead of stopping

**Current behavior:** When a workflow error is encountered (e.g., record folder not found, `workflow.md` not found in the expected location), orchestration stops and the error is printed to the terminal. The model session ends.

**Required behavior:** Workflow errors are returned to the model as an error message so it has the opportunity to self-correct. The session remains open. Format the error as a user-turn message:

```
Error: [specific error description]. Please correct this and continue.
```

Specific error messages that must be implemented:
- Missing record folder: `"Error: No record folder found at [path]. A record folder must be created before emitting a handoff. Please create the record folder, create workflow.md inside it, and restate your handoff."`
- Missing workflow.md: `"Error: workflow.md not found in [folder]. This file is required before a handoff can be routed. Please create workflow.md in the record folder and restate your handoff."`
- Malformed handoff YAML: `"Error: Handoff block could not be parsed. Expected fields: role (string), artifact_path (string or null). Please correct the handoff block and restate it."`

These errors are returned to the model. Hard failures that indicate operator misconfiguration (missing required-readings.yaml, index resolution failure) are still printed to the terminal and stop orchestration — they are not recoverable by the model.

---

## Files Changed

Enumerate the exact source files modified in your completion artifact. Expected scope based on current runtime structure:

| File | Expected change |
|---|---|
| Runtime context injection / session initialization | Changes 1, 2, 3 — role announcement, date, required-readings.yaml parser |
| Runtime error handling / orchestrator | Change 4 — error return instead of stop |
| `runtime/INVOCATION.md` or equivalent | Note that `required-readings.yaml` must exist in the project root; document the error behavior |

Identify and list the exact files during implementation. If a change requires touching a file not anticipated here, include it in the completion artifact.

---

## Verification Scope

Repository-wide across `runtime/`. Verify:
- Role announcement appears before document injection in all session initialization paths
- Date injection occurs at every session start
- No remaining reads of role-file frontmatter for required-reading resolution
- Workflow error paths return user-turn messages instead of terminating
- Existing tests updated or new tests added for all four behaviors

---

## Completion Artifact

File at the next available sequence position in `a-society/a-docs/records/20260404-required-readings-authority/` (read the folder to confirm the slot before naming). Sections required:
- Modified files (exact repo-relative paths)
- Implemented behavior (one paragraph per change, confirming behavior matches this brief)
- Verification summary
- Deviations from this brief (if any — with rationale)

Return to the Owner session when the completion artifact is filed.

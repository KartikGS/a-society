# How to Maintain Per-Role Required Readings

## What Is `required-readings.yaml`?

`required-readings.yaml` is a per-role, machine-readable startup-context file.

Each declared role keeps its own file at:

`a-docs/roles/<role-id>/required-readings.yaml`

The runtime uses the active role's file to inject exactly the startup context that role needs. This replaces the older shared authority model and avoids hidden "universal" context that may bloat every session whether it is needed or not.

---

## Why the File Is Split Per Role

Context should be role-specific.

If a document is required by five roles, list it in five role files. That duplication is intentional: it keeps the loading decision explicit and local to the role that needs the file.

Do not centralize startup context in a shared `roles/required-readings.yaml`. Shared context lists drift toward "load everything for everyone," which increases cost and latency.

---

## Where It Lives

Each role folder under `a-docs/roles/` should contain:

- `main.md` — the role's startup contract
- `required-readings.yaml` — the role's startup context authority
- `ownership.yaml` — the role's surface-accountability file
- any workflow-linked support docs specific to that role

The `roles/` folder itself should contain only role folders.

---

## The Schema

```yaml
role: role-id
required_readings:
  - $VARIABLE_NAME
  - $VARIABLE_NAME
```

### Field Definitions

- `role` — the kebab-case role identifier for the folder that owns this file
- `required_readings` — the ordered list of `$VARIABLE_NAME` references the runtime injects for that role at session start

Do **not** include runtime-owned contract documents in this file. The A-Society runtime injects its own standing contracts separately.

---

## Role ID Convention

Role IDs must be kebab-case everywhere the framework needs a machine-readable role identifier:

- role folder names
- `required-readings.yaml` `role` field
- `ownership.yaml` `role` field
- runtime role normalization
- any machine-readable role lookup derived from role names

### Rules

1. Lowercase the role name.
2. Replace spaces or other separators with `-`.
3. Remove leading or trailing separators.

### Examples

- `Owner` -> `owner`
- `Curator` -> `curator`
- `Technical Architect` -> `technical-architect`
- `Framework Services Developer` -> `framework-services-developer`
- `Orchestration Developer` -> `orchestration-developer`

---

## Authority & Maintenance

This file is the sole startup-context authority for its role.

- Do not declare required readings in role-file frontmatter.
- Do not declare required readings in `agents.md`.
- Do not rely on prose "read these files first" rituals when the runtime can load them directly.

If a role's `required-readings.yaml` drifts from the files that role actually needs to act safely, the project is in an inconsistent state.

### Maintenance Rules

1. When a role gains a new always-needed startup dependency, add it to that role's file.
2. When a role no longer needs a startup dependency, remove it rather than leaving it "just in case."
3. When a file is moved or retired, update the index first, then update any affected role files.
4. Prefer just-in-time workflow-linked support docs for phase-specific guidance instead of preloading them here.
5. If a file is only needed by one role, list it only in that role's file.

---

## Context-Read Timing Rules

**Runtime-managed sessions:** Files injected from the active role's `required-readings.yaml` count as already loaded. Role documents and bootstrap prompts must not instruct default rereads of those files.

**Manual orientation:** Humans or agents orienting manually may still follow the role's `required_readings` list as a startup sequence.

Do not duplicate the list as prose in `agents.md` or in role files. That creates a second authority that will drift.

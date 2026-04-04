# How to Maintain Required Readings

## What Is required-readings.yaml?

`a-docs/roles/required-readings.yaml` is the single, machine-readable source of truth for all documents an agent must read before beginning a session.

The A-Society runtime uses this file to programmatically inject the correct context for every role. Projects that do not maintain this file correctly will have agents that lack the necessary orientation to perform their tasks safely.

---

## The Schema

The file follows a strict YAML schema:

```yaml
universal:
  - $VARIABLE_NAME
  - $VARIABLE_NAME
roles:
  role-id:
    - $VARIABLE_NAME
```

### 1. `universal`
A list of `$VARIABLE_NAME` references registered in the project's index. These documents are injected for **every** role in the project.

**Universal Minimum Set:**
Every project's universal list must include at minimum:
- The variable for the project's own `agents.md`
- The variable for the project's own file index (`indexes/main.md`)
- `$INSTRUCTION_MACHINE_READABLE_HANDOFF`

### 2. `roles`
A map where each key is a **Role ID** and each value is a list of role-specific `$VARIABLE_NAME` references.

**Role ID Naming:**
Keys must be lowercase, hyphenated strings that match the role name as registered in the `agents.md` roles table (e.g., `owner`, `curator`, `technical-architect`).

---

## Authority & Maintenance

**This file is the sole authority.**
- No required readings may be declared in role file frontmatter or prose.
- No required readings may be declared in `agents.md` frontmatter or prose.

If a project's `required-readings.yaml` drifts from the project's index or its intended role-reading set, the structure is in an inconsistent state.

**Maintenance Rules:**
1. When a new universal document is added to the project, add its `$VAR` to the `universal` list.
2. When a new role is added, create a new key in the `roles` map and populate its required reading list.
3. When a file is retired or moved, update the index first. If the variable is retired, remove it from `required-readings.yaml`.

---

## Human/Manual Orientation

While the runtime handles injection for agents, humans or agents performing manual orientation still consult this file. The list ordered within `required-readings.yaml` represents the **correct reading sequence** (e.g., `agents.md` → `$INDEX` → `$VISION` → `$STRUCTURE`).

Do not replicate this list as prose in `agents.md` or role files. Replicating the list creates a maintenance burden where the prose and the machine-readable authority will inevitably drift.

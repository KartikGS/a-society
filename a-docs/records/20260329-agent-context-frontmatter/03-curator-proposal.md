# Proposal: Agent context frontmatter

## Overview

This proposal establishes YAML frontmatter in `agents.md` and all A-Society role files as the single source of truth for required-reading sets. This enables the runtime layer to programmatically assemble the context bundle for any session, eliminating the co-maintenance obligation currently residing in `registry.ts`.

Additionally, `$INSTRUCTION_MACHINE_READABLE_HANDOFF` is added to the universal reading list to ensure all agents are oriented to the machine-readable handoff contract.

## Rendered Frontmatter

### 1. `a-society/a-docs/agents.md`

```yaml
---
universal_required_reading:
  - $A_SOCIETY_AGENTS
  - $A_SOCIETY_INDEX
  - $INSTRUCTION_MACHINE_READABLE_HANDOFF
---
```

### 2. `a-society/a-docs/roles/owner.md`

```yaml
---
required_reading:
  - $A_SOCIETY_VISION
  - $A_SOCIETY_STRUCTURE
  - $A_SOCIETY_ARCHITECTURE
  - $A_SOCIETY_PRINCIPLES
  - $A_SOCIETY_LOG
  - $A_SOCIETY_WORKFLOW
---
```

### 3. `a-society/a-docs/roles/curator.md`

```yaml
---
required_reading:
  - $A_SOCIETY_VISION
  - $A_SOCIETY_STRUCTURE
  - $A_SOCIETY_PRINCIPLES
  - $A_SOCIETY_AGENT_DOCS_GUIDE
---
```

### 4. `a-society/a-docs/roles/technical-architect.md`

```yaml
---
required_reading:
  - $A_SOCIETY_VISION
  - $A_SOCIETY_STRUCTURE
  - $A_SOCIETY_ARCHITECTURE
  - $A_SOCIETY_PRINCIPLES
---
```

### 5. `a-society/a-docs/roles/tooling-developer.md`

```yaml
---
required_reading:
  - $A_SOCIETY_ARCHITECTURE
  - $A_SOCIETY_TOOLING_PROPOSAL
  - $A_SOCIETY_TOOLING_ADDENDUM
---
```

### 6. `a-society/a-docs/roles/runtime-developer.md`

```yaml
---
required_reading:
  - $A_SOCIETY_ARCHITECTURE
---
```

---

## Instruction Updates

### `$INSTRUCTION_AGENTS` (`a-society/general/instructions/agents.md`)

Add the following section at the end of the file:

```markdown
## YAML Frontmatter: Universal Required Reading

To enable programmatic session orchestration and context injection, every `agents.md` must include a YAML frontmatter block at the very top of the file, before any other content.

### Field: `universal_required_reading`

- **Value:** A YAML list of `$VARIABLE_NAME` references registered in the project index.
- **Semantics:** This set represents the baseline context bundle injected by the runtime for every role in the project.
- **Universal minimum set:** At initialization, every project includes at minimum:
  - `$PROJECT_AGENTS`
  - `$PROJECT_INDEX`
  - `$INSTRUCTION_MACHINE_READABLE_HANDOFF` (from A-Society)

### Example

```yaml
---
universal_required_reading:
  - $A_SOCIETY_AGENTS
  - $A_SOCIETY_INDEX
  - $INSTRUCTION_MACHINE_READABLE_HANDOFF
---
```

### `$INSTRUCTION_ROLES` (`a-society/general/instructions/roles/main.md`)

Add the following section at the end of the file:

```markdown
## YAML Frontmatter: Role-Specific Required Reading

To enable programmatic session orchestration, every role document must include a YAML frontmatter block at the very top of the file, before any other content.

### Field: `required_reading`

- **Value:** A YAML list of `$VARIABLE_NAME` references registered in the project index.
- **Derivation rule:** List every `$VAR` reference in the role file's `## Context Loading` section, in the order given. Exclude:
  1. Any item already in `universal_required_reading` (e.g., `$PROJECT_AGENTS`, `$PROJECT_INDEX`, `$INSTRUCTION_MACHINE_READABLE_HANDOFF`)
  2. The role file itself (injected automatically by the runtime)

### Example

```yaml
---
required_reading:
  - $A_SOCIETY_VISION
  - $A_SOCIETY_STRUCTURE
  - $A_SOCIETY_PRINCIPLES
---
```

---

## Framework Update Report Draft

**Framework Version:** v24.0
**Previous Version:** v23.1

## Summary

This update establishes YAML frontmatter in `agents.md` and all role files as the single source of truth for required-reading sets. This change enables programmatic context injection and eliminates the maintenance gap between role documentation and session orchestration registries.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 1 | Mandatory new frontmatter for `agents.md` and all role files — Curator review required. |

---

## Changes

### YAML frontmatter for agent context injection

**Impact:** Breaking
**Affected artifacts:** `$INSTRUCTION_AGENTS`, `$INSTRUCTION_ROLES`, all Project Role Files
**What changed:** Added mandatory YAML frontmatter for `universal_required_reading` to `agents.md` and `required_reading` to all project role files.
**Why:** To ensure the runtime layer can programmatically assemble session context bundles from a single source of truth, eliminating co-maintenance drift and improving orchestration reliability.
**Migration guidance:** Curators must add YAML frontmatter to their project's `agents.md` and all role files.
- **For `agents.md`**: Add `universal_required_reading` list including `$[PROJECT]_AGENTS`, `$[PROJECT]_INDEX`, and `$INSTRUCTION_MACHINE_READABLE_HANDOFF`.
- **For Role documents**: Add `required_reading` list derived from each role's `## Context Loading` section, in order. Exclude universal items and the role document itself.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.

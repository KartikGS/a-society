# Resubmission: Agent context frontmatter

## Overview

Applying the correction specified in the Phase 2 Review Decision (`04-owner-to-curator.md`). All other frontmatter lists and the `$INSTRUCTION_ROLES` section were approved as proposed in `03-curator-proposal.md`.

## Corrected Instruction: `$INSTRUCTION_AGENTS`

The "Universal minimum set" is updated to use functional descriptions of the required variables rather than fictional `$PROJECT_*` placeholders.

---

## YAML Frontmatter: Universal Required Reading

To enable programmatic session orchestration and context injection, every `agents.md` must include a YAML frontmatter block at the very top of the file, before any other content.

### Field: `universal_required_reading`

- **Value:** A YAML list of `$VARIABLE_NAME` references registered in the project index.
- **Semantics:** This set represents the baseline context bundle injected by the runtime for every role in the project.
- **Universal minimum set:** Every project's universal list should include at minimum:
  - The variable registered in the project's index for its own `agents.md`
  - The variable registered in the project's index for its own file index
  - `$INSTRUCTION_MACHINE_READABLE_HANDOFF` — registered in the project's index per the adoption instructions in the handoff instruction itself

### Example

```yaml
---
universal_required_reading:
  - $A_SOCIETY_AGENTS
  - $A_SOCIETY_INDEX
  - $INSTRUCTION_MACHINE_READABLE_HANDOFF
---
```

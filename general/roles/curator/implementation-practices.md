# Curator Implementation Practices

## Scope Routing

Not all changes to `general/` require an Owner proposal. Route based on change type:

- **Clarifications, precision fixes, worked examples, vocabulary alignment within existing structure** — implement directly within Curator authority.
- **New scope additions** — new instruction types, role templates, structural categories, or anything that expands what `general/` promises — require an Owner proposal before implementation.

When in doubt, propose rather than implement.

**Two-tier model.** `general/` is partitioned into a universal layer (the `general/` root and its non-`project-types/` sub-folders) and a category layer (`general/project-types/<type>/`). The change-type rules above apply at both tiers. One additional gate applies at the category layer: **creating a new `general/project-types/<type>/` category folder is a scope decision and requires explicit Owner approval before any content is placed under it.** Adding content to an already-approved category follows the same change-type rules. Do not create a category folder as part of an implementation pass — route the category creation as a separate Owner-approval step.

---

## Proposal Stage

Before submitting a proposal:

- match the rendering pattern of adjacent content in the target document
- verify source-state claims made in the brief against the live document
- when adapting between project-specific and general contexts, verify that variables, terminology, and examples are valid in the target context
- when proposing an addition to `general/`, classify the placement as universal-layer or category-layer using the placement tests in the project's structure document; for category-layer placements, name the category, and treat creation of a new category folder as a separate scope decision that requires explicit Owner approval before any content is placed under it

## Implementation Stage

During implementation:

- treat schema blocks and surrounding explanatory prose as one consistency surface
- normalize stale tool-surface terminology into accurate capability language when needed
- use exact technical names when summarizing implementations or registration outcomes
- treat registration as indexing existing artifacts, not inventing new standing references by default

When a change touches an operator-facing reference, compare the document directly against the live implementation or CLI surface rather than relying on summaries from other artifacts.

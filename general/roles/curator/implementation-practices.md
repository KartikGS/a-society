# Curator Implementation Practices

## Proposal Stage

Before submitting a proposal:

- match the rendering pattern of adjacent content in the target document
- verify source-state claims made in the brief against the live document
- when adapting between project-specific and general contexts, verify that variables, terminology, and examples are valid in the target context

## Implementation Stage

During implementation:

- treat schema blocks and surrounding explanatory prose as one consistency surface
- normalize stale tool-surface terminology into accurate capability language when needed
- use exact technical names when summarizing implementations or registration outcomes
- treat registration as indexing existing artifacts, not inventing new standing references by default

When a change touches an operator-facing reference, compare the document directly against the live implementation or CLI surface rather than relying on summaries from other artifacts.

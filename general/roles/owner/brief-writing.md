# Owner Brief Writing

## Brief-Writing Quality

When a change is fully derivable from existing approved direction, write a fully specified brief:

- state the scope explicitly
- name the target file or files explicitly
- state the implementation approach explicitly
- state `Open Questions: None` when no downstream judgment is required

When a brief spans multiple files, provide a files-changed summary that names the target files and the expected action for each one.

When a brief defines or revises a standing rule and applies it to concrete files in the same flow, compare the rule text against the file-specific instructions before handoff. The receiving role should be able to satisfy both without resolving contradictions on its own.

When a brief removes or renames a structural element that other files consume, enumerate the consuming sites that must change. Do not scope only the definition site and leave the downstream role to discover the rest.

When a brief introduces a schema, field, or structural vocabulary change, scope the surrounding prose sweep too. Updating only the schema block is incomplete if adjacent explanation still uses the old terms.

When a documentation change defines or modifies a schema with a programmatic consumer, scope the corresponding code change in the same flow. Do not split the documentation and code paths unless the workflow explicitly intends that separation.

## Constraint-Writing Quality

Decision artifacts and review constraints should be written with the same precision as briefs. The receiving role should be able to follow the constraint mechanically, not infer its meaning.

When a constraint authorizes or requires registration work, scope it by the specific files or variables in question, not by an ambiguous folder boundary.

When a constraint retires an index variable or deletes a registered artifact, sweep the project for references to that variable before finalizing the scope.

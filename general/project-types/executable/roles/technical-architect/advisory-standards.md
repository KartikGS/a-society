# Technical Architect Advisory Standards

## Advisory Standards

These rules apply whenever an advisory-producing role emits design or implementation guidance.

Behavioral requirements that must be implemented belong in the specification section of the advisory, not only in summary prose.

Before asserting that a file exists, does not exist, or must be created, verify that claim against the relevant directory scope directly.

When specified behavior depends on new imports or dependencies, name them explicitly.

When an advisory defines queryable identifiers such as attribute names, event names, or field names, treat exact identifier names as contract terms.

When an advisory defines structured representations for externally sourced data, include an explicit malformed or unparseable state.

When an advisory specifies observability or instrumentation tests, distinguish schema-shape checks from production-path execution.

When an advisory introduces new infrastructure or bypasses an existing path, explicitly state why the existing path cannot be extended first.

When a brief contains design constraints, distinguish hard constraints from preferences before treating them as binding.

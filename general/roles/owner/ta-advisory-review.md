# Owner Advisory and Integration Review

## Advisory Review

When reviewing an advisory from a Technical Architect or equivalent advisory-producing role, apply two distinct criteria: design correctness and spec completeness. Design correctness is not sufficient if the implementing role would still have to infer the implementation path.

For every interface, parameter, or behavioral change described in the advisory, verify that the full implementation path is specified. A change that requires the implementing role to infer threading or integration is incomplete.

For every type or structure representing data parsed from external input, verify that parse failure is represented explicitly. A success-only type is structurally incomplete.

## Integration-Gate Review

When reviewing an advisory-backed integration report, use a stricter evidence hierarchy than the report summary alone:

1. the approved design
2. direct comparison against the live implementation and operator-facing references
3. the advisory role's recommendation

If queryable contract names drift from the approved design, treat that as blocking unless the design itself was revised and approved.

If the gate concerns observability or integration coverage, require evidence from the production call path unless the approved design explicitly scoped the check to schema shape only.

# A-Society Feedback: Final Dream Initialization (Greenfield)

## Summary

A greenfield initialization flow surfaced two framework-level friction points: (1) the Owner role's `ownership.yaml` guidance lacks specificity boundaries, leading to overbroad surface claims that overlap with domain roles; and (2) join node semantics in workflows are undocumented at the node-contract level, creating a failure mode where an agent may begin join-node work before all expected inputs arrive. Both were correctable within the flow by the Owner, but the underlying gaps are framework issues that would benefit from upstream guidance and/or runtime guardrails.

## Framework-Improvement Candidates

| Candidate | Evidence from findings | Classification | Suggested surface | Notes |
|---|---|---|---|---|
| Ownership scoping guidance should warn against "folder-first convenience" overclaims | Owner's `ownership.yaml` claimed the entire `a-docs/` tree as its surface, overlapping with narrower domain-role claims (Writer, Developer, Artist each own subfolders). The ownership philosophy's "specificity wins" rule technically resolves overlaps, but no built-in guidance advises agents against broad catch-all claims that mislead downstream readers. | Universal | `general/` or runtime agent instructions | The failure mode "folder-first convenience instead of truth ownership" is already named in the philosophy but is not surfaced in agent instructions or validated. Consider adding an ownership-principles primer or a validation check that warns when an ownership surface overlaps entirely with another role's explicit claims. |
| Workflow node contracts should make join semantics explicit — "wait for all expected inputs" | The `owner-review-game` node is a join point receiving from two parallel tracks (`developer-build`, `artist-create`), but its node contract did not tell the Owner to wait for both. The runtime contract permits join activation on first input, so an agent could start reviewing an incomplete game. The Owner corrected this locally, but the framework has no convention or validation enforcing that join nodes document input-completeness expectations. | Universal | `general/` and/or workflow schema | The issue is not project-specific — every workflow with a join node across any domain (software, writing, research, etc.) has this vulnerability. Consider: (a) a workflow schema convention requiring a `join-wait-for` field on join nodes, or (b) runtime-level enforcement that auto-buffers handoffs for nodes whose outgoing edges have multiple incoming sources. |

## Suggested PR Share Text

### Title

Framework feedback: ownership scoping overclaims and undocumented join-node semantics from greenfield initialization

### Body

Two framework-improvement candidates surfaced during a greenfield initialization flow:

1. **Ownership scoping guidance** — The Owner role's `ownership.yaml` claimed the entire `a-docs/` tree as its surface, overlapping with narrower domain-role claims. The "specificity wins" rule resolves this technically, but nothing in agent instructions or validation advises against broad "folder-first convenience" claims that mislead downstream readers. A universal candidate for `general/` — consider adding ownership-principles guidance or a surface-overlap validation warning.

2. **Join node semantics** — A workflow node receiving from two parallel tracks had no contract-level directive to wait for both inputs. The runtime's join activation rule ("may activate as soon as any incoming handoff arrives") means an agent could start work with incomplete information. A universal candidate for `general/` — consider a `join-wait-for` schema field or runtime-level handoff buffering for join nodes.

Both were fixable by the Owner within the flow. This feedback is about upstream framework improvements, not project-local changes.

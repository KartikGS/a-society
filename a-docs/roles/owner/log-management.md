# Owner Log Management

## Intake Validity Sweep

After forming an intake scope assessment — the likely files, design areas, or concepts the work will touch — sweep `$A_SOCIETY_LOG`'s Next Priorities entries for overlap. For each overlapping entry, evaluate whether prior work has already **addressed**, **contradicted**, **restructured**, or **partially addressed** it. Surface flagged entries before proceeding, and update the log before the brief is written.

## Next Priorities Merge Assessment

The project log `$A_SOCIETY_LOG` — all sections (Current State, Recent Focus, and Next Priorities). The log entry recording a closed flow is written by the Owner at Forward Pass Closure. When adding any Next Priorities item (at intake or when resolving backward-pass findings), apply the **merge assessment** before filing: scan existing items for (1) same target files or same design area, (2) compatible authority level, and (3) same role path through `$A_SOCIETY_WORKFLOW`, or routable as parallel tracks in a single multi-domain flow. Items that would route through different role paths (e.g., one Curator track, one executable developer track) may still merge if they share a design area and are cohesive enough to run as independent parallel tracks in a single flow without sequencing conflict. When a merge is identified, replace the existing item(s) with a merged item retaining all source citations. Items are removed when their flows close.

## Standing-Log Sweep

Treat `$A_SOCIETY_LOG` as a standing document, not only a queue of Next Priorities items. Run this sweep whenever intake or closure work changes project vocabulary:
- a role, role family, workflow, layer, or executable surface is added, renamed, or retired
- a count the log states changes, such as the number of roles
- the version scheme changes
- a scope tag is needed, renamed, or retired

Verify the log's standing text against the sources that define it, not against memory:
- `## Scope Tags`: every tag the flow's entries need exists, and no tag names retired vocabulary
- `## Current State`: every name, count, list, and version identifier matches its source, such as the roles folder, `$A_SOCIETY_WORKFLOW`, or the version in `CHANGELOG.md`

Flag these likely log-surface edits during intake when they are visible, and do not limit the closure sweep to overlapping Next Priorities entries when the project's vocabulary has changed.

## Out-of-Band Work

When the Owner records work performed outside a runtime-managed flow (for example a direct-human-directed change with `Record: none`), run the same closure overlap sweep over Next Priorities before writing the log entry. Out-of-band work that skips the sweep leaves stale items behind.

## Closure Coordination

When closing a flow, read `$A_SOCIETY_OWNER_CLOSURE` and complete its overlap sweep, plus the Standing-Log Sweep when vocabulary changed, before filing the closure artifact. The closure artifact should reflect the already-updated Next Priorities state; it is not the step that defers log cleanup.

# Backward Pass Findings: Owner — 20260319-graph-schema-simplification

**Date:** 2026-03-19
**Task Reference:** 20260319-graph-schema-simplification
**Role:** Owner
**Depth:** Full

---

## Review of Curator Findings

**Finding 1 — `$A_SOCIETY_UPDATES_TEMPLATE` version field annotations:** Confirmed and prioritized. The template is the authoritative source agents use to draft reports; if it includes annotations on the version field lines, agents will follow it and produce malformed output. The protocol prohibition and the template content must match. This is a [S][MAINT] Curator-authority fix.

**Finding 2 — Component 3/4 split state:** Confirmed and flagged as urgent below. The split is intentional and tracked, but the functional impact is more acute than a routine alignment gap.

**Finding 3 — Update-report gate surfacing timing:** Partially agreed. The decision artifact (`04-owner-to-curator.md`) correctly included a Follow-Up Actions section directing the Curator to consult `$A_SOCIETY_UPDATES_PROTOCOL`. That mechanism is correct. The friction came from the Curator discovering the gate obligation during implementation rather than before. Whether to address this at the Owner brief level or the Curator process level is worth assessing but is not an urgent priority.

---

## Findings

### What worked well

The proposal came back clean on the first round. The brief was fully specified — scope, targets, open questions — and the Curator's proposal answered all three open questions, correctly assessed `$A_SOCIETY_IMPROVEMENT` and `$A_SOCIETY_TOOLING_ADDENDUM` as requiring no edits, and correctly flagged the Ink project without pulling it into scope. The single REVISE cycle was on the update report, not on the substantive proposal, and was caused by a pre-existing template gap rather than a brief deficiency.

### Gap: `$A_SOCIETY_UPDATES_TEMPLATE` contradicts `$A_SOCIETY_UPDATES_PROTOCOL`

The template includes `*(A-Society's version after this update is applied)*` and `*(A-Society's version before this update)*` annotations on the version field lines. The protocol's Programmatic Parsing Contract states explicitly: "No trailing text on the version field lines." Any agent drafting an update report from the template will produce malformed output. The template is the wrong source of truth.

Fix: remove both annotations from the template's version field lines. Curator-authority maintenance item.

### Gap: Components 3 and 4 are now functionally broken against the live schema

The workflow graph schema has changed but the tooling implementations have not. This is not merely a theoretical alignment obligation — the Workflow Graph Validator (Component 3) will reject simplified YAML as invalid (it enforces the old schema), and the Backward Pass Orderer (Component 4) will fail to compute order from graphs that lack `first_occurrence_position` and `is_synthesis_role`. Any agent invoking these components against the updated A-Society workflow, or against any correctly-migrated adopting-project workflow, will encounter errors.

The coupling map correctly records the split and the TA advisory obligation. But the urgency is higher than a routine Type A gap: the tooling is invocable by agents (per `$INSTRUCTION_WORKFLOW_GRAPH` and `$GENERAL_IMPROVEMENT`), and the instructions no longer match what the tools accept. This needs a TA advisory + Developer flow prioritized above the three existing documentation follow-ons.

### Observation: the schema change makes Component 4's algorithm design a TA question

With `first_occurrence_position` and `is_synthesis_role` gone from the schema, Component 4 cannot use its current algorithm (sort by `first_occurrence_position`, reverse, append synthesis last). The TA advisory for this component is not a minor interface update — it requires the TA to determine how backward-pass ordering is derived from the simplified graph (edge traversal, node position in the node list, or a new lightweight metadata field). This design question must be resolved in the advisory before the Developer can implement. The advisory scope should be flagged as non-trivial.

---

## Top Findings (Ranked)

1. `$A_SOCIETY_UPDATES_TEMPLATE` annotates version field lines in violation of the protocol — causes malformed reports from agents following the template; [S][MAINT] fix needed — `$A_SOCIETY_UPDATES_TEMPLATE`
2. Components 3 and 4 are functionally broken against the live schema — TA advisory + Developer flow needed urgently; the algorithm design question for Component 4 is non-trivial — `tooling/src/workflow-graph-validator.ts`, `tooling/src/backward-pass-orderer.ts`
3. Update-report gate surfacing — the Follow-Up Actions mechanism in the decision artifact is correct; assess separately whether Curator process guidance needs strengthening — `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR`, `$A_SOCIETY_CURATOR_ROLE`

# Owner → Curator: Briefing

---

**Subject:** General library — Phase 0 gate and complexity template reference (2 changes)
**Status:** BRIEFED
**Date:** 2026-03-17

---

## Agreed Change

Two log priorities (1 and 2) surfaced from the `20260317-compulsory-complexity-gate` backward pass. Both close the general library lag created when Phase 0 was formalized in A-Society's own workflow — the equivalent structure is absent from the general templates that adopting projects use.

**Change 1 — `$GENERAL_OWNER_ROLE`: add Phase 0 gate**

The distributable Owner role template references complexity analysis in the workflow routing bullet but has no artifact requirement and no gate. The post-confirmation protocol describes mapping and routing but does not mention the plan artifact or the tier-based path split. The gap means adopting project Owner agents see no requirement to produce a plan before briefing — they cannot comply with Phase 0 without it.

**Change 2 — `$INSTRUCTION_WORKFLOW_COMPLEXITY` + new `$GENERAL_OWNER_WORKFLOW_PLAN_TEMPLATE`**

The complexity instruction describes the plan artifact's required content but does not point to a template. Adopting project agents reading this instruction have no reference for what the plan file should look like. `$A_SOCIETY_COMM_TEMPLATE_PLAN` fills this role for A-Society internally, but no general equivalent exists.

---

## Scope

**In scope:**

*Change 1 — `$GENERAL_OWNER_ROLE` (`/a-society/general/roles/owner.md`)*

Two targeted edits:

1. **Workflow routing bullet** — Replace the current language that references "complexity analysis at intake" with language that names the plan artifact as a required gate. Target outcome:
   > `**Workflow routing** — routing work into the appropriate workflow by default, including producing a workflow plan artifact at intake before any brief is written (see `$INSTRUCTION_WORKFLOW_COMPLEXITY`), and directing the user to the next session`

2. **Post-Confirmation Protocol "Once the user answers" block** — Replace the current two-bullet (map to workflow + route to next session) with a three-point Phase 0 gate model that mirrors `$A_SOCIETY_OWNER_ROLE` but is generalized (no A-Society-specific workflow names, no A-Society-internal variable references). Target outcome:
   ```
   Once the user answers, the Owner:
   - maps the need to the appropriate workflow
   - creates the record folder and produces `01-owner-workflow-plan.md` — this plan is the approval gate for the flow and must exist before any brief is written
   - **Tier 2 and 3 flows:** writes the Owner-to-Curator brief as the next sequenced artifact, then tells the user which session to use next and what artifact or context to point the downstream role at
   - **Tier 1 flows:** implements directly and proceeds to backward pass within Session A
   ```

*Change 2 — New `$GENERAL_OWNER_WORKFLOW_PLAN_TEMPLATE` + `$INSTRUCTION_WORKFLOW_COMPLEXITY` edit*

1. **Create** `general/communication/conversation/TEMPLATE-owner-workflow-plan.md` — a generalized version of `$A_SOCIETY_COMM_TEMPLATE_PLAN`. Structure must include:
   - YAML frontmatter with: `type: owner-workflow-plan`, `date`, five complexity axis fields (`domain_spread`, `shared_artifact_impact`, `step_dependency`, `reversibility`, `scope_size`; allowed values: `low | moderate | elevated | high`), `tier` (allowed: `1 | 2 | 3`), `path` (ordered list of role names), `known_unknowns` (list of strings; `[]` valid if none)
   - Template usage instruction block (above first `---`): "do not modify this file; when instantiating, omit this header block; create into the active record folder as `01-owner-workflow-plan.md`; all five `complexity` axis fields, `tier`, and `path` must be filled in"
   - Completion gate note: "This plan must exist before any other artifact in the record folder. Implementation does not begin until it exists."
   - Prose sections: **Complexity Assessment** (table: Axis / Signal / Level), **Routing Decision** (prose), **Path Definition** (ordered list), **Known Unknowns** (write "None" explicitly when none)
   - No A-Society-specific references, no internal variable names, no project-specific language

2. **Register** in public index (`/a-society/index.md`): add row `$GENERAL_OWNER_WORKFLOW_PLAN_TEMPLATE | /a-society/general/communication/conversation/TEMPLATE-owner-workflow-plan.md | Ready-made workflow plan template — instantiated at intake as `01-owner-workflow-plan.md` in the record folder; five complexity axes, tier, path, known unknowns`

3. **Update manifest** (`/a-society/general/manifest.yaml`): add entry under the `# ── Communication ──` section alongside the other `communication/conversation/TEMPLATE-*.md` entries:
   ```yaml
   - path: communication/conversation/TEMPLATE-owner-workflow-plan.md
     description: "Workflow plan template — instantiated by the Owner at intake as `01-owner-workflow-plan.md`; five complexity axes, tier, path, and known unknowns"
     required: true
     scaffold: copy
     source_path: general/communication/conversation/TEMPLATE-owner-workflow-plan.md
   ```

4. **Edit `$INSTRUCTION_WORKFLOW_COMPLEXITY`** — in the "Producing a Workflow Plan" section, after the sentence "The workflow plan is the Owner's intake artifact…", add a sentence pointing to the template: "Use `$GENERAL_OWNER_WORKFLOW_PLAN_TEMPLATE` as the base; place the instantiated plan in the record folder as `01-owner-workflow-plan.md`."

**Out of scope:**
- `$A_SOCIETY_OWNER_ROLE` — the A-Society-internal owner role already has correct Phase 0 language; do not touch
- `$A_SOCIETY_RECORDS` — records convention artifact sequence shows `01-` as the brief, which is stale post-Phase 0; this is a separate item, do not address in this flow
- Any changes to the Initializer or other agent roles

---

## Open Questions

None.

---

## Follow-Up Actions

After implementation and registration, check `$A_SOCIETY_UPDATES_PROTOCOL` to determine whether these changes qualify for a framework update report and, if so, which impact classification applies. Do not pre-determine classification before consulting the protocol.

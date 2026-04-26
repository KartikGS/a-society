# Brief: Project Health Dashboard — Library Foundation

**Subject:** Design for "Project Health Metric" general instructions
**Type:** Owner to Curator Brief
**Date:** 2026-04-26

---

## Requirement

As part of the Project Health Dashboard stress test, we need a general library instruction that allows any project adopting A-Society to define a "Project Health Metric."

The goal is to move from "feeling" that a project is healthy to having structured, agent-readable metrics.

### What Must Happen:
You are tasked with designing a new instruction document in `general/instructions/` (or a suitable sub-folder) that explains:
1. **What is a Project Health Metric?** — Define the concept (e.g., a measurable indicator of project alignment, completeness, or velocity).
2. **How to define one** — Provide a template or set of rules for a project owner to declare a metric (e.g., "Metric: Documentation Coverage; Target: 90% of all roles have required-readings.yaml; Verification: Script X").
3. **Where to store them** — Recommend a standard location within a project's `a-docs/` (e.g., `a-docs/project-information/health-metrics.md`).
4. **How agents should use them** — Instructions for agents to reference these metrics during backward-pass analysis to suggest improvements.

### Constraints:
- **Domain Agnostic:** The instructions must work for a software project, a legal project, or a research project equally.
- **Additive:** This is a new instruction type, so you must produce a **proposal artifact** for my approval before implementing the file in `general/`.

---

## Deliverable
A proposal for the `general/` instruction document, including the proposed content and file path.

## Success Criteria
- The proposal is domain-agnostic.
- The proposal clearly defines the "What, How, and Where" of health metrics.
- The proposal adheres to the A-Society design principles of context efficiency and structural coherence.

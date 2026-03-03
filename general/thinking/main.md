# General Principles

These principles apply to every agent working on this project. They complement the reasoning framework (`[THINKING_REASONING]`) and the operational reminders (`[THINKING_KEEP_IN_MIND]`).

> [CUSTOMIZE] Add or remove principles that reflect the specific operational context of this project.
> Principles here should be cross-role — applicable to every agent regardless of specialization.

## 1) Clarify Before Building
- Resolve ambiguity before implementation.
- Make assumptions explicit and testable.

## 2) Evidence Over Intuition
- Prefer command output, reproducible checks, and concrete references.
- When uncertain, probe the system instead of guessing.

## 3) Measurable Quality
- Use measurable acceptance criteria where possible.
- Avoid vague standards like "fast" or "clean" without thresholds.

## 4) Reversible Change
- Prefer changes with simple rollback paths.
- Avoid coupling unrelated modifications in one step.

## 5) Contract Preservation
- Treat interfaces, contracts, and explicit agreements as invariants.
- If a contract must change, record and communicate the change clearly.

## 6) Scope Integrity
- Respect role boundaries and documented ownership.
- Escalate when requests cross scope or decision authority.

## 7) Failure Transparency
- Classify failures clearly and explicitly.
- Do not hide blockers; report early with evidence.

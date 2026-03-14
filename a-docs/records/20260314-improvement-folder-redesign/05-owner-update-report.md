**Subject:** Framework update report — improvement folder redesign
**Status:** APPROVED
**Date:** 2026-03-14

---

## Decision

APPROVED. Publish to `$A_SOCIETY_UPDATES_DIR` and increment `$A_SOCIETY_VERSION` to v8.0.

Classifications are correct. Version number is correct (three Breaking changes; MAJOR increment from v7.0). Migration guidance is specific and actionable throughout.

---

## Implementation Note for Curator

One minor observation for the backward pass, not a blocker: Change 4's migration guidance says "naming which role produces findings first and why" — the "why" implies a project-specific decision where the traversal algorithm already provides the answer. Consider softening to "naming which role produces findings first (per the traversal algorithm)" in a future maintenance pass if it surfaces as confusion for adopters.

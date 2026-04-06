**From:** Owner
**To:** Curator
**Subject:** Revise — One correction required in `machine-readable-handoff.md`
**Record:** `a-society/a-docs/records/20260405-inflow-human-interaction/`
**Date:** 2026-04-05

---

## Decision

**Revise.** One correction required before acceptance. All other deliverables accepted as submitted.

---

## Required Correction

**File:** `a-society/general/instructions/communication/coordination/machine-readable-handoff.md`

**Problem:** The "When to Emit It" section contains this bullet:

> Do not emit a block for:
> - Clarification exchanges within an active session

This prohibition now contradicts `type: prompt-human`, which is a handoff block emitted specifically during a clarification exchange. An agent reading the document encounters a prohibition and a signal that violates it in the same file.

**Fix:** Replace that bullet with:

> - Clarification exchanges where no formal pause is needed — when you do need human input before continuing, emit `type: prompt-human` rather than a routing handoff

This preserves the original intent (don't emit a routing handoff for incidental back-and-forth) while correctly directing agents to use `prompt-human` when a pause is warranted.

---

## Accepted as Submitted

- The new "Typed signal forms" section (including `forward-pass-closed` and `meta-analysis-complete`) — accepted; the documentation gap closure is appropriate
- `INVOCATION.md` both TA findings applied correctly
- Update report content, filename, and classification
- `VERSION.md` bump to v31.0

---

Resubmit with the single correction applied.

```handoff
role: Curator
artifact_path: a-society/a-docs/records/20260405-inflow-human-interaction/10-owner-to-curator.md
```

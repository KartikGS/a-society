**Subject:** Runtime Operator Surface Event Model — Curator Registration Complete
**Type:** Curator → Owner
**Status:** REGISTRATION COMPLETE
**Date:** 2026-04-11
**Flow:** `20260411-runtime-operator-surface-event-model`

---

## Registration Summary

I have completed the Curator Registration scope as directed:

1. **Verify `$A_SOCIETY_RUNTIME_INVOCATION`:**
   Read and verified that `runtime/INVOCATION.md` accurately matches the shipped operator-facing surface (flow-status, output-channel split, live notice classes, wait indicator behavior, token summary strings, and explicitly declaring no new flags/vars). No modifications to the file were required.

2. **Verify public/internal index accuracy:**
   Updated the descriptions of `$A_SOCIETY_RUNTIME_INVOCATION` in both A-Society indexes (`index.md` and `a-docs/indexes/main.md`). Added "operator output model" to accurately capture the expanded scope. 

3. **Verify `$A_SOCIETY_AGENT_DOCS_GUIDE`:**
   Updated the "What it owns" description for `$A_SOCIETY_RUNTIME_INVOCATION` in `a-docs/a-docs-guide.md` to include "operator output model (live notices and token formats)".

4. **Update report assessment:**
   Reviewed against `$A_SOCIETY_UPDATES_PROTOCOL`. The flow changed runtime code and internal operator-facing runtime documentation (`a-docs/` and `runtime/`). It did not modify any `general/` templates or instructions, nor did it change the `agents/` layer in a way that affects adopting projects' own `a-docs/`. Therefore, in accordance with the protocol, no outbound framework update report is required.

5. **Documented Deviation:**
   Noted and acknowledged. No attempts were made to formally adopt or suppress the direct `console.warn` usage within operator-facing references. 

---

## Handoff

Control is returned to the Owner for Forward Pass Closure.

```handoff
role: Owner
artifact_path: a-society/a-docs/records/20260411-runtime-operator-surface-event-model/11-curator-to-owner.md
```

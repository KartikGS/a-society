**Subject:** Runtime Layer — Provider Agnostic LLM Gateway — Integration Gate Decision
**Status:** APPROVED — Proceed to Registration
**Date:** 2026-03-28

---

## Decision

The integration gate is passed. The implementation is approved as complete and spec-faithful. The Curator may proceed to registration.

---

## Rationale

The TA assessment (`06-ta-integration-assessment.md`) reported zero deviations across all six files. I verified the key implementation files directly:

- `runtime/src/llm.ts` — clean delegating model; `createProvider` factory with unknown-provider guard at construction time; backward-compatible optional `provider?: LLMProvider` constructor; `executeTurn` is a single delegation call. ✓
- `runtime/src/types.ts` — `RuntimeMessageParam`, `LLMProvider` interface, and `LLMGatewayError` (relocated from `llm.ts`) all present and correct; all pre-existing types preserved. ✓
- `runtime/src/providers/anthropic.ts` — behavioral equivalence with the original `llm.ts` implementation confirmed; exact error message strings preserved; catch wraps entire streaming loop. ✓
- `runtime/src/providers/openai-compatible.ts` — construction-time `OPENAI_COMPAT_BASE_URL` guard present; system message prepended correctly; catch ordering correct (specific before base class); catch wraps entire streaming loop. ✓
- `runtime/src/orient.ts` — `MessageParam` renamed to `RuntimeMessageParam` in all three required locations (import, `history` declaration, `initialUserMsg` declaration); no other changes. ✓

The gate condition stated in `$A_SOCIETY_WORKFLOW_RUNTIME_DEV` is met.

---

## Registration Scope

**Curator registration work for this flow:**

The public index (`$A_SOCIETY_PUBLIC_INDEX`) convention for runtime registers `INVOCATION.md` only — individual source files in `runtime/src/` are not indexed. The new `providers/` directory files (`anthropic.ts`, `openai-compatible.ts`) are implementation details within the existing `runtime/` work product. No new public index entries are warranted.

The internal index (`$A_SOCIETY_INDEX`) requires no new entries — no new `a-docs/` files were produced in this flow.

**Curator should confirm:** Scan both indexes to verify no registration gap was introduced by the new `providers/` directory. If the Curator identifies a gap the Owner has not anticipated, surface it in the `curator-to-owner` submission before closing.

**Out of Curator scope:** `runtime/INVOCATION.md` update (new env var documentation for `LLM_PROVIDER`, `ANTHROPIC_MODEL`, `OPENAI_COMPAT_*`). Per the established `orient` precedent, authoring invocation documentation for executable layers is a Developer deliverable. This is filed as a follow-on item below.

---

## Follow-on Item (Added to Next Priorities)

**`[S][MAINT]` — Update `$A_SOCIETY_RUNTIME_INVOCATION` with provider configuration** — `runtime/INVOCATION.md` does not yet document the provider configuration introduced in this flow: `LLM_PROVIDER` selector, `ANTHROPIC_MODEL` override, and the three `OPENAI_COMPAT_*` variables (`OPENAI_COMPAT_BASE_URL` required, `OPENAI_COMPAT_API_KEY` optional, `OPENAI_COMPAT_MODEL` optional). The INVOCATION.md should include: the environment variable table with types, defaults, and required/optional status; example configurations for HuggingFace and Gemini (as in the TA design §4); and the unknown-provider error behavior. Developer deliverable (authoring invocation documentation for executable layers is outside Curator registration scope). Follows Runtime Dev workflow. Merge assessment: no existing Next Priorities item targets `runtime/INVOCATION.md`. New item.

---

## Handoff

Resume the existing Curator session.

```
Next action: Confirm registration completeness for the runtime-provider-agnostic flow
Read: a-society/a-docs/records/20260328-runtime-provider-agnostic/07-owner-to-curator.md
Expected response: Curator-to-Owner submission confirming registration is complete (or surfacing any gap identified during the scan)
```

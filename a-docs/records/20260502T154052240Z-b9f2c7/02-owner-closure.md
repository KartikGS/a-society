---
type: owner-closure
date: "2026-05-02"
status: completed-with-known-test-debt
---

**Subject:** Runtime tree placement migration closure
**Type:** Owner Closure
**Date:** 2026-05-02

---

## Completed Work

- Moved runtime-owned contracts from the runtime root to `runtime/contracts/`:
  `feedback.md`, `handoff.md`, `initialization.md`, and `workflow.md`.
- Reorganized `runtime/src/` into capability folders:
  `common/`, `context/`, `framework-services/`, `improvement/`, `observability/`,
  `orchestration/`, `projects/`, `providers/`, `server/`, `settings/`, and `tools/`.
- Mirrored runtime `.test.ts` files into capability folders while leaving shared helpers and the recursive test runner at `runtime/test/`.
- Updated imports, package startup entrypoint, runtime contract injection paths, bootstrap artifact paths, and public/internal index rows.
- Updated standing placement docs and closed the log item for `[M][RUNTIME] Runtime tree placement migration`.

## Verification

- `npm run build` — passed.
- `npm run lint` — passed with the existing `runtime/ui/src/components/SettingsModal.tsx` hook dependency warning.
- Focused tests passed:
  `test/context/session-entry.test.ts`,
  `test/context/context-injection.test.ts`,
  `test/projects/initialization-bootstrap.test.ts`,
  `test/operator/invocation-doc.test.ts`,
  `test/providers/llm-gateway.test.ts`,
  `test/orchestration/handoff-transition-repair.test.ts`,
  `test/framework-services/runtime-health-checks.test.ts`.
- `npm test` — ran the reorganized 40-file suite. The tree migration paths are valid; the full suite still fails in the standing runtime integration/observability debt areas:
  `test/integration/backward-resubmission.test.ts`,
  `test/integration/same-role-continuity.test.ts`,
  `test/integration/terminal-backward-resubmission.test.ts`,
  `test/integration/unified-routing.test.ts`,
  `test/observability/observability.test.ts`.

## Closure

The placement migration is complete. Remaining failures are not new placement-path failures; they remain covered by the existing Runtime integration test infrastructure priority.

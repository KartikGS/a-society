---

**Subject:** Tooling TypeScript migration
**Status:** BRIEFED
**Date:** 2026-03-15

---

## Agreed Change

The tooling layer (`a-society/tooling/`) is to be migrated from JavaScript to TypeScript. All source and test files convert from `.js` to `.ts`. TypeScript toolchain is added to `package.json`. Documentation references to the implementation language are updated to reflect TypeScript.

This is a human-directed change. No proposal round is required — the direction is given and there are no design questions. The work splits across two roles and proceeds sequentially: Tooling Developer first, Curator after.

---

## Scope

**In scope:**

**Tooling Developer (Session C):**
- Convert all `src/*.js` source files to `src/*.ts` — add TypeScript types throughout
- Convert all `test/*.test.js` test files to `test/*.test.ts`
- Update `package.json`: add TypeScript dev dependencies (`typescript`, `@types/node`, and a TypeScript-compatible test runner such as `ts-node`, `tsx`, or equivalent); update the `test` script to invoke `.ts` files correctly
- Create `tsconfig.json` with appropriate settings for Node.js (module resolution, target, strict mode)
- Update `INVOCATION.md`: update all file path references (`.js` → `.ts` or compiled paths depending on the chosen invocation model), update `require()` syntax if the module format changes, update the Quick Start instructions to reflect the new test command and any new setup steps
- The Developer has full authority over implementation choices: TypeScript runtime (ts-node / tsx / compiled output), module format (CommonJS vs ESM), internal code structure, type annotation approach. These are within Developer authority scope per `$A_SOCIETY_TOOLING_ADDENDUM`.

**Curator (after Tooling Developer completes):**
- Update `a-docs/project-information/architecture.md`: change "Implemented in Node.js" to accurately reflect TypeScript (e.g., "Implemented in TypeScript (Node.js)")
- Update `a-society/index.md` (the public index): update the 6 registered tooling component paths to match the actual invocable paths after migration. The current paths are:
  - `$A_SOCIETY_TOOLING_SCAFFOLDING_SYSTEM` → `/a-society/tooling/src/scaffolding-system.js`
  - `$A_SOCIETY_TOOLING_CONSENT_UTILITY` → `/a-society/tooling/src/consent-utility.js`
  - `$A_SOCIETY_TOOLING_WORKFLOW_GRAPH_VALIDATOR` → `/a-society/tooling/src/workflow-graph-validator.js`
  - `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER` → `/a-society/tooling/src/backward-pass-orderer.js`
  - `$A_SOCIETY_TOOLING_PATH_VALIDATOR` → `/a-society/tooling/src/path-validator.js`
  - `$A_SOCIETY_TOOLING_VERSION_COMPARATOR` → `/a-society/tooling/src/version-comparator.js`
  - The new paths must match whatever the Developer's chosen invocation model produces (e.g., `src/*.ts` if using ts-node, or `dist/*.js` if using compiled output). The Curator must read `INVOCATION.md` post-migration to determine the correct paths before updating the index.
- Assess whether a framework update report is warranted: the 6 public index path changes affect any adopting project that invokes tooling components. Consult `$A_SOCIETY_UPDATES_PROTOCOL` to determine impact classification.

**Out of scope:**
- Changes to any `general/` content
- Changes to the tooling component logic, interfaces, or behavior — this is a language conversion only
- Any changes to other projects (e.g., `llm-journey/`) — they will receive any applicable framework update report separately

---

## Likely Target

Developer: `a-society/tooling/src/`, `a-society/tooling/test/`, `a-society/tooling/package.json`, `a-society/tooling/tsconfig.json` (new), `a-society/tooling/INVOCATION.md`

Curator: `a-society/a-docs/project-information/architecture.md`, `a-society/index.md`

---

## Key Dependency

The Curator's public index update and INVOCATION.md verification depend on the Developer's invocation model choice. The Curator must not update the public index until the Developer has completed the migration and INVOCATION.md reflects the final invocation paths. The architecture.md change is independent and may be done by the Curator at any time.

---

## Open Questions for the Curator

None. The documentation changes are fully derivable from the Developer's output. The Curator reads the completed INVOCATION.md, updates the public index to match, and assesses the update report obligation.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Tooling TypeScript migration."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.

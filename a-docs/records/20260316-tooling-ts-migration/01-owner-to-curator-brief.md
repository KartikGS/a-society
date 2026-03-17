**Subject:** Tooling layer — TypeScript migration (tsx, ESM)
**Status:** BRIEFED
**Date:** 2026-03-16

---

## Agreed Change

Migrate the A-Society tooling layer from plain JavaScript to TypeScript, using `tsx` as the runtime transpiler and ESM (`import`/`export`) as the module format. There is no compilation step — source files are `.ts` and run directly via `tsx`.

This change was human-directed. The rationale is improved type safety and developer experience across the tooling layer. The execution model (`tsx` runtime, no `dist/` folder) and module format (ESM) are confirmed decisions.

This brief covers the **documentation track only** (Curator scope). The code migration — `package.json`, `tsconfig.json`, and all `src/` and `test/` files — is a parallel Tooling Developer task scoped separately.

---

## Scope

**In scope:**
1. Update `$A_SOCIETY_ARCHITECTURE` to reflect TypeScript + tsx + ESM as the confirmed implementation decisions (replacing the current "Implemented in Node.js" statement).
2. Update `$A_SOCIETY_TOOLING_DEVELOPER_ROLE` to replace all "Node.js" implementation-language references with "TypeScript". The role's core description, primary focus, and architecture-doc note all reference Node.js as the implementation language — these must be updated to match the new reality. The runtime (Node.js) and invocation model (agent-invoked) are unchanged and should not be altered.
3. Update `$A_SOCIETY_TOOLING_ADDENDUM` to replace "Node.js" implementation-language references. As with the Developer role, the underlying Node.js runtime and agent-invoked model are unchanged.
4. Update `tooling/INVOCATION.md` throughout:
   - Quick Start: update `npm install` comment (now installs tsx and TypeScript in addition to js-yaml); no other Quick Start changes.
   - All `require()` invocation examples → `import` (named ESM imports). The import path should use the `.ts` extension explicitly (e.g., `import { scaffoldFromManifestFile } from './src/scaffolding-system.ts'`), since tsx resolves `.ts` files directly at runtime.
   - All `src/*.js` file references → `src/*.ts` (in "File:" headers and the test table).
   - All `test/*.test.js` references → `test/*.test.ts` (in the test table).
   - Running note: add a line to the Quick Start or a standalone note stating that all scripts invoking the tooling must be run with `tsx` (e.g., `tsx your-script.ts`), since there is no compiled output.

**Out of scope:**
- `package.json`, `tsconfig.json`, and all `src/` and `test/` file changes — those are Tooling Developer scope.
- The invocation *behavior* of any component — interfaces, return shapes, error conventions — nothing changes except the language and module syntax in the examples.
- The `tooling/` directory structure — file locations do not change, only extensions and syntax.

---

## Likely Target

- `$A_SOCIETY_ARCHITECTURE` — `/a-society/a-docs/project-information/architecture.md`
- `$A_SOCIETY_TOOLING_DEVELOPER_ROLE` — `/a-society/a-docs/roles/tooling-developer.md`
- `$A_SOCIETY_TOOLING_ADDENDUM` — `/a-society/a-docs/tooling-architecture-addendum.md`
- `tooling/INVOCATION.md` — `/a-society/tooling/INVOCATION.md`

---

## Open Questions for the Curator

None. The execution model (tsx, no compile step), module format (ESM, `.ts` import paths), and documentation targets are fully specified. The proposal round is mechanical — no judgment calls are required beyond verifying the changes match this brief.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Tooling layer — TypeScript migration (tsx, ESM)."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.

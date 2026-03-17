**Subject:** Tooling layer — TypeScript migration (tsx, ESM)
**Status:** PENDING_REVIEW
**Type:** Maintenance Change
**Date:** 2026-03-16

---

## Trigger

Human-directed change briefed by the Owner in `01-owner-to-curator-brief.md`. The tooling layer has been migrated to TypeScript with `tsx` as the runtime transpiler and ESM as the module format. Documentation must reflect the new implementation language and module syntax.

---

## What and Why

Four documentation files reference Node.js as the implementation language or use CommonJS `require()` syntax. These references are stale following the TypeScript migration. The changes below update the implementation-language references to TypeScript and convert all invocation examples to ESM `import` syntax. The Node.js runtime and agent-invoked model are unchanged and are left untouched.

---

## Where Observed

A-Society — internal. Documentation artifact staleness discovered as a consequence of the TypeScript migration (human-directed).

---

## Target Location

- `$A_SOCIETY_ARCHITECTURE` — `/a-society/a-docs/project-information/architecture.md`
- `$A_SOCIETY_TOOLING_DEVELOPER_ROLE` — `/a-society/a-docs/roles/tooling-developer.md`
- `$A_SOCIETY_TOOLING_ADDENDUM` — `/a-society/a-docs/tooling-architecture-addendum.md`
- `tooling/INVOCATION.md` — `/a-society/tooling/INVOCATION.md`

---

## Draft Content

### 1. `$A_SOCIETY_ARCHITECTURE`

**One change.** Line 11 — the `tooling/` entry in the four-folder overview:

**Before:**
> Implemented in Node.js; invocation model is agent-invoked (agents call tools and interpret results in natural language — humans do not call tools directly).

**After:**
> Implemented in TypeScript (tsx runtime, ESM); invocation model is agent-invoked (agents call tools and interpret results in natural language — humans do not call tools directly).

No other changes. Line 27 ("Node.js project initialization: The `tooling/` directory is initialized with Node.js project scaffolding…") refers to the runtime platform for `package.json` scaffolding — the runtime is unchanged and this sentence is left as-is.

---

### 2. `$A_SOCIETY_TOOLING_DEVELOPER_ROLE`

**Three changes.**

**Change A — "Who This Is" (core description), line 5:**

Before:
> Its function is to implement the six approved tooling components in Node.js, following the Technical Architect's component designs as binding specifications.

After:
> Its function is to implement the six approved tooling components in TypeScript, following the Technical Architect's component designs as binding specifications.

**Change B — "Primary Focus", line 13:**

Before:
> Implement the six approved tooling components — Path Validator, Version Comparator, Consent Utility, Workflow Graph Schema Validator, Backward Pass Orderer, and Scaffolding System — in Node.js, within `tooling/`, following approved component designs as written.

After:
> Implement the six approved tooling components — Path Validator, Version Comparator, Consent Utility, Workflow Graph Schema Validator, Backward Pass Orderer, and Scaffolding System — in TypeScript, within `tooling/`, following approved component designs as written.

**Change C — "Context Loading", item 2 (architecture-doc note), line 52:**

Before:
> `$A_SOCIETY_ARCHITECTURE` — system overview; confirms `tooling/` placement and the confirmed decisions (Node.js, agent-invoked) that implementation depends on

After:
> `$A_SOCIETY_ARCHITECTURE` — system overview; confirms `tooling/` placement and the confirmed decisions (TypeScript, tsx runtime, ESM; agent-invoked) that implementation depends on

No other changes. Line 22 ("Node.js project initialization: creating `tooling/package.json`…") refers to the runtime platform, not the implementation language — left as-is per brief.

---

### 3. `$A_SOCIETY_TOOLING_ADDENDUM`

**Two changes.**

**Change A — Roles table (Section 1, Overview), line 18:**

Before:
> | Tooling Developer | **New** | Implement approved tooling components in Node.js |

After:
> | Tooling Developer | **New** | Implement approved tooling components in TypeScript |

**Change B — "Tooling Developer (new role)" primary function description, line 27:**

Before:
> **Primary function:** Implement the six approved tooling components in Node.js, following the Technical Architect's component designs as binding specifications.

After:
> **Primary function:** Implement the six approved tooling components in TypeScript, following the Technical Architect's component designs as binding specifications.

No other changes. Line 113 ("Updated `$A_SOCIETY_ARCHITECTURE` — reflects confirmed decisions: `tooling/` as fourth top-level folder, Node.js runtime, agent-invoked model") refers to the runtime, not the implementation language — left as-is per brief.

---

### 4. `tooling/INVOCATION.md`

**Four categories of change.**

#### A. Quick Start — `npm install` comment

Before:
```bash
npm install        # installs js-yaml (only external dependency)
```

After:
```bash
npm install        # installs js-yaml, tsx, and TypeScript
```

#### B. Running note — add after Quick Start block

Add the following note after the closing triple-backtick of the Quick Start block:

```
> **Running note:** All scripts that invoke the tooling must be run with `tsx` (e.g., `tsx your-script.ts`). There is no compiled output — source files are `.ts` and executed directly at runtime.
```

#### C. `require()` → `import` (all occurrences)

Each `require()` call becomes a named ESM import with an explicit `.ts` extension. Full list:

| Before | After |
|---|---|
| `const { scaffoldFromManifestFile } = require('./src/scaffolding-system');` | `import { scaffoldFromManifestFile } from './src/scaffolding-system.ts';` |
| `const { scaffold } = require('./src/scaffolding-system');` | `import { scaffold } from './src/scaffolding-system.ts';` |
| `const { createConsentFile } = require('./src/consent-utility');` | `import { createConsentFile } from './src/consent-utility.ts';` |
| `const { checkConsent } = require('./src/consent-utility');` | `import { checkConsent } from './src/consent-utility.ts';` |
| `const { validateWorkflowFile } = require('./src/workflow-graph-validator');` | `import { validateWorkflowFile } from './src/workflow-graph-validator.ts';` |
| `const { orderFromFile } = require('./src/backward-pass-orderer');` | `import { orderFromFile } from './src/backward-pass-orderer.ts';` |
| `const { orderFromGraph } = require('./src/backward-pass-orderer');` | `import { orderFromGraph } from './src/backward-pass-orderer.ts';` |
| `const { validatePaths } = require('./src/path-validator');` | `import { validatePaths } from './src/path-validator.ts';` |
| `const { compareVersions } = require('./src/version-comparator');` | `import { compareVersions } from './src/version-comparator.ts';` |

#### D. File extension references — `.js` → `.ts`

**"File:" headers (5 occurrences):**

| Before | After |
|---|---|
| `**File:** \`src/scaffolding-system.js\`` | `**File:** \`src/scaffolding-system.ts\`` |
| `**File:** \`src/consent-utility.js\`` | `**File:** \`src/consent-utility.ts\`` |
| `**Files:** \`src/workflow-graph-validator.js\`, \`src/backward-pass-orderer.js\`` | `**Files:** \`src/workflow-graph-validator.ts\`, \`src/backward-pass-orderer.ts\`` |
| `**File:** \`src/path-validator.js\`` | `**File:** \`src/path-validator.ts\`` |
| `**File:** \`src/version-comparator.js\`` | `**File:** \`src/version-comparator.ts\`` |

**Test table (7 rows):**

| Before | After |
|---|---|
| `test/path-validator.test.js` | `test/path-validator.test.ts` |
| `test/version-comparator.test.js` | `test/version-comparator.test.ts` |
| `test/consent-utility.test.js` | `test/consent-utility.test.ts` |
| `test/workflow-graph-validator.test.js` | `test/workflow-graph-validator.test.ts` |
| `test/backward-pass-orderer.test.js` | `test/backward-pass-orderer.test.ts` |
| `test/scaffolding-system.test.js` | `test/scaffolding-system.test.ts` |
| `test/integration.test.js` | `test/integration.test.ts` |

---

## Owner Confirmation Required

The Owner must respond in `owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `owner-to-curator.md` shows APPROVED status.

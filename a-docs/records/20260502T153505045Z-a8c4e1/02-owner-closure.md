# Owner Closure — Runtime Placement Standard

## Summary

Stored a standing runtime placement standard without moving executable files in this flow.

## Permanent Surfaces Updated

- `$A_SOCIETY_STRUCTURE` — added the runtime internal placement standard:
  - root remains for `$A_SOCIETY_RUNTIME_INVOCATION`, package/build/env/install files
  - runtime-owned contracts belong under `runtime/contracts/`
  - `runtime/src/` should be organized by executable capability folders
  - existing root contracts and flat `runtime/src/` files are legacy placement until a dedicated migration
- `$A_SOCIETY_EXECUTABLE_ADDENDUM` — added matching executable placement rules
- `$A_SOCIETY_LOG` — recorded the closed flow and added a follow-up Next Priority for runtime tree migration

## Explicit Non-Changes

- No runtime files were moved.
- No imports were rewritten.
- No indexes required new rows because no new standing indexed file was created in this flow.
- `$A_SOCIETY_RUNTIME_WORKFLOW_CONTRACT` remains where it was created in the prior change; its relocation is part of the follow-up migration item.

## Follow-Up

The actual runtime tree migration is now tracked in `$A_SOCIETY_LOG` as `[M][RUNTIME]` **Runtime tree placement migration**. That work should route through Executable Dev with Technical Architect design before implementation.

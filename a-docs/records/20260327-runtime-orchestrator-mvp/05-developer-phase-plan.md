**Subject:** Runtime Orchestrator MVP - Implementation Phase Plan
**Status:** ACTIVE
**Type:** Developer Phase Plan
**Date:** 2026-03-27

---

## Overview

Based on the approved Phase 0 architecture design (`03-ta-to-owner.md`), the runtime implementation is broken into five phases. These phases sequence the implementation of the seven required runtime components, the `roleContextRegistry`, and the necessary workflow document metadata updates (`human-collaborative: "yes"`). 

---

## Phase 1: Foundation & Data Contracts
- Initialize the `runtime/` Node.js project (`package.json`, `tsconfig.json`) to match existing tooling environment.
- Define the foundational data contracts in code: `FlowRun`, `RoleSession`, `TurnRecord`, `TriggerRecord`.
- Define the `roleContextRegistry` schema and populate it with initial supported MVP roles.
- Establish framework path resolution utilities based on internal and public index variables.

## Phase 2: State & Core Services 
- **Component 4 (Session Store):** Implement local file-backed persistence for the data contracts.
- **Component 3 (Context Injection Service):** Implement document resolution, contextual bundle assembly, and runtime directive appending.

## Phase 3: Provider & Parsing
- **Component 5 (LLM Gateway):** Implement Anthropic SDK integration, streaming interface, and standard provider error normalization.
- **Component 6 (Handoff Interpreter):** Implement the block extractor and YAML parser/validator per `$INSTRUCTION_MACHINE_READABLE_HANDOFF`.

## Phase 4: Orchestration & Tooling Integration
- **Component 7 (Tool Trigger Engine):** Implement direct in-process triggers for `tooling/` components 1, 3, 4, and 7 based on declared rules.
- **Component 2 (Flow Orchestrator):** Implement the primary execution loop (validation, node evaluation, step progression, handoff enforcement, collaborative pausing).

## Phase 5: Interface & Workflow Alignment
- **Component 1 (Operator Interface):** Build the terminal CLI exposing `start-flow`, `resume-flow`, and `flow-status`.
- **Workflow Metadata:** Add `human-collaborative: "yes"` to Owner gates in the permanent workflow documents orchestrated by the MVP.
- **Integration:** E2E validation of the components working collectively.

---

## Approval / Next Steps

This plan does not require Owner-level sequence changes or architectural realignment. As specified in the Phase 0 Gate Decision (`04-owner-to-developer.md`), I will proceed directly to implementing Phase 1 in `runtime/`.

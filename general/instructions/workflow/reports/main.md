# How to Create a Reports Document

## What Is a Reports Document?

A reports document defines how investigation and analysis artifacts are structured within a project. It answers:

> "When an agent encounters a problem that requires investigation before a solution can be defined, how do they capture and communicate their findings?"

A report is not a plan. A plan describes how to execute known work. A report is produced when the work itself is not yet known — when the first step is to understand what is happening before deciding what to do about it.

Reports serve three purposes:
1. **Framing the problem** — ensuring that the right question is being answered before implementation begins.
2. **Evidence capture** — creating a permanent record of what was observed, what was investigated, and what was concluded.
3. **Strategy options** — presenting multiple approaches so the decision-maker can choose rather than having the investigator choose for them.

---

## Why Every Project Needs One

Without a standard report structure, investigations produce outputs that are hard to act on. A wall of notes is not a report. A collection of command outputs without interpretation is not a report. An opinion without evidence is not a report.

A structured report format forces the investigator to:
- Separate symptoms from causes
- Separate causes from solutions
- Present options rather than pre-deciding
- Record verification criteria before implementation begins

When reports are standardized, reviewers can immediately find the root cause analysis, the proposed strategies, and the verification plan — without reading the entire document in order.

**A report template prevents investigation from becoming opinion, and opinion from masquerading as evidence.**

---

## What Belongs in a Report

A report document for any project should cover:

### 1. Executive Summary (mandatory)
A brief statement of the problem and its impact. This section is read first and must stand alone. Someone who reads only the summary should understand what is wrong and why it matters.

### 2. Observed Symptoms (mandatory)
What was actually seen? List concrete, observable facts: error messages, test failures, command outputs, behavior descriptions. Symptoms are not interpretations — they are the raw evidence.

### 3. Investigated Areas (mandatory)
What was looked at, and what was found? For each area investigated, state the finding. This section demonstrates that the investigation was systematic rather than lucky.

### 4. Root Cause Analysis (mandatory)
Why is the problem occurring? This is the interpretation layer — connecting symptoms and investigation findings to an underlying cause. The analysis should be honest about confidence level when the cause is suspected but not confirmed.

### 5. Suggested Strategies (mandatory)
What are the options for addressing the root cause? Present at least two strategies, each with a brief description. Do not implement solutions in a report — solutions belong in a plan and execution artifact. The report presents options; the decision-maker chooses.

### 6. Verification Plan (mandatory)
How will anyone know the problem is solved? State the specific observable condition that would confirm resolution. This section is written before implementation so the definition of success is not influenced by what was actually built.

---

## What Does NOT Belong

- **Implementation details** — how to fix the problem belongs in a plan and execution artifact, not in the report.
- **Completed fix records** — evidence that a fix worked belongs in the closure artifact (requirement or plan DoD), not in the investigation report.
- **Scope decisions** — what to fix and what to defer is a requirements decision, not an investigation finding.

---

## Naming and Storage

Reports should be stored in a `workflow/reports/` folder within the project's agent-docs. Recommended naming patterns:
- Investigation reports: `INVESTIGATION-[identifier]-[slug].md` (e.g., `INVESTIGATION-CR-007-pipeline-regression.md`)
- Ad-hoc analysis: `[TOPIC]-analysis.md`

Historical reports are retained and not deleted — they are the permanent record of the state of the system at the time the investigation was conducted.

A `main.md` file in the reports folder contains the standard template and optionally a reference example.

---

## Including a Reference Example

A reference example alongside the template significantly reduces the gap between reading the template and producing a good report. A good reference example:
- Uses the full template structure with realistic content
- Shows how to distinguish symptoms from causes in practice
- Demonstrates appropriate scope (the report analyzes; it does not implement)
- Is linked from the `main.md` so agents can find it easily

When a project has produced a strong investigation report that demonstrates best practice, document it as the canonical example in `main.md` or link to it.

---

## How to Write a Report Template

**Step 1 — Define the required sections.**
List every section that must appear in every report. For each section, state the rule for "empty but addressed" (e.g., "If no root cause can be confirmed, state the most likely hypothesis and the evidence gap preventing confirmation").

**Step 2 — Write prompts for each section.**
Each section's prompt should distinguish between what belongs there and what common mistakes look like. The most common mistake is mixing symptoms with causes — make this distinction explicit in the prompt.

**Step 3 — Define the strategy presentation format.**
Strategies should be comparable. Define a simple format: name, description, trade-offs. This ensures the decision-maker receives options in a form they can act on.

**Step 4 — Specify the verification plan format.**
The verification plan should be specific enough that a different agent could execute it without asking the author. "Run X command and confirm Y" is specific; "make sure it works" is not.

---

## Format Rules

- **Evidence before interpretation.** Symptoms are listed before analysis. The reader should be able to check the raw evidence before accepting the interpretation.
- **Options, not recommendations.** The investigator presents strategies; the project's decision process selects among them. A report that presents only one strategy has made the decision for the decision-maker.
- **No implementation.** If a section starts describing specific code changes, those changes belong in a plan. Cut them from the report.
- **Confidence levels.** When a root cause is suspected but not confirmed, say so explicitly. An honest "suspected cause — requires further verification" is more useful than a confident claim that later proves wrong.

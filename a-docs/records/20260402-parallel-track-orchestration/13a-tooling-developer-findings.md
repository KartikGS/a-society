# Backward Pass Findings: Tooling Developer — Parallel Track Orchestration

**Workflow:** Parallel Track Orchestration (20260402)
**Role:** Tooling Developer
**Phase:** Meta-Analysis (Step 2 of 6 — Concurrent)

## Friction and Analysis

### 1. BFS Sorting Polarity Error
- **Finding:** The initial algorithm specified in the TA advisory (§5 Step 4) called for a descending sort on reverse distances `(b - a)`.
- **Analysis:** During implementation, I discovered this produced a forward-pass meta-analysis order (Owner first). The fundamental rule in `$GENERAL_IMPROVEMENT` requires a **reverse** first-occurrence sequence.
- **Root Cause:** A design error in the advisory's algorithmic pseudocode (incorrect sort polarity).
- **Resolution:** Corrected to an ascending sort `(a - b)`. This ensures roles closest to the implementations (distance 0) perform their meta-analysis first.

### 2. Coordination Risk in Parallel Meta-Analysis
- **Finding:** The introduction of concurrent backward-pass steps created a potential for filename collisions (e.g., both Tooling and Runtime Developers attempting to file `13-findings.md`).
- **Analysis:** The tooling layer now proactively manages this by appending a concurrency note to prompts. 
- **Recommendation:** This sub-labeling convention (`NNa-`, `NNb-`) should be formalized in the Framework's Record Protocol if parallel tracks become standard.

### 3. Role Multi-Position Logic (First vs. Last)
- **Finding:** In workflows where roles re-enter multiple times (e.g., Owner), first-occurrence reversal depends on whether you consider the forward pass "first" or the backward pass "first."
- **Analysis:** A mid-phase code adjustment from the Technical Architect shifted the logic to use **maximum reverse distance** for each role.
- **Benefit:** This pins the role's meta-analysis to its earliest forward-pass appearance, ensuring it has all subsequent artifacts available for reflection.

## Generalizable Contribution
- The "Maximum Reverse Distance" pinning logic is a robust mathematical solution for deriving backward-pass order from arbitrary DAGs. It should be added to the `$GENERAL_IMPROVEMENT` core algorithm specification.

---
**Next action:** Perform your backward pass meta-analysis (step 2 of 6).
**Read:** all prior artifacts in the record folder, then ### Meta-Analysis Phase in a-society/general/improvement/main.md
**Expected response:** Your findings artifact at the next available sequence position in the record folder. When complete, hand off to Technical Architect (meta-analysis).
**Note:** this step is concurrent — other roles are performing their meta-analysis in parallel. File your findings at the next available sub-labeled position (e.g., NNa-, NNb-) after reading the record folder's current contents to confirm the available slot.

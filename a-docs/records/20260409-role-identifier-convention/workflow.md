# Workflow: role-identifier-convention

**Type:** `[S][LIB]` — Single-session maintenance change

---

## Nodes

### N1 — Owner: Implementation

**Role:** Owner  
**Artifact:** `a-society/general/instructions/roles/required-readings.md`  
**Action:** Add "Role Key Convention" section with explicit rules and worked examples

### N2 — Curator: Registration

**Role:** Curator  
**Input:** Updated `required-readings.md`  
**Action:** Verify the change, confirm no index updates needed (no new variables added)

### N3 — Owner: Closure

**Role:** Owner  
**Input:** Completed registration  
**Action:** Update `$A_SOCIETY_LOG`, archive record

---

## Flow

```
Owner → Curator → Owner (Closure)
```

---

## Notes

- No new variables introduced — no index update required
- Small change, single session, no brief needed
- Follows `[S][LIB]` maintenance pattern from framework dev workflow
# Curator Signal: Ink Project (2026-03-15)

**Project:** Ink
**Version:** 1.0.0 (A-Society compliant)
**Focus:** Operational Friction & Maintainability

## 1. Pattern: Workspace Pre-requisite Enforcement
**Observation**: Agents (specifically the Writer role) encountered friction because the `essays/` directory specified in documentation did not exist on the filesystem.
**Proposed Generalization**: Standardize a "Workspace Readiness" check in the `Owner` or `Curator` role where they verify the presence of all folders defined in `$STRUCTURE` or its equivalent, rather than assuming they exist from orientation.

## 2. Pattern: Communication Life-cycle (Archiving)
**Observation**: Active conversation folders (Briefs/Submissions) grow rapidly, leading to directory clutter and increased search-costs for agents.
**Proposed Generalization**: Add a "Terminal State Archiving" protocol to the general `communication/` pattern. Once an artifact (e.g., a Brief) reaches a terminal state (e.g., Published/Finished), it should be moved to an `archive/` sub-directory within the communication layer to maintain directory health.

## 3. Pattern: Role-Template Deep-linking
**Observation**: Agents spend non-trivial time referencing the `$INDEX` to find template paths.
**Proposed Generalization**: Highly recommend that role-specific documentation includes direct file links to the primary templates that role is responsible for (e.g., Writer doc directly links to the Submission template).

## 4. Pattern: Slugging Standardization
**Observation**: Choosing filenames is an "unforced decision" that creates inconsistency across project sessions.
**Proposed Generalization**: Move slugging conventions (e.g., date-prefixed kebab-case) from project-specific rules to a recommended general `A-Society` pattern for creative output collections.

---
**Curator Verification**: Signal captured and filed from first essay lifecycle reflection.

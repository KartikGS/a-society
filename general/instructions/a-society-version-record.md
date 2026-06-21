# How to Create an A-Society Version Record

## What Is the A-Society Version Record?

The A-Society version record (`a-docs/a-society-version.md`) declares **which version of the A-Society framework this project's `a-docs/` currently conform to**.

It exists so the runtime can tell, without inspecting file contents, whether an initialized project is up to date with the framework it was built on. The runtime reads the version recorded here, compares it against the canonical current version (the `a_society_version` in A-Society's own `CHANGELOG.md` frontmatter), and offers an update flow when the project is behind.

This file is **compulsory**. Every initialized project must have it, and it must carry a readable version in its YAML frontmatter.

---

## Required Format

The file begins with a YAML frontmatter block whose `a_society_version` key is the single machine-readable source of truth for the project's conformance version:

```markdown
---
a_society_version: "0.2.0"
---

# A-Society Version Record

This project's `a-docs/` conform to A-Society **0.2.0**.

...
```

Rules:

- The frontmatter must be the first thing in the file, delimited by `---` lines.
- `a_society_version` must be a dotted numeric version (e.g. `"0.2.0"`) matching the A-Society changelog version scheme. Quote it so YAML does not coerce it to a number.
- The version is **stamped automatically at initialization** to the framework version current at that time. Do not invent a value when initializing — the runtime seeds it.

---

## Who Updates It, and When

- **At initialization:** the runtime stamps the current framework version into the frontmatter. The initializing Owner leaves it as stamped.
- **During an update flow:** the Owner performing the update brings the `a-docs/` into conformance with the newer framework version, then **bumps `a_society_version` in this frontmatter to the version being upgraded to**. This is the act that records the update as applied.

The body below the frontmatter is for human-readable context: which version the project conforms to, and an optional log of applied updates (version, date, notes). The body is informational — the frontmatter is authoritative.

---

## Why This Matters

Without a readable version record, the runtime cannot distinguish a current project from a stale one, and the update flow has no source/target to compute. A single authoritative frontmatter version keeps the comparison deterministic and the update offer trustworthy.

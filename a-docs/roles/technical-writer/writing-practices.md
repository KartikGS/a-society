# Technical Writer Practices

Read this when doing site work in a flow.

---

## Reader

Write for a first-time operator. Assume they work in a technical environment: a terminal, git, Node.js, and an LLM API key or a supported coding agent. Do not assume they know A-Society's vocabulary. Define a term such as role, flow, node, handoff, record, or backward pass the first time a page uses it, or link to the page that defines it.

Lead with what the reader is trying to do. Put commands they can copy before the explanation of why they work.

---

## Verify Against the Source

Check every operational fact against the implementation or its authoritative standing reference before handoff. Do not copy facts from completion reports, design artifacts, or an older version of the page.

| Fact on the page | Check against |
|---|---|
| Runtime commands, environment variables, ports, runtime signals | `$A_SOCIETY_RUNTIME_INVOCATION`, then the implementation it describes |
| npm scripts and the Node.js version | The runtime's package manifest |
| UI labels, buttons, and settings panels | The UI source under `runtime/ui/` |
| Supported coding agents and versions | `$A_SOCIETY_EXECUTABLE_HOST_AGENTS` |
| Agent-mode billing or plan claims | The terms-of-use stance in `$A_SOCIETY_ARCHITECTURE` |
| Install steps | `$A_SOCIETY_INSTALL_SCRIPT` and `$A_SOCIETY_README` |
| Concepts: roles, workflows, records, feedback | `$A_SOCIETY_VISION`, `$A_SOCIETY_WORKFLOW`, and the runtime contracts under `runtime/contracts/` |

When a page section changes, re-verify every claim in that section, not only the sentences you added, and remove anything the new text makes wrong.

---

## One Home per Fact

For each page that overlaps a standing reference, settle which copy is authoritative:

- **Standing reference authoritative.** The page summarizes for the newcomer and links to the reference for the full detail. This is the default for operator-facing runtime facts: `$A_SOCIETY_RUNTIME_INVOCATION` is designated the sole default operator-facing executable reference, and changing that designation is an Owner decision.
- **Page authoritative.** The standing reference links to the page instead of repeating it. This changes another role's document, so route it to that role's owner through the Owner.

Record each overlap decision with the page, for example in its frontmatter or in a short source note at the end of the page, so the next writer knows where to check.

---

## Links and Paths

- Site pages are read by humans. Do not use `$VARIABLE` names on site pages. Link to repository files by their public GitHub URL on `main`.
- In `a-docs/` surfaces you own, use `$VARIABLE` names from `$A_SOCIETY_INDEX`, as every A-Society role does.

---

## Build and Deployment

- Run the site build before handoff, and report the result.
- Keep the build check in CI passing, and keep it scoped to changes under `site/`.
- Keep `$A_SOCIETY_SITE_GUIDE` current: how to build locally, how the site deploys, which hosting settings the deployment depends on, and how to verify a deployment, including the install URL.
- Keep build output and dependencies out of git with the site's own `.gitignore`.
- Do not change hosting settings outside the repository. When a deployment needs one, write the exact change for the human and route it through the Owner.

---

## Completion Report

At handoff, list:

- the pages changed and the user-visible change each reflects
- the source each changed fact was verified against
- overlap decisions made or changed
- changes needed in standing references owned by other roles, each with its owner
- the build result

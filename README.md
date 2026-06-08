<p align="center">
  <img src="assets/brand/a-society-mark.svg" alt="A-Society logo" width="112">
</p>

<h1 align="center">A-Society</h1>

<p align="center">
  <strong>An agentic harness for any project.</strong>
</p>

<p align="center">
  Structured memory, role-based workflows, self-improvement, and cross-project feedback.
</p>

<p align="center">
  <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-5EEAD4?style=flat-square">
  <img alt="Node v18+" src="https://img.shields.io/badge/node-v18%2B-F59E0B?style=flat-square">
  <img alt="Browser runtime" src="https://img.shields.io/badge/runtime-browser%20UI-FB7185?style=flat-square">
  <img alt="Status: early and experimental" src="https://img.shields.io/badge/status-early%20%26%20experimental-CBD5E1?style=flat-square">
</p>

<p align="center">
  <a href="#getting-started">Getting Started</a> |
  <a href="runtime/INVOCATION.md">Runtime Guide</a>
</p>

<p align="center">
  <img src="assets/brand/a-society-banner.svg" alt="A-Society workflow banner">
</p>

---

## What the Harness Is Designed to Give a Project

<!-- DEMO VIDEO: open this README in the GitHub web editor and drag-and-drop the demo mp4 onto this line. GitHub uploads it to user-attachments and replaces this comment with a playable embed — no file is committed to the repo. -->



| Structured memory | Workflow execution | Self-improvement | Cross-project feedback |
|---|---|---|---|
| `a-docs/` is designed to preserve roles, rules, indexes, and standing project truth across sessions. | The runtime aims to route work through explicit roles, handoffs, records, and closure checks. | After a flow, a backward pass turns what happened into findings that improve the project's own docs. | With your consent, the same findings can be distilled into a report that improves A-Society's reusable templates. |

https://github.com/user-attachments/assets/48d3b1db-baa9-4598-9b81-3c8d0dc8fd5a

https://github.com/user-attachments/assets/70431d7a-44de-4137-9187-4cd5824a31b7

---

## Getting Started

**Requirements:** Node.js ≥ 18, npm, git.

**One-line install.** Clone the framework and install runtime dependencies in a single step — no PATH changes, no global installs:

```bash
curl -fsSL https://a-society.dev/install.sh | bash
```

Then start the runtime and continue from step 3:

```bash
npm --prefix ./a-society/runtime start
```

Prefer to set it up by hand? Follow the steps below.

**1. Set up your workspace**

Clone A-Society into a workspace directory. Any projects you want to use with it live alongside it in the same parent folder:

```
your-workspace/
├── a-society/        ← this repo
└── my-project/       ← your project (or create one from the UI in step 4)
```

```bash
git clone https://github.com/KartikGS/a-society.git
```

**2. Install and start the runtime**

From the workspace root:

```bash
npm --prefix ./a-society/runtime install
npm --prefix ./a-society/runtime start
```

The runtime opens at `http://localhost:3000`.

**3. Configure a model**

The Settings panel opens automatically and stays open until you activate a model. The runtime cannot start project work without one.

Fill in:
- **Provider** — your model provider and its API base URL; use whichever provider you prefer
- **API key** — from your provider's account dashboard
- **Model ID** — from your provider's model catalog
- **Context window** — the model's token context limit; used to calculate when to compact session history

Any OpenAI-compatible provider (Hugging Face, OpenRouter, self-hosted, and others) or Anthropic's API is supported.

Save and set the model as active. The project selector appears once a model is active.

**4. Select or create a project**

*New project:* Click **Create New Project**, enter a name, and the runtime creates the project folder and scaffolds the compulsory `a-docs/`. An Owner-led initialization flow starts immediately and fills the scaffolded files through a short Q&A.

*Existing project:* Place your project folder in the workspace alongside `a-society/`. It will appear in the selector as uninitialized. Click it to run the same scaffold and initialization flow.

Approve the result and your project has a structured agent harness.

**5. Start your first flow**

Click **New Record**. The runtime opens a draft flow and routes it to the Owner node. You're in.

---

## How It Works

A-Society has a **library** of reusable instructions, role templates, and standards, and a **runtime** that uses them. The runtime reads the library and your project's `a-docs/` to drive each agent session. The library is what every initialized project inherits and what the framework improves over time.

The runtime runs as a local web app, driven from the browser. Here is what it does, at a surface level.

**Model configuration.** In Settings you pick a provider, paste an API key, and set the model ID and its context-window size. The runtime sends a small test request before saving and won't start project work until an active model exists. Keys and settings stay local to your workspace.

**Context injection.** When a role's session begins, the runtime assembles a context bundle for it: who it is, the session contracts it must follow (how to hand off, where to write records), and the role's required-reading files — resolved through the project's index so paths are never hardcoded. Each workflow step can add its own first-entry reading, inputs, and task description, injected only when that step is first entered. Each agent loads only what its job needs.

**Handoffs.** Work moves between roles through small machine-readable handoff blocks. When a role finishes its part, it emits a block naming the next step and the artifact it's passing along, and the runtime routes control there. A step can only hand off to its direct neighbors, can pause to ask you a question, or can signal that a phase is complete. Every handoff and artifact is persisted, so a flow survives a restart and you can reopen any step's transcript later.

**Records.** Every flow gets its own folder under `.a-society/state/`, holding the flow's workflow snapshot, its plan, the artifacts roles hand off, and the findings from improvement. Roles write only inside that folder; standing project docs live elsewhere. This is the durable memory of what happened and why.

**Self-improvement.** When a flow's forward work closes, the runtime can run a backward pass: each role that took part reflects on what it actually did and writes findings, ordered so later roles' lessons reach the roles that set their work up. Those findings feed back into the project's own docs and standing surfaces — so the project gets better from the work it just did.

**Cross-project feedback.** After the backward pass, the runtime asks whether to share an upstream feedback report. Only if you say yes does a final pass distill the findings into one report under `a-society/feedback/`, labeling each suggestion by how broadly it applies — universal, category-specific, or project-only. Nothing is sent anywhere automatically: you review and redact before any of it leaves your machine, and consent is asked per flow.

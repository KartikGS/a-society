---
title: Getting Started
description: How to install A-Society, start the runtime, configure a model or coding agent, and run your first flow.
sources:
  - "Commands, ports, environment variables, workspace layout, agent mode, feedback: runtime/INVOCATION.md (authoritative; this page summarizes)"
  - "Install steps: site/public/install.sh and README.md"
  - "UI labels: runtime/ui/src/"
---

A-Society is a standalone repository that sits alongside your project. This guide walks you from zero to your first initialized project flow.

**Requirements:** Node.js ≥ 18, npm, git, and either an API key for a model provider or a supported coding agent installed on your machine (see [Step 3](#step-3--configure-a-model-or-a-coding-agent)).

---

## One-line install

Clone the framework and install runtime dependencies in a single step — no PATH changes, no global installs:

```bash
curl -fsSL https://a-society.dev/install.sh | bash
```

To install into a specific directory, pass it as an argument:

```bash
curl -fsSL https://a-society.dev/install.sh | bash -s -- /path/to/workspace
```

Then start the runtime and continue from Step 3 below:

```bash
npm --prefix ./a-society/runtime start
```

Prefer to set it up by hand? Follow the manual steps below.

---

## Step 1 — Set up your workspace

Clone A-Society into a workspace directory. Any projects you want to use with it live alongside it in the same parent folder — not inside it.

```
your-workspace/
├── a-society/        ← the framework (clone here)
└── my-project/       ← your project (or create one from the UI)
```

```bash
git clone https://github.com/KartikGS/a-society.git
```

Initialization adds an `a-docs/` folder inside your project: the agent documentation that roles read at the start of every session. After that, agents change your project only through the flows you run.

The runtime keeps its own state in a hidden `.a-society/` folder at the workspace root: flow records, settings, API keys, skills, and feedback reports. Nothing it generates is written inside the `a-society/` checkout, so `git -C a-society pull` keeps working.

---

## Step 2 — Install and start the runtime

```bash
npm --prefix ./a-society/runtime install
npm --prefix ./a-society/runtime run build:ui
npm --prefix ./a-society/runtime start
```

The runtime opens a browser tab at **[http://localhost:3000](http://localhost:3000)** and prints the workspace and A-Society checkout it resolved. Run the commands from the workspace root: by default the workspace is the folder that contains `a-society/`. To use another port, set `A_SOCIETY_UI_PORT`; see the [Runtime Guide](/docs/runtime-guide#starting-the-runtime).

The first time you start, the Settings panel opens automatically and stays open until you activate a model or set up a coding agent. Subsequent starts go directly to the project selector.

---

## Step 3 — Configure a model or a coding agent

Each role turn runs on one of two backends. Pick one in Settings; you can switch later, and the change applies to new flows only.

### Option A: an API model

Open the **Models** tab and fill in **Add Model**:

| Field | What to enter |
|---|---|
| **Provider type** | `anthropic`, or `openai-compatible` for any OpenAI-compatible API (Hugging Face, OpenRouter, self-hosted, and others) |
| **Provider base URL** | For `openai-compatible` only: the provider's API base URL |
| **Model ID** | From your provider's model catalog |
| **API key** | From your provider's dashboard |
| **Context window (tokens)** | The model's context limit; used to decide when to compact a role's history |

Click **Add Model**. The runtime sends a small test request before it saves the model, and the first model you add becomes the active one. To switch later, click **Set Active** on another model. See [Model Configuration](/docs/model-configuration) for provider types and reasoning options.

### Option B: a coding agent you already use (agent mode)

Agent mode runs each role turn on a coding agent installed on your machine instead of the runtime's own API calls. The supported agent is **Claude Code**, versions `2.1.304` up to (not including) `2.2.0`.

1. Install Claude Code and sign in to it as you normally would.
2. Open the **Agent mode** tab and choose **A coding agent installed on this machine**.
3. Pick **Claude Code** as the coding agent. Leave the executable path blank to use `claude` on your `PATH`.
4. Click **Check agent**. It reports whether the CLI is installed, whether its version is supported, and how it is signed in.
5. Choose how tool permissions work, then click **Save Agent Mode**:
   - **A-Society permission levels (No, Partial, Full Access)**: the runtime asks you before writes and commands, as in API mode.
   - **Claude Code decides (auto mode)**: Claude Code approves its own actions, may edit outside the project and run shell and network commands, and A-Society does not ask you first.

A-Society never reads or stores the agent's credentials; it runs your own `claude` CLI as you signed in to it. **Billing follows the CLI's own sign-in.** If `ANTHROPIC_API_KEY` is set where the runtime runs, Claude Code uses that key, and you are billed for API usage, instead of a subscription sign-in. Check the auth source that **Check agent** reports before your first flow.

In agent mode the coding agent manages its own model, skills, MCP servers, and context compaction. A-Society still owns the workflow, handoffs, records, the backward pass, and feedback. Details: [Runtime Guide — Agent mode](/docs/runtime-guide#agent-mode).

---

## Step 4 — Select or create a project

The project selector shows three categories:

**Initialized projects** — projects with a complete `a-docs/` layer. Click any of these to see its existing records and open a new one. An **Update** button appears next to a project when its `a-docs/` are a release line behind the framework; see [Flow Types — Update flows](/docs/flow-types#update-flows).

**Uninitialized projects** — project folders found in your workspace that lack `a-docs/`. Click one to run the scaffold and initialization flow.

**Create New Project** — enter a project name. The runtime creates a folder in your workspace, scaffolds the compulsory `a-docs/` surfaces, and immediately opens the Owner initialization flow.

### What initialization does

The initialization flow runs an Owner agent session that:

1. Reads your project (or asks targeted questions for a new project)
2. Fills the scaffolded `a-docs/` surfaces: `agents.md`, roles, indexes, workflow, and project-information documents
3. Asks you to review and approve each surface before the project is considered ready

This typically takes one focused session. Once complete, the project is initialized and all future flows work through the designed workflow.

---

## Step 5 — Start your first flow

Select an initialized project, then click **New** next to **Records** in the sidebar. A **flow** is one unit of work routed through the project's workflow, and its **record** is the folder that keeps everything the flow produces. The runtime opens a draft flow and routes it to the Owner node. The Owner reads the active context (your `a-docs/`, the workflow contract, and any relevant handoff artifacts) and asks what you want to work on.

---

## What happens at the end of a flow

When the forward pass closes, the runtime optionally runs a backward-pass meta-analysis: each participating role reflects on what went well, what caused friction, and what could improve. The runtime offers two modes — **graph-based** (roles reflect in reverse order of participation, following the flow structure) or **parallel** (all participating roles reflect concurrently). Afterward, the runtime optionally asks whether to generate an upstream feedback report for A-Society. If you say yes, the report is saved in your workspace at `.a-society/feedback/`. Nothing is sent: you review it and can submit it later as a pull request. See [Runtime Guide — Feedback reports](/docs/runtime-guide#feedback-reports).

---

## Next steps

- [Runtime Guide](/docs/runtime-guide) — full reference for the browser UI and operator-facing behavior
- [Concepts](/docs/concepts) — mental models for `a-docs/`, roles, workflows, flows, and the backward pass

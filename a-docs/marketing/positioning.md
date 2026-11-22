# A-Society Positioning and Voice

How A-Society describes itself in outreach. This file derives from `$A_SOCIETY_VISION` and the framing in `$A_SOCIETY_README`; where they disagree, they win, and this file is corrected.

**Status:** First version, 2026-11-20. Disclosure wording was revised on 2026-11-20 at the human's direction and is **proposed, awaiting the human's final approval**. Do not use it on any account or post until it is marked approved here.

---

## Positioning

- **One-line description:** An open-source agentic harness for any project: structured memory, role-based workflows, and a feedback loop that improves the project's own docs after every flow. *(README tagline and subtitle; `$A_SOCIETY_VISION` "The Vision")*
- **Who it is for:** Projects that use AI agents as a regular part of their work and need more than one-off prompting: durable context, role boundaries, repeatable workflows, review gates, and records. Setup needs a technical operator today; the work it then runs does not have to be technical. *(`$A_SOCIETY_VISION` "Who This Is For")*
- **The problem, in the reader's words:** "Every new agent session starts from zero. I re-explain the project, the agent guesses at conventions, reviews its own work, and nothing it learned survives to the next session." *(`$A_SOCIETY_VISION` "The Problem" and "session memory")*
- **What is different about it:**
  - The bet is on the harness, not the model: structure, workflow, memory, and feedback around the agent. *(`$A_SOCIETY_VISION` "The Core Bet")*
  - It runs the work as well as documenting it. A local runtime routes each flow through explicit roles and handoffs, keeps a record of every flow, and runs a backward pass that turns what happened into improvements. *(README "How It Works")*
  - It is not tied to one model. Role turns run on any OpenAI-compatible API or Anthropic's API, or through Claude Code if it is installed. *(README step 3; `$A_SOCIETY_EXECUTABLE_HOST_AGENTS`)*
  - Cross-project learning is consent-gated. Nothing leaves the machine automatically; the operator reviews and redacts each report. *(README "Cross-project feedback")*
- **Proof points** (each with a source):
  - MIT-licensed, open source on GitHub. *(`LICENSE`)*
  - One-line install: `curl -fsSL https://a-society.dev/install.sh | bash`. *(README "Getting Started")*
  - Runs locally as a browser app; keys and settings stay in the workspace. *(README "Model configuration")*
  - A-Society is built with itself. Its own `a-docs/` and workflow run every change, including this outreach plan. *(`$A_SOCIETY_VISION` "What Is A-Society"; this flow's record)*
  - A demo video is in the README. *(README)*

---

## Claims We Do Not Make

Check claims about agent mode, billing, or host agents against the terms-of-use stance in `$A_SOCIETY_ARCHITECTURE`. Record here any other claim the human has ruled out, with the reason.

| Do not say | Why |
|---|---|
| Agent mode runs on your subscription plan, or is free with an existing plan | Terms-of-use stance in `$A_SOCIETY_ARCHITECTURE`: no such promise until host vendors' terms clearly permit it. Say "billing follows your coding agent's own sign-in" (README). |
| Works with any coding agent | Claude Code is the only supported host today (README step 3, `$A_SOCIETY_EXECUTABLE_HOST_AGENTS`). Say "any OpenAI-compatible or Anthropic API, or Claude Code". |
| No setup, or for non-technical users | `$A_SOCIETY_VISION` "Technically honest": setup needs a technical operator. |
| Production-ready, stable, battle-tested | The README status badge says "early & experimental". |
| Numbers on quality, speed, or cost gains | No measured evidence exists. The core bet is stated as a bet. |
| "Self-improving AI" or agents that improve themselves | What improves is the project's docs and, with consent, the framework's templates (README "Self-improvement"). The model does not change. |
| Sends feedback upstream, or phones home | Nothing is sent automatically; consent is asked each flow (README). |

---

## Voice

- Plain and specific. Name the mechanism (roles, handoffs, records, backward pass) rather than adjectives.
- Honest about the stage: early and experimental, and built with its own agents.
- No hype words ("revolutionary", "10x", "game-changing"), no superlatives, no emoji-heavy posts, no engagement bait.
- Talk to builders who already use agents. Assume they know the pain; show the structure.
- Invite trial and feedback, never votes, likes, or shares.
- Short sentences. One idea per post.

---

## Disclosure

The standard disclosure every account profile and post carries: that an AI agent runs it, and who operates it. The human approves the wording.

The operator is named by public handle: `@SKartikG`, the human's X account and pending their confirmation.

**Human direction (2026-11-20):** do not mention that a human approves posts unless a venue's terms require it. None of the venues researched so far requires it (`$A_SOCIETY_MARKETING_CHANNELS`). Approval still happens before every post (hard rule 4); disclosures just don't advertise it.

- **Profile disclosure (proposed):** "Run by an AI agent, A-Society's Marketing Lead. Operated by @SKartikG."
- **Post disclosure (proposed):**
  - Long form (Moltbook, registry descriptions, articles): "Written by A-Society's Marketing Lead, an AI agent operated by @SKartikG."
  - Short form (X, 45 characters): "Written by an AI agent operated by @SKartikG."

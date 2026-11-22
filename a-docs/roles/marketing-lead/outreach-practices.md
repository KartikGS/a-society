# Marketing Lead Outreach Practices

Read this when doing outreach work in a flow.

---

## Researching a Venue

Before planning content for a venue, record it in `$A_SOCIETY_MARKETING_CHANNELS`:

- **Kind:** agent-native (meant for agents), registry (a skill, MCP, or tool directory), or human venue
- **Stance:** what the venue's own rules say about automated or AI-written content and about self-promotion, quoted or closely paraphrased
- **Source:** the link to the rule text, and the date you checked it. A forum thread or a third-party summary is not a source for a venue's rules.
- **Status:** one of the values defined in the registry
- **Account:** whether an account exists, who created it (always the human), and its handle

Check the rules again before the first post of each campaign. Venues change their rules, and a stance recorded months ago may be wrong.

When sources disagree, or the rules are silent on agent-authored content, record the status as `unknown` and escalate. Do not choose the reading that allows posting.

---

## Reviewing Past Outreach

Read `$A_SOCIETY_MARKETING_OUTREACH_LOG` before planning content for a venue that already has entries. When analyzing an attempt that did not work, name the likely cause:

- the venue's rules or moderation
- the account's standing or history
- the timing
- the fit between the audience and the message
- the content itself

Record the lesson in the log entry so the next plan can use it.

---

## Approval Package

Present every proposed external action to the human as an approval package. One package covers one action, or one batch the human can approve as a whole. Each package states:

- **Action:** post, reply, profile edit, registry submission, or other account action
- **Venue and account**
- **Exact content:** final and verbatim, including links and images
- **Disclosure:** where the content says an AI agent wrote or runs it, and who operates it
- **Claims:** each factual claim, with the source it was checked against
- **Venue rule check:** the registry status and the date the rules were last checked
- **Timing:** when it should go out, and why
- **Who performs it:** the human, or a tool the human has explicitly authorized for this action

Approval covers the exact content shown. If anything changes after approval, present it again.

---

## After Publication

Add an entry to the top of `$A_SOCIETY_MARKETING_OUTREACH_LOG` for every published item: date, venue, account, what was published, link, outcome, and lessons. Update the outcome when results come in, such as engagement, moderation actions, or referrals the human can see.

---

## Keeping Positioning Current

`$A_SOCIETY_MARKETING_POSITIONING` derives from `$A_SOCIETY_VISION` and the framing in `$A_SOCIETY_README`. When either changes, bring positioning back in line. When positioning seems to need a change the vision does not support, escalate instead of drifting.

---

## What Lives Where

- **Standing memory** in `a-docs/marketing/`: positioning and voice, the channel registry, and the outreach log. Keep them short and current.
- **Record artifacts** in the active record folder: launch plans, research notes, drafts, and approval packages. A plan becomes standing memory only through its outcomes, which go into the log and the registry.

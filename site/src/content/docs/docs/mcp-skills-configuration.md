---
title: MCP and Skills Configuration
description: How to configure MCP servers, import Skills, and choose role capabilities in the A-Society runtime.
sources:
  - "Authoritative: runtime/INVOCATION.md (Role Configuration, MCP Servers)"
---

MCP servers and Skills are managed through the Settings panel. They extend what role agents can use during a flow:

- **MCP servers** expose external tools through the Model Context Protocol.
- **Skills** provide optional task-specific instructions that a role can load when the task calls for them.

These settings apply to flows that run on API models. In [agent mode](/docs/runtime-guide#agent-mode) the coding agent manages its own skills and MCP servers, and the runtime's selections are not used.

Settings are stored locally in `.a-society/settings.json`. MCP environment variables and HTTP headers are stored separately in `.a-society/secrets.json`. Both files are written with mode `0600`.

---

## Settings tabs

The Settings panel has separate tabs for **MCP** and **Skills**. Each tab includes a selection mode:

| Mode | Behavior |
|---|---|
| **Manual** | The runtime prompts you to choose the MCP servers or Skills for each role when that role first needs configuration in a flow. |
| **Auto** | A configuration turn chooses the relevant MCP servers or Skills for the role. If auto-selection fails, the runtime falls back to the normal manual prompt. |

Model, Skill, and MCP selection modes are independent. For example, you can keep model selection manual while allowing Skills or MCP servers to be selected automatically.

When a role is configured, the runtime shows the effective model, Skills, and MCP servers in the role feed when those dimensions are in play.

---

## MCP servers

The **MCP** tab lets you add, edit, and delete MCP server configurations. A server is saved only after the runtime connects to it and successfully discovers its tool list.

### MCP fields

<table>
<colgroup><col style="width: 12rem" /></colgroup>
<thead><tr><th>Field</th><th>Description</th></tr></thead>
<tbody>
<tr><td><code>name</code></td><td>Stable server name used for tool names. Must be lowercase letters, numbers, or hyphens, up to 32 characters.</td></tr>
<tr><td><code>transport</code></td><td><code>stdio</code> or <code>http</code>.</td></tr>
<tr><td><code>command</code></td><td>Required for <code>stdio</code>. The executable used to start the MCP server.</td></tr>
<tr><td><code>args</code></td><td>Optional for <code>stdio</code>. One command argument per line.</td></tr>
<tr><td><code>env</code></td><td>Optional for <code>stdio</code>. Environment variables as <code>KEY=value</code> rows. Values are stored in secrets.</td></tr>
<tr><td><code>url</code></td><td>Required for <code>http</code>. Must be an <code>http://</code> or <code>https://</code> URL.</td></tr>
<tr><td><code>headers</code></td><td>Optional for <code>http</code>. HTTP headers as <code>KEY=value</code> or <code>KEY: value</code> rows. Values are stored in secrets.</td></tr>
</tbody>
</table>

### Tool names

Discovered MCP tools are namespaced before they are exposed to the model:

```text
mcp__{server-name}__{tool-name}
```

After namespacing, each tool name must match the provider tool-name limit used by the runtime: letters, numbers, underscores, or hyphens, up to 64 characters. Tools that do not fit are skipped and surfaced as MCP notices in the feed.

### Role use

Configured MCP servers are not automatically available to every role. At role configuration time, either you or auto-selection chooses which configured servers that role should receive. The runtime connects the selected servers for that role session and exposes their discovered tools to model calls.

MCP tool calls still pass through the normal runtime consent system as `mcp-tool` requests.

---

## Skills

The **Skills** tab lets you import and delete Skills. Importing copies a skill folder into the workspace-local skill store:

```text
.a-society/skills/{skill-name}/SKILL.md
```

The import folder must contain `SKILL.md`. The runtime reads only the frontmatter during discovery.

### Skill frontmatter

Each `SKILL.md` must start with YAML frontmatter:

```yaml
---
name: review-writing
description: Helps write concise reviews.
---
```

| Field | Description |
|---|---|
| `name` | Required. Must be kebab-case and must match the skill folder name. |
| `description` | Required. Shown during role configuration and skill discovery. |

Malformed Skills are shown in the Skills tab with the reason they could not be loaded.

### Role use

Configured Skills are selected per role, manually or automatically. Selected Skills are injected into the role context as names, descriptions, and `SKILL.md` paths only. The agent is instructed to read a Skill's `SKILL.md` only when the current task calls for it, rather than pre-loading every selected Skill.

Skills may include scripts or supporting files. Import Skills only from trusted sources; any script execution still goes through the normal command-permission prompts.

---

## Selection records

Per-role Skill and MCP selections are saved in the active flow's runtime state. If a selected Skill or MCP server is deleted later, the runtime filters it out of the effective configuration instead of passing a stale capability to the role.

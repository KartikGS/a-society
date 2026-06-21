import type { FeedItem, OperatorEvent, OperatorFeedMessage } from './types.js';

interface SelectionSummary {
  modelDisplayName?: string;
  skillNames?: string[];
  mcpServerNames?: string[];
}

/** One line per decided dimension, by name; omits dimensions that were not in play. */
function formatSelectionLines(event: SelectionSummary): string[] {
  const lines: string[] = [];
  if (event.modelDisplayName) lines.push(`Model: ${event.modelDisplayName}`);
  if (event.skillNames) lines.push(`Skills: ${event.skillNames.length > 0 ? event.skillNames.join(', ') : 'none'}`);
  if (event.mcpServerNames) lines.push(`MCP servers: ${event.mcpServerNames.length > 0 ? event.mcpServerNames.join(', ') : 'none'}`);
  return lines;
}

export function roleConfigurationSelectedText(nodeId: string, role: string, event: SelectionSummary): string {
  const lines = formatSelectionLines(event);
  return lines.length > 0 ? lines.join('\n') : `${nodeId} (${role}) configured.`;
}

export function operatorMessageToFeedItem(message: OperatorFeedMessage, id: string): FeedItem | null {
  if (message.type === 'output_text') {
    return {
      id,
      type: 'assistant',
      label: 'Assistant',
      text: message.text,
    };
  }
  if (message.type === 'input_text') {
    return { id, type: 'user', label: 'You', text: message.text };
  }
  if (message.type === 'error') {
    return null;
  }
  if (message.type === 'operator_event') {
    return operatorEventToFeedItem(message.event, id);
  }
  return null;
}

export function operatorEventToFeedItem(event: OperatorEvent, id: string): FeedItem | null {
  switch (event.kind) {
    case 'role.active':
      return {
        id,
        type: 'activation',
        label: 'Activation',
        text: `${event.nodeId} (${event.role}) is active.`
      };
    case 'role.resumed':
      return {
        id,
        type: 'resume',
        label: 'Resume',
        text: `${event.nodeId} (${event.role}) resumed after an interrupted response.`
      };
    case 'activity.tool_call':
      return {
        id,
        type: 'tool',
        label: 'Tool Call',
        text: event.command
          ? `${event.toolName}: ${event.command}`
          : event.path
            ? `${event.toolName} ${event.path}`
            : event.toolName
      };
    case 'handoff.applied':
      return {
        id,
        type: 'handoff',
        label: 'Handoff',
        text: event.targets.length === 0
          ? `${event.fromNodeId} (${event.fromRole}) completed its terminal step.`
          : `${event.fromNodeId} (${event.fromRole}) handed off to ${event.targets.map((target) => `${target.nodeId} (${target.role})`).join(', ')}.`
      };
    case 'repair.requested':
      return {
        id,
        type: 'repair',
        label: 'Repair Requested',
        text: event.summary
      };
    case 'human.awaiting_input':
      return null;
    case 'role.configured':
      return {
        id,
        type: 'event',
        label: 'Role Configuration',
        text: roleConfigurationSelectedText(event.nodeId, event.role, event)
      };
    case 'role.auto_selection_started':
      return {
        id,
        type: 'tool',
        label: 'Role Configuration',
        text: 'Selecting configuration automatically…'
      };
    case 'role.auto_configured':
      return {
        id,
        type: 'tool-success',
        label: 'Role Configuration',
        text: 'Configured automatically.'
      };
    case 'role.auto_selection_fell_back':
      return {
        id,
        type: 'tool-error',
        label: 'Role Configuration',
        text: `Automatic selection unavailable (${event.reason}); awaiting manual selection for: ${event.dimensions.join(', ')}.`
      };
    case 'human.resumed':
      return null;
    case 'usage.turn_summary':
      return null;
    case 'session.compaction_started':
      return {
        id,
        type: 'tool',
        label: 'Compaction',
        text: `Compacting context (${event.trigger}).`
      };
    case 'session.compaction_failed':
      return {
        id,
        type: 'tool-error',
        label: 'Compaction',
        text: `Context compaction failed (${event.trigger}): ${event.reason}`
      };
    case 'session.compacted':
      return {
        id,
        type: 'tool-success',
        label: 'Compaction',
        text: `${event.nodeId} context compacted (${event.trigger}).`
      };
    case 'mcp.server_unavailable':
      return {
        id,
        type: 'tool-error',
        label: 'MCP',
        text: `${event.serverName} unavailable: ${event.reason}`
      };
    case 'mcp.tool_unavailable':
      return {
        id,
        type: 'tool-error',
        label: 'MCP',
        text: `${event.serverName}.${event.toolName} skipped: ${event.reason}`
      };
    case 'provider.reasoning_trace':
      return {
        id,
        type: 'reasoning',
        label: event.label,
        text: event.text,
        reasoningDisplay: event.display,
      };
    case 'flow.forward_pass_closed':
      return {
        id,
        type: 'event',
        label: 'Forward Pass',
        text: 'Forward pass closed.'
      };
    case 'flow.completed':
      return {
        id,
        type: 'event',
        label: 'Complete',
        text: 'Orchestration completed.'
      };
    case 'activity.tool_result':
      return null;
    case 'consent.requested':
    case 'consent.resolved':
    case 'consent.mode_changed':
      return null;
  }
}

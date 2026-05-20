import type { FeedItem, OperatorEvent, OperatorFeedMessage } from './types.js';

export function operatorMessageToFeedItem(message: OperatorFeedMessage, id: string): FeedItem | null {
  if (message.type === 'output_text') {
    return { id, type: 'assistant', label: 'Assistant', text: message.text };
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
    case 'human.resumed':
      return null;
    case 'usage.turn_summary':
      return null;
    case 'session.compaction_started':
      return null;
    case 'session.compaction_failed':
      return null;
    case 'session.compacted':
      return {
        id,
        type: 'tool',
        label: 'Context',
        text: `${event.nodeId} context compacted (${event.trigger}).`
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

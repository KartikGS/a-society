import { parseRoleIdentity } from '../common/role-id.js';
import type { FeedItem, OperatorEvent, OperatorFeedMessage } from '../common/types.js';

export function getOperatorFeedRoleKey(message: OperatorFeedMessage): string | null {
  if (message.type === 'output_text') {
    return parseRoleIdentity(message.role).instanceRoleId;
  }

  if (message.type === 'input_text') {
    return message.role ? parseRoleIdentity(message.role).instanceRoleId : null;
  }

  if (message.type === 'operator_event') {
    const event = message.event;
    if (
      event.kind === 'human.awaiting_input' ||
      event.kind === 'human.resumed' ||
      event.kind === 'usage.turn_summary'
    ) {
      return null;
    }

    if ('role' in event && typeof event.role === 'string') {
      return parseRoleIdentity(event.role).instanceRoleId;
    }

    if (event.kind === 'handoff.applied') {
      return parseRoleIdentity(event.fromRole).instanceRoleId;
    }

    return null;
  }

  return null;
}

export function isTransientOperatorEvent(event: OperatorEvent): boolean {
  return (
    event.kind === 'flow.resumed' ||
    event.kind === 'parallel.active_set' ||
    event.kind === 'flow.forward_pass_closed'
  );
}

export function projectMessageToFeedItem(message: OperatorFeedMessage, id: string): FeedItem | null {
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
    return projectEventToFeedItem(message.event, id);
  }
  return null;
}

function projectEventToFeedItem(event: OperatorEvent, id: string): FeedItem | null {
  switch (event.kind) {
    case 'flow.resumed':
      return null;
    case 'role.active':
      if (event.activationSource !== 'handoff' && event.activationSource !== 'runtime') return null;
      return {
        id,
        type: 'activation',
        label: event.activationSource === 'runtime' ? 'Runtime' : 'Handoff',
        text: `${event.nodeId} (${event.role}) is active with ${event.artifactCount} artifact(s).${event.artifactBasename ? ` Primary artifact: ${event.artifactBasename}.` : ''}`
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
    case 'parallel.active_set':
      return null;
    case 'parallel.join_waiting':
      return {
        id,
        type: 'event',
        label: 'Join Waiting',
        text: `${event.nodeId} (${event.role}) is waiting for ${event.waitingFor.join(', ')}.`
      };
    case 'usage.turn_summary':
      return null;
    case 'flow.forward_pass_closed':
      return {
        id,
        type: 'event',
        label: 'Forward Pass',
        text: `Forward pass closed via ${event.artifactBasename}.`
      };
    case 'flow.completed':
      return {
        id,
        type: 'event',
        label: 'Complete',
        text: 'Orchestration completed.'
      };
    case 'consent.requested':
    case 'consent.resolved':
    case 'consent.mode_changed':
      return null;
  }
}

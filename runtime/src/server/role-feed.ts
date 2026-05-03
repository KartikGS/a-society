import { parseRoleIdentity } from '../common/role-id.js';
import type { OperatorEvent, OperatorFeedMessage } from '../common/types.js';

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
    event.kind === 'activity.tool_call' ||
    event.kind === 'flow.forward_pass_closed'
  );
}

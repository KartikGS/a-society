import { operatorMessageToFeedItem } from '../../shared/operator-feed.js';
import { AWAITING_HUMAN_REASON } from '../../shared/protocol-constants.js';
import { parseRoleIdentity } from '../../shared/role-id.js';
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
    if (event.kind === 'human.awaiting_input') {
      // Role-configuration waits persist a marker in the requesting role's feed;
      // other awaiting reasons stay feed-transparent.
      return event.reason === AWAITING_HUMAN_REASON.ROLE_CONFIGURATION
        ? parseRoleIdentity(event.role).instanceRoleId
        : null;
    }
    if (
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
    event.kind === 'flow.forward_pass_closed'
  );
}

export function projectMessageToFeedItem(message: OperatorFeedMessage, id: string): FeedItem | null {
  return operatorMessageToFeedItem(message, id);
}

import { parseRoleIdentity } from '../../common/role-id.js';
import type {
  FlowRef,
  FlowRun,
  OperatorEvent,
} from '../../common/types.js';
import type { FlowReadModel } from '../flow-read-model.js';
import type { HistoricalMessage } from '../protocol.js';
import { isTransientOperatorEvent } from '../role-feed.js';
import type { RuntimeServerMessage } from '../ws-operator-sink.js';
import type { RuntimeSessionConsent } from './consent.js';
import type { ActiveSession } from './types.js';

type RuntimeSessionEventsDeps = {
  readFlowRun: (ref: FlowRef) => FlowRun | null;
  resolveWorkflow: FlowReadModel['resolveWorkflow'];
  emitTransientMessage: (session: ActiveSession, message: RuntimeServerMessage) => void;
  emitHistoricalMessage: (session: ActiveSession, message: HistoricalMessage) => void;
  emitFlowState: (session: ActiveSession) => void;
  consent: RuntimeSessionConsent;
};

export function createRuntimeSessionEvents(deps: RuntimeSessionEventsDeps) {
  const {
    readFlowRun,
    resolveWorkflow,
    emitTransientMessage,
    emitHistoricalMessage,
    emitFlowState,
    consent,
  } = deps;

  function updateBackwardTracking(session: ActiveSession, event: OperatorEvent): void {
    if (event.kind !== 'handoff.applied') return;

    const flowRun = readFlowRun(session.flowRef);
    const workflow = resolveWorkflow(flowRun);
    if (!workflow) return;

    for (const target of event.targets) {
      const isBackwardTarget = (workflow.edges ?? []).some(
        (edge: any) => edge.from === target.nodeId && edge.to === event.fromNodeId
      );
      if (isBackwardTarget) {
        session.backwardActive.add(target.nodeId);
      }
    }
  }

  function handleRuntimeMessage(session: ActiveSession, message: RuntimeServerMessage): void {
    switch (message.type) {
      case 'request_sent':
      case 'receiving_response':
      case 'response_end':
      case 'error':
        emitTransientMessage(session, message);
        return;
      case 'operator_event':
        if (message.event.kind === 'consent.requested') {
          void consent.markNodeAwaitingConsent(session, message.event.request)
            .finally(() => emitTransientMessage(session, message));
          return;
        }

        if (message.event.kind === 'consent.resolved') {
          void consent.clearNodeAwaitingConsent(session, message.event.request, message.event.decision)
            .finally(() => emitTransientMessage(session, message));
          return;
        }

        if (message.event.kind === 'consent.mode_changed') {
          consent.persistActiveSessionConsentState(session);
          return;
        }

        if (message.event.kind === 'usage.turn_summary') {
          const { role, contextUsage } = message.event;
          if (role && contextUsage != null) {
            const roleKey = parseRoleIdentity(role).instanceRoleId;
            session.latestContextUsageByRole[roleKey] = contextUsage;
          }
          emitTransientMessage(session, message);
          return;
        }

        if (message.event.kind === 'session.compacted') {
          const roleKey = parseRoleIdentity(message.event.role).instanceRoleId;
          session.latestContextUsageByRole[roleKey] = 0;
        }

        if (isTransientOperatorEvent(message.event)) {
          return;
        }

        updateBackwardTracking(session, message.event);
        emitHistoricalMessage(session, message);

        if (
          message.event.kind === 'handoff.applied' ||
          message.event.kind === 'flow.completed' ||
          message.event.kind === 'role.active' ||
          message.event.kind === 'human.awaiting_input'
        ) {
          setImmediate(() => emitFlowState(session));
        }

        if (message.event.kind === 'flow.completed') {
          session.finished = true;
        }
        return;
    }
  }

  return {
    handleRuntimeMessage,
  };
}

export type RuntimeSessionEvents = ReturnType<typeof createRuntimeSessionEvents>;

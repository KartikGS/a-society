import type { PassThrough } from 'node:stream';
import type {
  FeedItem,
  FlowRef,
} from '../../common/types.js';
import type { ConsentGateImpl } from '../../improvement/consent-gate.js';
import type { FlowOrchestrator } from '../../orchestration/orchestrator.js';
import type { FlowReadModel } from '../flow-read-model.js';
import type { FlowStateMessage } from '../protocol.js';
import type { SocketHub } from '../socket-hub.js';
import type { WebSocketOperatorSink } from '../ws-operator-sink.js';

export interface ActiveSession {
  flowRef: FlowRef;
  projectNamespace: string;
  inputBridge: PassThrough;
  outputBridge: PassThrough;
  sink: WebSocketOperatorSink;
  orchestrator: FlowOrchestrator;
  roleFeedHistory: Map<string, FeedItem[]>;
  roleFeedSequence: Map<string, number>;
  lastFlowState: FlowStateMessage | null;
  backwardActive: Set<string>;
  finished: boolean;
  task: Promise<void>;
  consentGate: ConsentGateImpl;
  latestContextUsageByRole: Record<string, number>;
}

export type RuntimeSessionManagerOptions = {
  workspaceRoot: string;
  socketHub: SocketHub;
  flowReadModel: FlowReadModel;
};

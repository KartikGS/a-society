import type {
  FeedItem,
  FlowRef,
} from '../../common/types.js';
import type { ConsentGateImpl } from '../../improvement/consent-gate.js';
import type { FlowOrchestrator } from '../../orchestration/orchestrator.js';
import type { ImprovementOrchestrator } from '../../improvement/improvement.js';
import type { FlowReadModel } from '../flow-read-model.js';
import type { McpManager } from '../../providers/mcp/manager.js';
import type { FlowStateMessage } from '../protocol.js';
import type { SocketHub } from '../socket-hub.js';
import type { WebSocketOperatorSink } from '../ws-operator-sink.js';

export interface ActiveSession {
  flowRef: FlowRef;
  projectNamespace: string;
  sink: WebSocketOperatorSink;
  orchestrator: FlowOrchestrator;
  improvementOrchestrator: ImprovementOrchestrator;
  roleFeedHistory: Map<string, FeedItem[]>;
  roleFeedSequence: Map<string, number>;
  lastFlowState: FlowStateMessage | null;
  backwardActive: Set<string>;
  finished: boolean;
  task: Promise<void>;
  consentGate: ConsentGateImpl;
  mcpManagers: Map<string, McpManager>;
  latestContextUsageByRole: Record<string, number>;
  manualCompactionControllers: Map<string, AbortController>;
  manualCompactionSigintHandler: (() => void) | null;
}

export type RuntimeSessionManagerOptions = {
  socketHub: SocketHub;
  flowReadModel: FlowReadModel;
};

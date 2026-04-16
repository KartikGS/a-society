import { useState } from 'react';
import { ChatInterface, type FeedItem } from './components/ChatInterface';
import { GraphView } from './components/GraphView';
import { ProjectSelector } from './components/ProjectSelector';
import { useWebSocket } from './hooks/useWebSocket';
import type {
  ClientMessage,
  FlowRun,
  OperatorEvent,
  ServerMessage,
  TranscriptPayload
} from './types';

type ViewMode = 'selector' | 'chat' | 'graph';

interface SelectedNodeState {
  nodeId: string;
  role?: string;
  transcript?: unknown[];
  loading: boolean;
  error?: string;
}

function nextFeedId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatUsageSummary(event: Extract<OperatorEvent, { kind: 'usage.turn_summary' }>): string {
  switch (event.availability) {
    case 'full':
      return `Tokens: ${event.inputTokens} in, ${event.outputTokens} out`;
    case 'input-unavailable':
      return `Tokens: input unavailable, ${event.outputTokens} out`;
    case 'output-unavailable':
      return `Tokens: ${event.inputTokens} in, output unavailable`;
    case 'both-unavailable':
      return 'Tokens unavailable (provider did not report usage)';
  }
}

function formatOperatorEvent(event: OperatorEvent): FeedItem {
  switch (event.kind) {
    case 'flow.bootstrap_started':
      return { id: nextFeedId(), type: 'event', label: 'Bootstrap', text: `Interactive ${event.role} bootstrap started.` };
    case 'flow.resumed':
      return { id: nextFeedId(), type: 'event', label: 'Resume', text: `Flow ${event.flowId} resumed with ${event.activeNodeCount} active node(s).` };
    case 'role.active':
      return {
        id: nextFeedId(),
        type: 'event',
        label: 'Role Active',
        text: `${event.nodeId} (${event.role}) is active with ${event.artifactCount} artifact(s).${event.artifactBasename ? ` Primary artifact: ${event.artifactBasename}.` : ''}`
      };
    case 'activity.tool_call':
      return {
        id: nextFeedId(),
        type: 'event',
        label: 'Tool Call',
        text: event.path ? `${event.toolName} ${event.path}` : event.toolName
      };
    case 'handoff.applied':
      return {
        id: nextFeedId(),
        type: 'event',
        label: 'Handoff',
        text: event.targets.length === 0
          ? `${event.fromNodeId} (${event.fromRole}) completed its terminal step.`
          : `${event.fromNodeId} (${event.fromRole}) handed off to ${event.targets.map((target) => `${target.nodeId} (${target.role})`).join(', ')}.`
      };
    case 'repair.requested':
      return {
        id: nextFeedId(),
        type: 'error',
        label: 'Repair Requested',
        text: event.summary
      };
    case 'human.awaiting_input':
      return {
        id: nextFeedId(),
        type: 'event',
        label: 'Awaiting Input',
        text: 'The runtime is waiting for a human reply.'
      };
    case 'human.resumed':
      return {
        id: nextFeedId(),
        type: 'event',
        label: 'Resume',
        text: `${event.nodeId} (${event.role}) resumed after human input.`
      };
    case 'parallel.active_set':
      return {
        id: nextFeedId(),
        type: 'event',
        label: 'Parallel',
        text: `Active nodes: ${event.activeNodes.map((node) => `${node.nodeId} (${node.role})`).join(', ')}`
      };
    case 'parallel.join_waiting':
      return {
        id: nextFeedId(),
        type: 'event',
        label: 'Join Waiting',
        text: `${event.nodeId} (${event.role}) is waiting for ${event.waitingFor.join(', ')}.`
      };
    case 'usage.turn_summary':
      return { id: nextFeedId(), type: 'event', label: 'Usage', text: formatUsageSummary(event) };
    case 'flow.forward_pass_closed':
      return {
        id: nextFeedId(),
        type: 'event',
        label: 'Improvement Phase',
        text: `Forward pass closed via ${event.artifactBasename}.`
      };
    case 'flow.completed':
      return {
        id: nextFeedId(),
        type: 'event',
        label: 'Complete',
        text: 'Orchestration completed.'
      };
  }
}

function formatTranscriptEntry(entry: unknown): { label: string; text: string } {
  if (entry && typeof entry === 'object' && 'role' in entry) {
    const candidate = entry as Record<string, unknown>;
    const label = typeof candidate.role === 'string' ? candidate.role : 'entry';
    const text =
      typeof candidate.content === 'string'
        ? candidate.content
        : JSON.stringify(entry, null, 2) ?? '';
    return { label, text };
  }

  return {
    label: 'entry',
    text: JSON.stringify(entry, null, 2) ?? ''
  };
}

export function App() {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const socketUrl = `${protocol}://${window.location.host}`;

  const [view, setView] = useState<ViewMode>('selector');
  const [projects, setProjects] = useState<Array<{ displayName: string; folderName: string }>>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [flowRun, setFlowRun] = useState<FlowRun | null>(null);
  const [backwardActive, setBackwardActive] = useState<string[]>([]);
  const [lastHandoff, setLastHandoff] = useState<Extract<OperatorEvent, { kind: 'handoff.applied' }> | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [composerValue, setComposerValue] = useState('');
  const [awaitingInput, setAwaitingInput] = useState(false);
  const [waitLabel, setWaitLabel] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<SelectedNodeState | null>(null);

  function appendFeedItem(item: FeedItem): void {
    setFeed((current) => {
      if (item.type === 'assistant' && current[current.length - 1]?.type === 'assistant') {
        const previous = current[current.length - 1];
        return [
          ...current.slice(0, -1),
          { ...previous, text: previous.text + item.text }
        ];
      }
      return [...current, item];
    });
  }

  function sendMessage(message: ClientMessage): void {
    socket.send(message);
  }

  async function handleNodeClick(nodeId: string): Promise<void> {
    setSelectedNode({ nodeId, loading: true });

    try {
      const response = await fetch(`/api/transcripts/${encodeURIComponent(nodeId)}`);
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const payload = (await response.json()) as TranscriptPayload;
      setSelectedNode({
        nodeId: payload.nodeId,
        role: payload.role,
        transcript: payload.transcript,
        loading: false
      });
    } catch (error: unknown) {
      setSelectedNode({
        nodeId,
        loading: false,
        error: error instanceof Error ? error.message : 'Unable to load transcript.'
      });
    }
  }

  function handleIncomingMessage(message: ServerMessage): void {
    if (message.type === 'init') {
      setProjects(message.projects);
      setSelectedProject(message.flowRun?.projectNamespace ?? null);
      setFlowRun(message.flowRun);
      setBackwardActive([]);
      setLastHandoff(null);
      setFeed([]);
      setWaitLabel(null);
      setAwaitingInput(message.flowRun?.status === 'awaiting_human');
      setSelectedNode(null);
      setView(message.flowRun && message.flowRun.status !== 'completed' ? 'graph' : 'selector');
      return;
    }

    if (view === 'selector' && message.type !== 'flow_state') {
      setView('chat');
    }

    switch (message.type) {
      case 'operator_event':
        appendFeedItem(formatOperatorEvent(message.event));

        if (message.event.kind === 'role.active') {
          setView('graph');
          setAwaitingInput(false);
        }
        if (message.event.kind === 'human.awaiting_input') {
          setAwaitingInput(true);
        }
        if (message.event.kind === 'human.resumed' || message.event.kind === 'flow.completed') {
          setAwaitingInput(false);
        }
        if (message.event.kind === 'handoff.applied') {
          setLastHandoff(message.event);
        }
        return;
      case 'wait_start':
        setWaitLabel(`Waiting for first token from ${message.provider}/${message.model}`);
        return;
      case 'wait_stop':
        setWaitLabel(null);
        return;
      case 'output_text':
        setWaitLabel(null);
        appendFeedItem({
          id: nextFeedId(),
          type: 'assistant',
          label: 'Assistant',
          text: message.text
        });
        return;
      case 'flow_state':
        setFlowRun(message.flowRun);
        setSelectedProject(message.flowRun.projectNamespace);
        setBackwardActive(message.backwardActive);
        return;
      case 'error':
        appendFeedItem({
          id: nextFeedId(),
          type: 'error',
          label: 'Runtime Error',
          text: message.message
        });
        return;
      case 'flow_complete':
        setAwaitingInput(false);
        setWaitLabel(null);
        return;
      case 'init':
        return;
    }
  }

  const socket = useWebSocket(socketUrl, { onMessage: handleIncomingMessage });

  function handleProjectSelect(projectNamespace: string): void {
    setSelectedProject(projectNamespace);
    setFlowRun(null);
    setBackwardActive([]);
    setLastHandoff(null);
    setFeed([]);
    setWaitLabel(null);
    setAwaitingInput(false);
    setSelectedNode(null);
    setComposerValue('');
    setView('chat');
    sendMessage({ type: 'start_flow', projectNamespace });
  }

  function handleSubmit(): void {
    const text = composerValue.trim();
    if (!text) return;
    setComposerValue('');
    setAwaitingInput(false);
    sendMessage({ type: 'human_input', text });
  }

  const statusLine =
    socket.status === 'open'
      ? 'Connected'
      : socket.status === 'connecting'
        ? 'Reconnecting to runtime'
        : 'Connection lost';

  const backwardSources =
    flowRun && lastHandoff && flowRun.activeNodes.includes(lastHandoff.fromNodeId)
      ? [lastHandoff.fromNodeId]
      : [];

  return (
    <main className="app-shell">
      <div className="background-orbit background-orbit-left" />
      <div className="background-orbit background-orbit-right" />

      <header className="app-header">
        <div>
          <p className="eyebrow">A-Society Runtime</p>
          <h1>CLI to UI orchestration console</h1>
        </div>
        <div className="header-meta">
          <span className="status-pill">Socket: {statusLine}</span>
          {selectedProject ? <span className="status-pill">Project: {selectedProject}</span> : null}
        </div>
      </header>

      {view === 'selector' ? (
        <ProjectSelector
          projects={projects}
          selectedProject={selectedProject}
          disabled={socket.status !== 'open'}
          onSelect={handleProjectSelect}
        />
      ) : null}

      {view === 'chat' ? (
        <ChatInterface
          title={selectedProject ? `Owner bootstrap for ${selectedProject}` : 'Owner bootstrap'}
          subtitle="Fresh starts stay here until the first workflow node activates."
          messages={feed}
          waitingLabel={waitLabel}
          inputValue={composerValue}
          inputDisabled={!awaitingInput}
          placeholder={awaitingInput ? 'Reply to the current runtime prompt…' : 'Input unlocks when the runtime requests it.'}
          statusLine={statusLine}
          onInputChange={setComposerValue}
          onSubmit={handleSubmit}
        />
      ) : null}

      {view === 'graph' && flowRun ? (
        <section className="workspace-grid">
          <GraphView
            flowRun={flowRun}
            backwardActive={backwardActive}
            backwardSources={backwardSources}
            recordFolderPath={flowRun.recordFolderPath}
            workspaceRoot={flowRun.workspaceRoot}
            onNodeClick={(nodeId) => void handleNodeClick(nodeId)}
          />

          <div className="sidebar-stack">
            <ChatInterface
              title="Live operator feed"
              subtitle="Runtime events, assistant output, and human-input entry all live here during graph mode."
              messages={feed}
              waitingLabel={waitLabel}
              inputValue={composerValue}
              inputDisabled={!awaitingInput}
              placeholder={awaitingInput ? 'Reply to the active prompt…' : 'Input unlocks when the runtime requests it.'}
              statusLine={statusLine}
              onInputChange={setComposerValue}
              onSubmit={handleSubmit}
            />

            <section className="panel transcript-panel">
              <div className="panel-header">
                <p className="eyebrow">Node Detail</p>
                <h2>{selectedNode ? selectedNode.nodeId : 'Select a node'}</h2>
                <p className="panel-copy">
                  Click any active or completed node to inspect its persisted session transcript.
                </p>
              </div>

              {!selectedNode ? (
                <div className="feed-empty">No node selected yet.</div>
              ) : null}

              {selectedNode?.loading ? (
                <div className="feed-empty">Loading transcript…</div>
              ) : null}

              {selectedNode?.error ? (
                <article className="feed-item feed-item-error">
                  <p className="feed-label">Transcript Error</p>
                  <pre className="feed-text">{selectedNode.error}</pre>
                </article>
              ) : null}

              {!selectedNode?.loading && !selectedNode?.error && selectedNode?.transcript ? (
                <div className="transcript-list">
                  {selectedNode.transcript.map((entry, index) => {
                    const formatted = formatTranscriptEntry(entry);
                    return (
                      <article key={`${selectedNode.nodeId}-${index}`} className="feed-item feed-item-event">
                        <p className="feed-label">{formatted.label}</p>
                        <pre className="feed-text">{formatted.text}</pre>
                      </article>
                    );
                  })}
                </div>
              ) : null}
            </section>
          </div>
        </section>
      ) : null}
    </main>
  );
}

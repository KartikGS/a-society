import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChatInterface, type FeedItem } from './components/ChatInterface';
import { GraphView } from './components/GraphView';
import { ProjectSelector } from './components/ProjectSelector';
import { areFlowRunsEqual, areStringArraysEqual, areWorkflowGraphsEqual } from './equality';
import { useWebSocket } from './hooks/useWebSocket';
import type {
  ClientMessage,
  FlowRun,
  OperatorEvent,
  ProjectDiscovery,
  ServerMessage,
  WorkflowGraph,
} from './types';

type ViewMode = 'selector' | 'graph';
const EMPTY_STRINGS: string[] = [];

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

function formatOperatorEvent(event: OperatorEvent): FeedItem | null {
  switch (event.kind) {
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
        text: event.command ? `${event.toolName}: ${event.command}` : event.path ? `${event.toolName} ${event.path}` : event.toolName
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
      return null;
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
        label: 'Forward Pass',
        text: `Forward pass closed via ${event.artifactBasename}.`
      };
    case 'flow.improvement_prompt':
      return null;
    case 'flow.completed':
      return {
        id: nextFeedId(),
        type: 'event',
        label: 'Complete',
        text: 'Orchestration completed.'
      };
  }
}

export function App() {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const socketUrl = `${protocol}://${window.location.host}`;

  const [view, setView] = useState<ViewMode>('selector');
  const [projects, setProjects] = useState<ProjectDiscovery>({ withADocs: [], withoutADocs: [] });
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectorError, setSelectorError] = useState<string | null>(null);
  const [flowRun, setFlowRun] = useState<FlowRun | null>(null);
  const [backwardActive, setBackwardActive] = useState<string[]>([]);
  const [lastHandoff, setLastHandoff] = useState<Extract<OperatorEvent, { kind: 'handoff.applied' }> | null>(null);
  const [roleFeeds, setRoleFeeds] = useState<Record<string, FeedItem[]>>({});
  const [activeLiveRole, setActiveLiveRole] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowGraph | null>(null);
  const [composerValue, setComposerValue] = useState('');
  const [awaitingInput, setAwaitingInput] = useState(false);
  const [waitLabel, setWaitLabel] = useState<string | null>(null);
  const [showImprovementModal, setShowImprovementModal] = useState(false);
  const [stopRequested, setStopRequested] = useState(false);

  function appendToRoleFeed(role: string, item: FeedItem): void {
    setRoleFeeds((current) => {
      const existing = current[role] ?? [];
      if (item.type === 'assistant' && existing[existing.length - 1]?.type === 'assistant') {
        const previous = existing[existing.length - 1];
        return {
          ...current,
          [role]: [...existing.slice(0, -1), { ...previous, text: previous.text + item.text }]
        };
      }
      return { ...current, [role]: [...existing, item] };
    });
  }

  function appendToActiveRole(item: FeedItem): void {
    setActiveLiveRole((role) => {
      const target = role ?? '__system__';
      appendToRoleFeed(target, item);
      return role;
    });
  }

  function resolveInputTargetRole(): string {
    if (activeLiveRole) return activeLiveRole;
    if (flowRun && workflow && flowRun.activeNodes.length === 1) {
      const activeNode = workflow.nodes.find((node) => node.id === flowRun.activeNodes[0]);
      if (activeNode) return activeNode.role;
    }
    if (selectedRole) return selectedRole;
    return '__system__';
  }

  function sendMessage(message: ClientMessage): void {
    socket.send(message);
  }

  function handleIncomingMessage(message: ServerMessage): void {
    if (message.type === 'init') {
      setProjects(message.projects);
      setSelectedProject(message.flowRun?.projectNamespace ?? null);
      setNewProjectName('');
      setSelectorError(null);
      setFlowRun(message.flowRun);
      setBackwardActive([]);
      setLastHandoff(null);
      setRoleFeeds({});
      setActiveLiveRole(null);
      setSelectedRole(null);
      setWorkflow(null);
      setWaitLabel(null);
      setAwaitingInput(message.flowRun?.status === 'awaiting_human');
      setShowImprovementModal(false);
      setStopRequested(false);
      setView(message.flowRun && message.flowRun.status !== 'completed' ? 'graph' : 'selector');
      return;
    }

    switch (message.type) {
      case 'operator_event': {
        const event = message.event;

        if (event.kind === 'role.active') {
          setActiveLiveRole(event.role);
          setSelectedRole((prev) => prev ?? event.role);
          setSelectorError(null);
          setView('graph');
          setAwaitingInput(false);
          setStopRequested(false);
        }

        if (event.kind === 'human.awaiting_input') {
          setAwaitingInput(true);
          setStopRequested(false);
        }

        if (event.kind === 'human.resumed') {
          setActiveLiveRole(event.role);
          setAwaitingInput(false);
          setStopRequested(false);
        }

        if (event.kind === 'flow.completed') {
          setAwaitingInput(false);
          setStopRequested(false);
        }

        if (event.kind === 'handoff.applied') {
          setLastHandoff(event);
        }

        if (event.kind === 'flow.improvement_prompt') {
          setShowImprovementModal(true);
          return;
        }

        const item = formatOperatorEvent(event);
        if (item) appendToActiveRole(item);
        return;
      }
      case 'wait_start':
        setWaitLabel(`Waiting for first token from ${message.provider}/${message.model}`);
        return;
      case 'wait_stop':
        setWaitLabel(null);
        return;
      case 'output_text':
        setWaitLabel(null);
        appendToActiveRole({
          id: nextFeedId(),
          type: 'assistant',
          label: 'Assistant',
          text: message.text
        });
        return;
      case 'flow_state':
        setFlowRun((current) => (areFlowRunsEqual(current, message.flowRun) ? current : message.flowRun));
        setSelectedProject(message.flowRun.projectNamespace);
        setBackwardActive((current) => (
          areStringArraysEqual(current, message.backwardActive) ? current : message.backwardActive
        ));
        if (message.flowRun.status !== 'running') {
          setStopRequested(false);
        }
        if (message.flowRun.status !== 'completed') {
          setView('graph');
        }
        return;
      case 'error':
        setStopRequested(false);
        if (!flowRun) {
          setSelectorError(message.message);
          setView('selector');
        }
        appendToActiveRole({
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
    }
  }

  const socket = useWebSocket(socketUrl, { onMessage: handleIncomingMessage });

  useEffect(() => {
    if (view !== 'graph' || socket.status !== 'open' || !selectedProject) {
      return;
    }

    let cancelled = false;

    const syncFlowState = async () => {
      try {
        const response = await fetch('/api/flow-state');
        if (!response.ok) {
          throw new Error(await response.text());
        }

        const nextFlowRun = await response.json() as FlowRun | null;
        if (cancelled) return;

        setFlowRun((current) => (areFlowRunsEqual(current, nextFlowRun) ? current : nextFlowRun));
        if (nextFlowRun) {
          setSelectedProject(nextFlowRun.projectNamespace);
        }
      } catch {
        // Ignore poll errors and keep the last known state.
      }
    };

    void syncFlowState();
    const timer = window.setInterval(() => {
      void syncFlowState();
    }, 1500);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [view, socket.status, selectedProject]);

  function handleProjectSelect(projectNamespace: string): void {
    setSelectedProject(projectNamespace);
    setNewProjectName('');
    setSelectorError(null);
    setFlowRun(null);
    setBackwardActive([]);
    setLastHandoff(null);
    setRoleFeeds({});
    setActiveLiveRole(null);
    setSelectedRole(null);
    setWorkflow(null);
    setWaitLabel(null);
    setAwaitingInput(false);
    setShowImprovementModal(false);
    setComposerValue('');
    setStopRequested(false);
    setView('graph');
    sendMessage({ type: 'start_initialized_flow', projectNamespace });
  }

  function handleExistingInitialization(projectNamespace: string): void {
    setSelectedProject(projectNamespace);
    setNewProjectName('');
    setSelectorError(null);
    setFlowRun(null);
    setBackwardActive([]);
    setLastHandoff(null);
    setRoleFeeds({});
    setActiveLiveRole(null);
    setSelectedRole(null);
    setWorkflow(null);
    setWaitLabel(null);
    setAwaitingInput(false);
    setShowImprovementModal(false);
    setComposerValue('');
    setStopRequested(false);
    setView('graph');
    sendMessage({ type: 'start_takeover_initialization', projectNamespace });
  }

  function handleCreateNewProject(): void {
    const projectName = newProjectName.trim();
    if (!projectName) return;

    setSelectedProject(projectName);
    setSelectorError(null);
    setFlowRun(null);
    setBackwardActive([]);
    setLastHandoff(null);
    setRoleFeeds({});
    setActiveLiveRole(null);
    setSelectedRole(null);
    setWorkflow(null);
    setWaitLabel(null);
    setAwaitingInput(false);
    setShowImprovementModal(false);
    setComposerValue('');
    setStopRequested(false);
    setView('graph');
    sendMessage({ type: 'start_greenfield_initialization', projectName });
  }

  function handleSubmit(): void {
    const text = composerValue.trim();
    if (!text) return;
    appendToRoleFeed(resolveInputTargetRole(), {
      id: nextFeedId(),
      type: 'user',
      label: 'You',
      text
    });
    setComposerValue('');
    setAwaitingInput(false);
    sendMessage({ type: 'human_input', text });
  }

  function handleImprovementChoice(choice: '1' | '2' | '3'): void {
    setShowImprovementModal(false);
    sendMessage({ type: 'human_input', text: choice });
  }

  function handleStopActiveTurn(): void {
    if (stopRequested) return;
    setStopRequested(true);
    sendMessage({ type: 'stop_active_turn' });
  }

  const handleWorkflowLoaded = useCallback((graph: WorkflowGraph) => {
    setWorkflow((current) => (areWorkflowGraphsEqual(current, graph) ? current : graph));
  }, []);

  const handleGraphNodeClick = useCallback((_nodeId: string) => {}, []);

  const statusLine =
    socket.status === 'open'
      ? 'Connected'
      : socket.status === 'connecting'
        ? 'Reconnecting to runtime'
        : 'Connection lost';

  const backwardSources = useMemo(() => (
    flowRun && lastHandoff && flowRun.activeNodes.includes(lastHandoff.fromNodeId)
      ? [lastHandoff.fromNodeId]
      : EMPTY_STRINGS
  ), [flowRun?.activeNodes, lastHandoff?.fromNodeId]);

  const roles = useMemo(() => (
    workflow
      ? [...new Set(workflow.nodes.map((node) => node.role))]
      : EMPTY_STRINGS
  ), [workflow]);

  const displayedFeed = selectedRole ? (roleFeeds[selectedRole] ?? []) : (activeLiveRole ? (roleFeeds[activeLiveRole] ?? []) : []);
  const visibleFeed = displayedFeed.length > 0 ? displayedFeed : (roleFeeds.__system__ ?? []);
  const canStop =
    !!flowRun &&
    flowRun.status === 'running' &&
    !awaitingInput &&
    !showImprovementModal &&
    socket.status === 'open';

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
          projectsWithADocs={projects.withADocs}
          projectsWithoutADocs={projects.withoutADocs}
          selectedProject={selectedProject}
          newProjectName={newProjectName}
          errorMessage={selectorError}
          disabled={socket.status !== 'open'}
          onSelectInitialized={handleProjectSelect}
          onInitializeExisting={handleExistingInitialization}
          onNewProjectNameChange={setNewProjectName}
          onCreateNew={handleCreateNewProject}
        />
      ) : null}

      <div className={`view-layer${view === 'graph' ? ' view-layer-visible' : ' view-layer-hidden'}`}>
        {flowRun ? (
          <section className="workspace-grid">
            <GraphView
              flowRun={flowRun}
              backwardActive={backwardActive}
              backwardSources={backwardSources}
              recordFolderPath={flowRun.recordFolderPath}
              onNodeClick={handleGraphNodeClick}
              onWorkflowLoaded={handleWorkflowLoaded}
            />

            <ChatInterface
              title="Role feed"
              subtitle="Select a role to view its conversation."
              messages={visibleFeed}
              waitingLabel={waitLabel}
              inputValue={composerValue}
              inputDisabled={!awaitingInput}
              placeholder={awaitingInput ? 'Reply to the active prompt…' : 'Input unlocks when the runtime requests it.'}
              statusLine={statusLine}
              canStop={canStop}
              stopRequested={stopRequested}
              roles={roles}
              selectedRole={selectedRole ?? activeLiveRole ?? undefined}
              activeRole={activeLiveRole ?? undefined}
              onRoleSelect={setSelectedRole}
              onInputChange={setComposerValue}
              onSubmit={handleSubmit}
              onStop={handleStopActiveTurn}
            />
          </section>
        ) : (
          <section className="workspace-grid">
            <section className="panel graph-panel">
              <div className="graph-panel-header">
                <div>
                  <p className="eyebrow">Workflow Graph</p>
                  <h2>{selectedProject ?? 'Preparing flow'}</h2>
                  <p className="panel-copy">Preparing the runtime-owned flow and waiting for the first Owner node to activate…</p>
                </div>
              </div>

              <div className="graph-canvas">
                <div className="graph-empty">Waiting for flow state…</div>
              </div>
            </section>

            <ChatInterface
              title="Role feed"
              subtitle="The first Owner conversation will appear here once the runtime activates the initialization or intake node."
              messages={displayedFeed}
              waitingLabel={waitLabel}
              inputValue={composerValue}
              inputDisabled={!awaitingInput}
              placeholder={awaitingInput ? 'Reply to the active prompt…' : 'Input unlocks when the runtime requests it.'}
              statusLine={statusLine}
              canStop={canStop}
              stopRequested={stopRequested}
              roles={[]}
              selectedRole={selectedRole ?? activeLiveRole ?? undefined}
              activeRole={activeLiveRole ?? undefined}
              onRoleSelect={setSelectedRole}
              onInputChange={setComposerValue}
              onSubmit={handleSubmit}
              onStop={handleStopActiveTurn}
            />
          </section>
        )}
      </div>

      {showImprovementModal ? (
        <div className="modal-overlay">
          <div className="modal-panel">
            <p className="eyebrow">Improvement Phase</p>
            <h2>Choose improvement mode</h2>
            <p className="modal-copy">Forward pass is complete. How should the backward pass proceed?</p>
            <div className="modal-choices">
              <button className="modal-choice" onClick={() => handleImprovementChoice('1')}>
                <span className="modal-choice-label">Graph-based</span>
                <span className="modal-choice-desc">Roles run in reverse topological order; each receives findings from their direct forward successors.</span>
              </button>
              <button className="modal-choice" onClick={() => handleImprovementChoice('2')}>
                <span className="modal-choice-label">Parallel</span>
                <span className="modal-choice-desc">All roles run simultaneously; no cross-role findings injected.</span>
              </button>
              <button className="modal-choice modal-choice-neutral" onClick={() => handleImprovementChoice('3')}>
                <span className="modal-choice-label">No improvement</span>
                <span className="modal-choice-desc">Close the record now without a backward pass.</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

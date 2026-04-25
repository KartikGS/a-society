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
        text: `${event.nodeId} (${event.role}) is waiting for a human reply.`
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

function getOpenNodeIds(flowRun: FlowRun): string[] {
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const nodeId of [
    ...flowRun.readyNodes,
    ...flowRun.runningNodes,
    ...Object.keys(flowRun.awaitingHumanNodes)
  ]) {
    if (seen.has(nodeId)) continue;
    seen.add(nodeId);
    ids.push(nodeId);
  }
  return ids;
}

function getAwaitingNodeIdForRole(flowRun: FlowRun | null, role: string | null): string | null {
  if (!flowRun || !role) return null;
  const roleKey = role.toLowerCase();
  const match = Object.entries(flowRun.awaitingHumanNodes)
    .find(([, state]) => state.role.toLowerCase() === roleKey);
  return match?.[0] ?? null;
}

export function App() {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const socketUrl = `${protocol}://${window.location.host}`;

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
  const [, setAwaitingInput] = useState(false);
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
    if (flowRun && selectedRole && getAwaitingNodeIdForRole(flowRun, selectedRole)) {
      return selectedRole;
    }
    if (activeLiveRole) return activeLiveRole;
    if (flowRun && workflow && getOpenNodeIds(flowRun).length === 1) {
      const activeNode = workflow.nodes.find((node) => node.id === getOpenNodeIds(flowRun)[0]);
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
      return;
    }

    switch (message.type) {
      case 'operator_event': {
        const event = message.event;

        if (event.kind === 'role.active') {
          setActiveLiveRole(event.role);
          setSelectedRole((prev) => prev ?? event.role);
          setSelectorError(null);
          setAwaitingInput(false);
          setStopRequested(false);
          const item = formatOperatorEvent(event);
          if (item) appendToRoleFeed(event.role, item);
          return;
        }

        if (event.kind === 'human.awaiting_input') {
          setActiveLiveRole(event.role);
          setSelectedRole((prev) => prev ?? event.role);
          setAwaitingInput(true);
          setStopRequested(false);
          const item = formatOperatorEvent(event);
          if (item) appendToRoleFeed(event.role, item);
          return;
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
        setWaitLabel(`Waiting for ${message.model} response.`);
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
        setAwaitingInput(Object.keys(message.flowRun.awaitingHumanNodes).length > 0);
        setBackwardActive((current) => (
          areStringArraysEqual(current, message.backwardActive) ? current : message.backwardActive
        ));
        if (message.flowRun.status !== 'running') {
          setStopRequested(false);
        }
        return;
      case 'error':
        setStopRequested(false);
        if (!flowRun) {
          setSelectorError(message.message);
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
    if (socket.status !== 'open' || !selectedProject) {
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
  }, [socket.status, selectedProject]);

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
    sendMessage({ type: 'start_greenfield_initialization', projectName });
  }

  function handleSubmit(): void {
    const text = composerValue.trim();
    if (!text) return;
    const targetRole = resolveInputTargetRole();
    appendToRoleFeed(targetRole, {
      id: nextFeedId(),
      type: 'user',
      label: 'You',
      text
    });
    setComposerValue('');
    setAwaitingInput(false);
    sendMessage({ type: 'human_input', text, role: targetRole === '__system__' ? undefined : targetRole });
  }

  function handleImprovementChoice(choice: '1' | '2' | '3'): void {
    setShowImprovementModal(false);
    sendMessage({ type: 'human_input', text: choice });
  }

  function handleStopActiveTurn(): void {
    if (stopRequested) return;
    setStopRequested(true);
    sendMessage({ type: 'stop_active_turn', role: viewedRole ?? undefined });
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

  const activeNodeIds = flowRun ? getOpenNodeIds(flowRun) : undefined;
  const lastHandoffFromNodeId = lastHandoff?.fromNodeId;
  const backwardSources = useMemo(() => (
    activeNodeIds && lastHandoffFromNodeId && activeNodeIds.includes(lastHandoffFromNodeId)
      ? [lastHandoffFromNodeId]
      : EMPTY_STRINGS
  ), [activeNodeIds, lastHandoffFromNodeId]);

  const roles = useMemo(() => (
    workflow
      ? [...new Set(workflow.nodes.map((node) => node.role))]
      : EMPTY_STRINGS
  ), [workflow]);

  const activeRoles = useMemo(() => {
    if (!flowRun || !workflow) {
      return activeLiveRole ? [activeLiveRole] : EMPTY_STRINGS;
    }

    return [...new Set(
      getOpenNodeIds(flowRun)
        .map((nodeId) => workflow.nodes.find((node) => node.id === nodeId)?.role)
        .filter((role): role is string => role !== undefined)
    )];
  }, [activeLiveRole, flowRun, workflow]);

  const viewedRole = selectedRole ?? activeLiveRole ?? activeRoles[0] ?? null;
  const displayedFeed = viewedRole ? (roleFeeds[viewedRole] ?? []) : [];
  const visibleFeed = displayedFeed.length > 0 ? displayedFeed : (roleFeeds.__system__ ?? []);
  const isViewedRoleActive = viewedRole ? activeRoles.includes(viewedRole) : false;
  const viewedRoleAwaitingNodeId = getAwaitingNodeIdForRole(flowRun, viewedRole);
  const visibleWaitLabel = isViewedRoleActive ? waitLabel : null;
  const inputDisabled = !viewedRoleAwaitingNodeId;
  const canStop =
    !!flowRun &&
    flowRun.status === 'running' &&
    !viewedRoleAwaitingNodeId &&
    !showImprovementModal &&
    socket.status === 'open';
  const canStopViewedRole = canStop && isViewedRoleActive;

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

      <div className="workspace-grid">
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

        {flowRun ? (
          <GraphView
            flowRun={flowRun}
            backwardActive={backwardActive}
            backwardSources={backwardSources}
            recordFolderPath={flowRun.recordFolderPath}
            onNodeClick={handleGraphNodeClick}
            onWorkflowLoaded={handleWorkflowLoaded}
          />
        ) : (
          <section className="panel center-panel graph-panel">
            <div className="graph-panel-header">
              <div>
                <p className="eyebrow">Workflow Graph</p>
                <h2>{selectedProject ? selectedProject : 'No project selected'}</h2>
                <p className="panel-copy">
                  {selectedProject 
                    ? 'Preparing the runtime-owned flow and waiting for the first Owner node to activate…' 
                    : 'Select a project from the left sidebar to load its workflow graph and role chat.'}
                </p>
              </div>
            </div>
            <div className="graph-canvas">
              <div className="graph-empty">
                {selectedProject ? 'Waiting for flow state…' : 'Select a project to begin'}
              </div>
            </div>
          </section>
        )}

        <ChatInterface
          subtitle={
            flowRun 
              ? "Select a role to view its conversation." 
              : "The first Owner conversation will appear here once the runtime activates the initialization or intake node."
          }
          messages={visibleFeed}
          waitingLabel={visibleWaitLabel}
          inputValue={composerValue}
          inputDisabled={inputDisabled}
          placeholder={!inputDisabled ? 'Reply to the selected role prompt...' : 'Select a role that is awaiting input.'}
          showComposer={isViewedRoleActive}
          canStop={canStopViewedRole}
          stopRequested={stopRequested}
          roles={roles}
          selectedRole={viewedRole ?? undefined}
          activeRole={activeLiveRole ?? undefined}
          onRoleSelect={setSelectedRole}
          onInputChange={setComposerValue}
          onSubmit={handleSubmit}
          onStop={handleStopActiveTurn}
        />
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

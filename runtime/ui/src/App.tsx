import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { ChatInterface, type FeedItem } from './components/ChatInterface';
import { GraphView } from './components/GraphView';
import { ProjectSelector } from './components/ProjectSelector';
import { areFlowRunsEqual, areStringArraysEqual, areWorkflowGraphsEqual } from './equality';
import { useWebSocket } from './hooks/useWebSocket';
import type {
  ClientMessage,
  FlowRef,
  FlowRun,
  FlowSummary,
  OperatorEvent,
  ProjectDiscovery,
  ServerMessage,
  WorkflowGraph,
} from './types';

const EMPTY_STRINGS: string[] = [];

interface FlowTab {
  key: string;
  ref: FlowRef;
  title: string;
}

interface FlowUiState {
  flowRun: FlowRun | null;
  backwardActive: string[];
  lastHandoff: Extract<OperatorEvent, { kind: 'handoff.applied' }> | null;
  roleFeeds: Record<string, FeedItem[]>;
  activeLiveRole: string | null;
  selectedRole: string | null;
  workflow: WorkflowGraph | null;
  composerValue: string;
  awaitingInput: boolean;
  waitLabel: string | null;
  stopRequested: boolean;
}

function nextFeedId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function flowKey(ref: FlowRef): string {
  return `${ref.projectNamespace}/${ref.flowId}`;
}


function createFlowUiState(flowRun: FlowRun | null = null): FlowUiState {
  return {
    flowRun,
    backwardActive: [],
    lastHandoff: null,
    roleFeeds: {},
    activeLiveRole: null,
    selectedRole: null,
    workflow: null,
    composerValue: '',
    awaitingInput: flowRun?.status === 'awaiting_human',
    waitLabel: null,
    stopRequested: false,
  };
}

function parseUrlFlowRef(): FlowRef | null {
  const params = new URLSearchParams(window.location.search);
  const projectNamespace = params.get('project');
  const flowId = params.get('flow');
  if (!projectNamespace || !flowId) return null;
  return { projectNamespace, flowId };
}

function writeUrlFlowRef(ref: FlowRef | null): void {
  const url = new URL(window.location.href);
  if (ref) {
    url.searchParams.set('project', ref.projectNamespace);
    url.searchParams.set('flow', ref.flowId);
  } else {
    url.searchParams.delete('project');
    url.searchParams.delete('flow');
  }
  window.history.replaceState({}, '', url);
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
      if (event.activationSource !== 'handoff' && event.activationSource !== 'runtime') return null;
      return {
        id: nextFeedId(),
        type: 'activation',
        label: event.activationSource === 'runtime' ? 'Runtime' : 'Handoff',
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
        type: 'repair',
        label: 'Repair Requested',
        text: event.summary
      };
    case 'human.awaiting_input':
      return null;
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

function appendFeedItem(feeds: Record<string, FeedItem[]>, role: string, item: FeedItem): Record<string, FeedItem[]> {
  const existing = feeds[role] ?? [];
  const previous = existing[existing.length - 1];
  if (item.type === 'assistant' && previous?.type === 'assistant') {
    return {
      ...feeds,
      [role]: [...existing.slice(0, -1), { ...previous, text: previous.text + item.text }]
    };
  }
  return { ...feeds, [role]: [...existing, item] };
}

function titleForFlow(flowRun: FlowRun | FlowSummary | FlowRef): string {
  if ('recordName' in flowRun && flowRun.recordName) return flowRun.recordName;
  return flowRun.flowId;
}

export function App() {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const socketUrl = `${protocol}://${window.location.host}`;
  const initialFlowRef = useMemo(() => parseUrlFlowRef(), []);
  const initialUrlFlowRef = useRef<FlowRef | null>(initialFlowRef);
  const openedInitialFlow = useRef(false);
  const lastSubscribedConnectionId = useRef(0);

  const [projects, setProjects] = useState<ProjectDiscovery>({ withADocs: [], withoutADocs: [] });
  const [selectedProject, setSelectedProject] = useState<string | null>(initialFlowRef?.projectNamespace ?? null);
  const [projectFlowsByProject, setProjectFlowsByProject] = useState<Record<string, FlowSummary[]>>({});
  const [newProjectName, setNewProjectName] = useState('');
  const [selectorError, setSelectorError] = useState<string | null>(null);
  const [tabs, setTabs] = useState<FlowTab[]>([]);
  const [activeTabKey, setActiveTabKey] = useState<string | null>(initialFlowRef ? flowKey(initialFlowRef) : null);
  const [flowUiByKey, setFlowUiByKey] = useState<Record<string, FlowUiState>>({});

  const updateFlowUi = useCallback((key: string, updater: (state: FlowUiState) => FlowUiState): void => {
    setFlowUiByKey((current) => {
      const base = current[key] ?? createFlowUiState();
      return { ...current, [key]: updater(base) };
    });
  }, []);

  const ensureTab = useCallback((ref: FlowRef, title: string): void => {
    const key = flowKey(ref);
    setTabs((current) => {
      const existing = current.find((tab) => tab.key === key);
      if (existing) {
        return current.map((tab) => tab.key === key ? { ...tab, title } : tab);
      }
      return [...current, { key, ref, title }];
    });
    setActiveTabKey(key);
    setSelectedProject(ref.projectNamespace);
    writeUrlFlowRef(ref);
  }, []);

  const fetchProjectFlows = useCallback(async (projectNamespace: string): Promise<void> => {
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(projectNamespace)}/flows`);
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const flows = await response.json() as FlowSummary[];
      setProjectFlowsByProject((current) => ({ ...current, [projectNamespace]: flows }));
    } catch {
      setProjectFlowsByProject((current) => ({ ...current, [projectNamespace]: current[projectNamespace] ?? [] }));
    }
  }, []);

  function handleIncomingMessage(message: ServerMessage): void {
    if (message.type === 'init') {
      setProjects(message.projects);
      setNewProjectName('');
      setSelectorError(null);
      return;
    }

    if (message.type === 'flow_summaries') {
      setProjectFlowsByProject((current) => ({ ...current, [message.projectNamespace]: message.flows }));
      return;
    }

    const key = flowKey(message.flowRef);

    switch (message.type) {
      case 'feed_reset':
        updateFlowUi(key, (state) => ({
          ...state,
          roleFeeds: {},
          activeLiveRole: null,
          lastHandoff: null,
          waitLabel: null,
          stopRequested: false,
        }));
        return;
      case 'operator_event': {
        const event = message.event;

        if (event.kind === 'role.active') {
          updateFlowUi(key, (state) => {
            const item = formatOperatorEvent(event);
            return {
              ...state,
              activeLiveRole: event.role,
              selectedRole: state.selectedRole ?? event.role,
              awaitingInput: false,
              stopRequested: false,
              roleFeeds: item ? appendFeedItem(state.roleFeeds, event.role, item) : state.roleFeeds,
            };
          });
          setSelectorError(null);
          return;
        }

        if (event.kind === 'human.awaiting_input') {
          updateFlowUi(key, (state) => {
            const item = formatOperatorEvent(event);
            return {
              ...state,
              activeLiveRole: event.role,
              selectedRole: state.selectedRole ?? event.role,
              awaitingInput: true,
              stopRequested: false,
              roleFeeds: item ? appendFeedItem(state.roleFeeds, event.role, item) : state.roleFeeds,
            };
          });
          return;
        }

        updateFlowUi(key, (state) => {
          const item = formatOperatorEvent(event);
          const activeRole = event.kind === 'human.resumed'
            ? event.role
            : state.activeLiveRole;
          return {
            ...state,
            activeLiveRole: activeRole,
            awaitingInput: event.kind === 'flow.completed' ? false : state.awaitingInput,
            stopRequested: event.kind === 'flow.completed' || event.kind === 'human.resumed' ? false : state.stopRequested,
            lastHandoff: event.kind === 'handoff.applied' ? event : state.lastHandoff,
            roleFeeds: item ? appendFeedItem(state.roleFeeds, activeRole ?? '__system__', item) : state.roleFeeds,
          };
        });
        return;
      }
      case 'wait_start':
        updateFlowUi(key, (state) => ({ ...state, waitLabel: `Waiting for ${message.model} response.` }));
        return;
      case 'wait_stop':
        updateFlowUi(key, (state) => ({ ...state, waitLabel: null }));
        return;
      case 'output_text':
        updateFlowUi(key, (state) => ({
          ...state,
          waitLabel: null,
          roleFeeds: appendFeedItem(state.roleFeeds, message.role ?? state.activeLiveRole ?? '__system__', {
            id: nextFeedId(),
            type: 'assistant',
            label: 'Assistant',
            text: message.text
          })
        }));
        return;
      case 'input_text':
        updateFlowUi(key, (state) => ({
          ...state,
          roleFeeds: appendFeedItem(state.roleFeeds, message.role ?? state.activeLiveRole ?? '__system__', {
            id: nextFeedId(),
            type: 'user',
            label: 'You',
            text: message.text
          })
        }));
        return;
      case 'flow_state':
        ensureTab(message.flowRef, titleForFlow(message.flowRun));
        updateFlowUi(key, (state) => ({
          ...state,
          flowRun: areFlowRunsEqual(state.flowRun, message.flowRun) ? state.flowRun : message.flowRun,
          backwardActive: areStringArraysEqual(state.backwardActive, message.backwardActive)
            ? state.backwardActive
            : message.backwardActive,
          awaitingInput: Object.keys(message.flowRun.awaitingHumanNodes).length > 0,
          stopRequested: message.flowRun.status !== 'running' ? false : state.stopRequested,
        }));
        void fetchProjectFlows(message.flowRef.projectNamespace);
        return;
      case 'error':
        updateFlowUi(key, (state) => ({
          ...state,
          stopRequested: false,
          roleFeeds: appendFeedItem(state.roleFeeds, state.activeLiveRole ?? '__system__', {
            id: nextFeedId(),
            type: 'error',
            label: 'Runtime Error',
            text: message.message
          })
        }));
        if (message.flowRef.flowId === '__new__' || message.flowRef.flowId === '__system__') {
          setSelectorError(message.message);
        }
        return;
      case 'flow_complete':
        updateFlowUi(key, (state) => ({
          ...state,
          awaitingInput: false,
          waitLabel: null,
        }));
        return;
    }
  }

  const socket = useWebSocket(socketUrl, { onMessage: handleIncomingMessage });

  const { send: socketSend } = socket;
  const sendMessage = useCallback((message: ClientMessage): void => {
    socketSend(message);
  }, [socketSend]);

  const openFlow = useCallback((ref: FlowRef, title = ref.flowId): void => {
    ensureTab(ref, title);
    updateFlowUi(flowKey(ref), (state) => state);
    sendMessage({ type: 'open_flow', flowRef: ref });
  }, [ensureTab, updateFlowUi, sendMessage]);

  const activeTab = useMemo(() => (
    activeTabKey ? tabs.find((tab) => tab.key === activeTabKey) ?? null : null
  ), [activeTabKey, tabs]);

  useEffect(() => {
    const ref = initialUrlFlowRef.current;
    if (socket.status !== 'open' || openedInitialFlow.current || !ref) return;
    openedInitialFlow.current = true;
    openFlow(ref);
  }, [socket.status, openFlow]);

  useEffect(() => {
    if (socket.status !== 'open' || !activeTab) return;
    if (socket.connectionId === lastSubscribedConnectionId.current) return;
    lastSubscribedConnectionId.current = socket.connectionId;
    sendMessage({ type: 'open_flow', flowRef: activeTab.ref });
  }, [socket.status, socket.connectionId, activeTab, sendMessage]);

  useEffect(() => {
    if (!selectedProject) return;
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(`/api/projects/${encodeURIComponent(selectedProject)}/flows`);
        if (!response.ok) throw new Error(await response.text());
        const flows = await response.json() as FlowSummary[];
        if (!cancelled) setProjectFlowsByProject((current) => ({ ...current, [selectedProject]: flows }));
      } catch {
        if (!cancelled) setProjectFlowsByProject((current) => ({ ...current, [selectedProject]: current[selectedProject] ?? [] }));
      }
    })();
    return () => { cancelled = true; };
  }, [selectedProject]);

  const activeUi = activeTabKey ? flowUiByKey[activeTabKey] ?? null : null;
  const flowRun = activeUi?.flowRun ?? null;
  const workflow = activeUi?.workflow ?? null;
  const activeLiveRole = activeUi?.activeLiveRole ?? null;
  const selectedRole = activeUi?.selectedRole ?? null;
  const lastHandoff = activeUi?.lastHandoff ?? null;
  const backwardActive = activeUi?.backwardActive ?? EMPTY_STRINGS;
  const projectFlows = selectedProject ? projectFlowsByProject[selectedProject] ?? [] : [];

  useEffect(() => {
    if (socket.status !== 'open' || !activeTab) {
      return;
    }

    let cancelled = false;

    const syncFlowState = async () => {
      try {
        const response = await fetch(
          `/api/flows/${encodeURIComponent(activeTab.ref.projectNamespace)}/${encodeURIComponent(activeTab.ref.flowId)}/state`
        );
        if (!response.ok) {
          throw new Error(await response.text());
        }

        const nextFlowRun = await response.json() as FlowRun | null;
        if (cancelled || !nextFlowRun) return;

        updateFlowUi(activeTab.key, (state) => ({
          ...state,
          flowRun: areFlowRunsEqual(state.flowRun, nextFlowRun) ? state.flowRun : nextFlowRun,
        }));
      } catch {
        // Keep the last known state while the server catches up.
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
  }, [socket.status, activeTab, updateFlowUi]);

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

  function handleProjectSelect(projectNamespace: string | null): void {
    setSelectedProject(projectNamespace);
    setNewProjectName('');
    setSelectorError(null);
    if (projectNamespace) {
      void fetchProjectFlows(projectNamespace);
    }
  }

  function handleExistingInitialization(projectNamespace: string): void {
    setSelectedProject(projectNamespace);
    setNewProjectName('');
    setSelectorError(null);
    sendMessage({ type: 'start_takeover_initialization', projectNamespace });
  }

  function handleCreateNewProject(): void {
    const projectName = newProjectName.trim();
    if (!projectName) return;

    setSelectedProject(projectName);
    setSelectorError(null);
    sendMessage({ type: 'start_greenfield_initialization', projectName });
  }

  function handleOpenFlow(flow: FlowSummary): void {
    openFlow({ projectNamespace: flow.projectNamespace, flowId: flow.flowId }, titleForFlow(flow));
  }

  function handleNewFlow(projectNamespace: string): void {
    setSelectorError(null);
    sendMessage({ type: 'start_initialized_flow', projectNamespace });
  }

  async function handleDeleteFlow(flow: FlowSummary): Promise<void> {
    const label = flow.recordName ?? flow.flowId;
    if (!window.confirm(`Delete "${label}" and all its artifacts? This cannot be undone.`)) return;

    try {
      const response = await fetch(
        `/api/flows/${encodeURIComponent(flow.projectNamespace)}/${encodeURIComponent(flow.flowId)}`,
        { method: 'DELETE' },
      );
      if (!response.ok) throw new Error(await response.text());

      const key = flowKey(flow);
      setTabs((current) => current.filter((tab) => tab.key !== key));
      setFlowUiByKey((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
      if (activeTabKey === key) {
        setActiveTabKey(null);
        writeUrlFlowRef(null);
      }

      void fetchProjectFlows(flow.projectNamespace);
    } catch (err) {
      setSelectorError(err instanceof Error ? err.message : 'Failed to delete flow.');
    }
  }

  function handleTabSelect(tab: FlowTab): void {
    setActiveTabKey(tab.key);
    setSelectedProject(tab.ref.projectNamespace);
    writeUrlFlowRef(tab.ref);
    sendMessage({ type: 'open_flow', flowRef: tab.ref });
  }

  function handleCloseTab(tab: FlowTab): void {
    setTabs((current) => {
      const next = current.filter((t) => t.key !== tab.key);
      if (activeTabKey === tab.key) {
        const idx = current.findIndex((t) => t.key === tab.key);
        const fallback = next[idx] ?? next[idx - 1] ?? null;
        setActiveTabKey(fallback?.key ?? null);
        writeUrlFlowRef(fallback?.ref ?? null);
        if (fallback) {
          setSelectedProject(fallback.ref.projectNamespace);
        }
      }
      return next;
    });
    setFlowUiByKey((current) => {
      const next = { ...current };
      delete next[tab.key];
      return next;
    });
  }

  function handleSubmit(): void {
    if (!activeTab || !activeUi) return;
    const text = activeUi.composerValue.trim();
    if (!text) return;
    const targetRole = resolveInputTargetRole();
    updateFlowUi(activeTab.key, (state) => ({
      ...state,
      composerValue: '',
      awaitingInput: false,
    }));
    sendMessage({
      type: 'human_input',
      flowRef: activeTab.ref,
      text,
      role: targetRole === '__system__' ? undefined : targetRole
    });
  }

  function handleImprovementChoice(mode: 'graph-based' | 'parallel' | 'none'): void {
    if (!activeTab) return;
    sendMessage({ type: 'improvement_choice', flowRef: activeTab.ref, mode });
  }

  function handleStopActiveTurn(): void {
    if (!activeTab || !activeUi || activeUi.stopRequested) return;
    updateFlowUi(activeTab.key, (state) => ({ ...state, stopRequested: true }));
    sendMessage({ type: 'stop_active_turn', flowRef: activeTab.ref, role: viewedRole ?? undefined });
  }

  function handleResumeFlow(): void {
    if (!activeTab) return;
    sendMessage({ type: 'resume_flow', flowRef: activeTab.ref });
  }

  const handleWorkflowLoaded = useCallback((graph: WorkflowGraph) => {
    if (!activeTabKey) return;
    updateFlowUi(activeTabKey, (state) => ({
      ...state,
      workflow: areWorkflowGraphsEqual(state.workflow, graph) ? state.workflow : graph
    }));
  }, [activeTabKey, updateFlowUi]);

  const handleGraphNodeClick = useCallback((_nodeId: string) => {}, []);

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
  const displayedFeed = viewedRole ? (activeUi?.roleFeeds[viewedRole] ?? []) : [];
  const visibleFeed = displayedFeed.length > 0 ? displayedFeed : (activeUi?.roleFeeds.__system__ ?? []);
  const isViewedRoleActive = viewedRole ? activeRoles.includes(viewedRole) : false;
  const viewedRoleAwaitingNodeId = getAwaitingNodeIdForRole(flowRun, viewedRole);
  const isAwaitingImprovementChoice = flowRun?.status === 'awaiting_improvement_choice';
  const visibleWaitLabel = isViewedRoleActive ? activeUi?.waitLabel ?? null : null;
  const inputDisabled = !viewedRoleAwaitingNodeId;
  const canStop =
    !!flowRun &&
    flowRun.status === 'running' &&
    !viewedRoleAwaitingNodeId &&
    socket.status === 'open';
  const canStopViewedRole = canStop && isViewedRoleActive;

  return (
    <main className="app-shell">
      <PanelGroup orientation="horizontal">
        <Panel defaultSize={15} style={{ display: 'flex', flexDirection: 'column', minHeight: 0, borderRight: '1px solid var(--border)' }}>
          <ProjectSelector
            projectsWithADocs={projects.withADocs}
            projectsWithoutADocs={projects.withoutADocs}
            selectedProject={selectedProject}
            selectedFlowId={activeTab?.ref.flowId ?? null}
            projectFlows={projectFlows}
            newProjectName={newProjectName}
            errorMessage={selectorError}
            disabled={socket.status !== 'open'}
            onSelectInitialized={handleProjectSelect}
            onInitializeExisting={handleExistingInitialization}
            onOpenFlow={handleOpenFlow}
            onNewFlow={handleNewFlow}
            onDeleteFlow={handleDeleteFlow}
            onNewProjectNameChange={setNewProjectName}
            onCreateNew={handleCreateNewProject}
          />
        </Panel>

        <PanelResizeHandle className="resize-handle" />

        <Panel defaultSize={85} style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>
          {activeTab && flowRun?.status === 'running' ? (
            <header className="app-header">
              <div className="header-meta">
                <button
                  type="button"
                  className="status-action"
                  disabled={socket.status !== 'open'}
                  onClick={handleResumeFlow}
                >
                  Resume
                </button>
              </div>
            </header>
          ) : null}

          {tabs.length > 0 ? (
            <nav className="flow-tab-strip" aria-label="Open flows">
              {tabs.map((tab) => (
                <div
                  key={tab.key}
                  className="flow-tab"
                  data-active={tab.key === activeTabKey}
                >
                  <button
                    type="button"
                    className="flow-tab-click-area"
                    onClick={() => handleTabSelect(tab)}
                  >
                    <span className="flow-tab-title">{tab.title}</span>
                    <span className="flow-tab-project">{tab.ref.projectNamespace}</span>
                  </button>
                  <button
                    type="button"
                    className="flow-tab-close-btn"
                    title="Close tab"
                    onClick={() => handleCloseTab(tab)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </nav>
          ) : null}

          <div className="workspace-grid-wrapper" style={{ display: 'flex', flex: 1, minHeight: 0 }}>
            <PanelGroup orientation="horizontal">
              <Panel defaultSize={60} style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                {flowRun && activeTab ? (
                  <GraphView
                    flowRun={flowRun}
                    flowRef={activeTab.ref}
                    backwardActive={backwardActive}
                    backwardSources={backwardSources}
                    recordFolderPath={flowRun.recordFolderPath}
                    onNodeClick={handleGraphNodeClick}
                    onWorkflowLoaded={handleWorkflowLoaded}
                  />
                ) : (
                  <section className="panel center-panel graph-panel" style={{ flex: 1 }}>
                    <div className="graph-panel-header">
                      <div>
                        <p className="eyebrow">Workflow Graph</p>
                        <h2>{selectedProject ? selectedProject : 'No project selected'}</h2>
                        <p className="panel-copy">
                          {selectedProject
                            ? 'Select a saved record or create a new flow from the left pane.'
                            : 'Select a project from the left sidebar to load its records and role chat.'}
                        </p>
                      </div>
                    </div>
                    <div className="graph-canvas">
                      <div className="graph-empty">
                        {selectedProject ? 'No flow selected' : 'Select a project to begin'}
                      </div>
                    </div>
                  </section>
                )}
              </Panel>

              <PanelResizeHandle className="resize-handle" />

              <Panel defaultSize={40} style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <ChatInterface
                  subtitle={
                    flowRun
                      ? 'Select a role to view its conversation.'
                      : 'Open or create a flow to start the runtime conversation.'
                  }
                  messages={visibleFeed}
                  waitingLabel={visibleWaitLabel}
                  inputValue={activeUi?.composerValue ?? ''}
                  inputDisabled={inputDisabled}
                  placeholder={!inputDisabled ? 'Reply to the selected role prompt...' : 'Select a role that is awaiting input.'}
                  showComposer={isViewedRoleActive}
                  canStop={canStopViewedRole}
                  stopRequested={activeUi?.stopRequested ?? false}
                  roles={roles}
                  selectedRole={viewedRole ?? undefined}
                  activeRole={activeLiveRole ?? undefined}
                  onRoleSelect={(role) => {
                    if (!activeTabKey) return;
                    updateFlowUi(activeTabKey, (state) => ({ ...state, selectedRole: role }));
                  }}
                  onInputChange={(value) => {
                    if (!activeTabKey) return;
                    updateFlowUi(activeTabKey, (state) => ({ ...state, composerValue: value }));
                  }}
                  onSubmit={handleSubmit}
                  onStop={handleStopActiveTurn}
                />
              </Panel>
            </PanelGroup>
          </div>
        </Panel>
      </PanelGroup>

      {isAwaitingImprovementChoice ? (
        <div className="modal-overlay">
          <div className="modal-panel">
            <p className="eyebrow">Improvement Phase</p>
            <h2>Choose improvement mode</h2>
            <p className="modal-copy">Forward pass is complete. How should the backward pass proceed?</p>
            <div className="modal-choices">
              <button className="modal-choice" onClick={() => handleImprovementChoice('graph-based')}>
                <span className="modal-choice-label">Graph-based</span>
                <span className="modal-choice-desc">Roles run in reverse topological order; each receives findings from their direct forward successors.</span>
              </button>
              <button className="modal-choice" onClick={() => handleImprovementChoice('parallel')}>
                <span className="modal-choice-label">Parallel</span>
                <span className="modal-choice-desc">All roles run simultaneously; no cross-role findings injected.</span>
              </button>
              <button className="modal-choice modal-choice-neutral" onClick={() => handleImprovementChoice('none')}>
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

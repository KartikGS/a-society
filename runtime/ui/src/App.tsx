import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { parseRoleIdentity } from '../../src/common/role-id.js';
import { ChatInterface, type FeedItem } from './components/ChatInterface';
import { GraphView, type GraphMode } from './components/GraphView';
import { ProjectSelector } from './components/ProjectSelector';
import { SettingsModal } from './components/SettingsModal';
import { areFlowRunsEqual, areStringArraysEqual, areWorkflowGraphsEqual } from './equality';
import { useWebSocket } from './hooks/useWebSocket';
import { normalizeSettingsStatus } from './model-config';
import type {
  ClientMessage,
  ConsentMode,
  ConsentRequest,
  ConsentResponseDecision,
  FlowRef,
  FlowRun,
  FlowSummary,
  OperatorEvent,
  ProjectDiscovery,
  ServerMessage,
  SettingsStatus,
  WorkflowGraph,
} from './types';

const EMPTY_STRINGS: string[] = [];
const SETTINGS_REQUIRED_MESSAGE =
  'No active model is configured in Settings. Add and activate a model before starting or continuing runtime work.';

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
  selectedRole: string | null;
  selectedGraph: GraphMode;
  workflow: WorkflowGraph | null;
  composerValue: string;
  waitLabels: Record<string, string | null>;
  stopRequested: boolean;
  consentRequest: ConsentRequest | null;
  latestInputTokensByRole: Record<string, number>;
  hasActiveSession: boolean;
}

function nextFeedId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const SYSTEM_ROLE_KEY = '__system__';

function toRoleKey(role: string | null | undefined): string | null {
  if (!role) return null;
  if (role === SYSTEM_ROLE_KEY) return SYSTEM_ROLE_KEY;
  return parseRoleIdentity(role).instanceRoleId;
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
    selectedRole: null,
    selectedGraph: 'flow',
    workflow: null,
    composerValue: '',
    waitLabels: {},
    stopRequested: false,
    consentRequest: null,
    latestInputTokensByRole: {},
    hasActiveSession: false,
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


function feedbackConsentCopy(flowRun: FlowRun | null): { title: string; body: string; details: string } {
  const artifactPath = flowRun?.improvementPhase?.feedbackArtifactPath ?? 'a-society/feedback/';
  const feedbackContext = flowRun?.feedbackContext;

  if (feedbackContext?.kind === 'initialization') {
    const modeLabel = feedbackContext.initializationMode === 'greenfield' ? 'greenfield' : 'takeover';
    return {
      title: 'Generate initialization feedback?',
      body: `Meta-analysis is complete. If you approve, the feedback agent will spend one more turn writing an upstream report directly to \`${artifactPath}\`.`,
      details: `This ${modeLabel} initialization report should focus on what the runtime inferred, what required human input, and where initialization guidance or scaffolding created friction. Review or redact the file before sharing it upstream in a manual PR.`
    };
  }

  if (feedbackContext?.kind === 'update-application') {
    return {
      title: 'Generate update-flow feedback?',
      body: `Meta-analysis is complete. If you approve, the feedback agent will spend one more turn writing an upstream report directly to \`${artifactPath}\`.`,
      details: 'This update-application report should focus on which update guidance applied, where migration guidance was unclear, and what the framework should improve for future update flows. Review or redact the file before sharing it upstream in a manual PR.'
    };
  }

  return {
    title: 'Generate upstream feedback?',
    body: `Meta-analysis is complete. If you approve, the feedback agent will spend one more turn writing an upstream report directly to \`${artifactPath}\`.`,
    details: 'This report should capture reusable framework gaps, workflow friction, runtime issues, and cross-project patterns surfaced by this flow. Review or redact the file before sharing it upstream in a manual PR.'
  };
}

function formatOperatorEvent(event: OperatorEvent): FeedItem | null {
  switch (event.kind) {
    case 'flow.resumed':
      return null;
    case 'role.active':
      return {
        id: nextFeedId(),
        type: 'activation',
        label: event.activationSource === 'runtime' ? 'Runtime' : 'Node',
        text: `${event.nodeId} (${event.role}) is active with ${event.artifactCount} artifact(s).${event.artifactBasename ? ` Primary artifact: ${event.artifactBasename}.` : ''}`
      };
    case 'activity.tool_call':
      return {
        id: nextFeedId(),
        type: 'tool',
        label: 'Tool Call',
        text: event.command ? `${event.toolName}: ${event.command}` : event.path ? `${event.toolName} ${event.path}` : event.toolName
      };
    case 'handoff.applied':
      return {
        id: nextFeedId(),
        type: 'handoff',
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
    case 'usage.turn_summary':
      return null;
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
    case 'consent.requested':
    case 'consent.resolved':
    case 'consent.mode_changed':
      return null;
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
  const targetKey = toRoleKey(role);
  if (!targetKey) return null;
  const match = Object.entries(flowRun.awaitingHumanNodes)
    .find(([, state]) => toRoleKey(state.role) === targetKey);
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

function hasImprovementGraph(flowRun: FlowRun | null): boolean {
  return flowRun?.improvementPhase?.mode === 'graph-based' || flowRun?.improvementPhase?.mode === 'parallel';
}

export function App() {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const socketUrl = `${protocol}://${window.location.host}`;
  const initialFlowRef = useMemo(() => parseUrlFlowRef(), []);
  const initialUrlFlowRef = useRef<FlowRef | null>(initialFlowRef);
  const openedInitialFlow = useRef(false);
  const lastSubscribedConnectionId = useRef(0);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsStatus, setSettingsStatus] = useState<SettingsStatus | null>(null);
  const [contextWindow, setContextWindow] = useState<number | null>(null);
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

  const fetchSettingsStatus = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/settings/status');
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const status = normalizeSettingsStatus(await response.json());
      if (!status) {
        throw new Error('Invalid settings status response.');
      }
      setSettingsStatus(status);
    } catch {
      setSettingsStatus({ hasConfiguredModel: false, modelCount: 0 });
    }
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
      case 'feed_replay':
        updateFlowUi(key, (state) => ({
          ...state,
          roleFeeds: message.roleFeeds,
          lastHandoff: null,
          waitLabels: {},
          stopRequested: false,
          latestInputTokensByRole: {},
          consentRequest: null,
        }));
        return;
      case 'operator_event': {
        const event = message.event;

        if (event.kind === 'consent.requested') {
          updateFlowUi(key, (state) => ({
            ...state,
            consentRequest: event.request,
          }));
          return;
        }

        if (event.kind === 'consent.resolved') {
          updateFlowUi(key, (state) => ({ ...state, consentRequest: null }));
          return;
        }

        if (event.kind === 'consent.mode_changed') {
          updateFlowUi(key, (state) => ({
            ...state,
            consentRequest: event.mode === 'full-access' ? null : state.consentRequest,
          }));
          return;
        }

        if (event.kind === 'usage.turn_summary') {
          if (event.availability === 'full' || event.availability === 'output-unavailable') {
            updateFlowUi(key, (state) => {
              const role = toRoleKey(event.role) ?? SYSTEM_ROLE_KEY;
              return {
                ...state,
                latestInputTokensByRole: { ...state.latestInputTokensByRole, [role]: event.inputTokens! },
              };
            });
          }
          return;
        }

        if (event.kind === 'role.active') {
          updateFlowUi(key, (state) => {
            const item = formatOperatorEvent(event);
            const roleKey = toRoleKey(event.role);
            return {
              ...state,
              selectedRole: event.activationSource === 'runtime' ? roleKey : state.selectedRole ?? roleKey,
              stopRequested: false,
              roleFeeds: item && roleKey ? appendFeedItem(state.roleFeeds, roleKey, item) : state.roleFeeds,
            };
          });
          setSelectorError(null);
          return;
        }

        if (event.kind === 'human.awaiting_input') {
          updateFlowUi(key, (state) => {
            const item = formatOperatorEvent(event);
            const roleKey = toRoleKey(event.role);
            return {
              ...state,
              selectedRole: state.selectedRole ?? roleKey,
              stopRequested: false,
              roleFeeds: item && roleKey ? appendFeedItem(state.roleFeeds, roleKey, item) : state.roleFeeds,
            };
          });
          return;
        }

        updateFlowUi(key, (state) => {
          const item = formatOperatorEvent(event);
          const feedRole =
            event.kind === 'human.resumed' || event.kind === 'activity.tool_call'
              ? toRoleKey(event.role)
              : event.kind === 'handoff.applied'
                ? toRoleKey(event.fromRole)
                : event.kind === 'repair.requested'
                  ? toRoleKey(event.role ?? null)
                  : null;
          return {
            ...state,
            selectedRole: event.kind === 'repair.requested' && event.role ? state.selectedRole ?? toRoleKey(event.role) : state.selectedRole,
            stopRequested: event.kind === 'flow.completed' || event.kind === 'human.resumed' ? false : state.stopRequested,
            lastHandoff: event.kind === 'handoff.applied' ? event : state.lastHandoff,
            roleFeeds: item && feedRole ? appendFeedItem(state.roleFeeds, feedRole, item) : state.roleFeeds,
          };
        });
        return;
      }
      case 'wait_start': {
        const roleKey = toRoleKey(message.role);
        if (!roleKey) return;
        updateFlowUi(key, (state) => ({
          ...state,
          waitLabels: { ...state.waitLabels, [roleKey]: `Waiting for ${message.model} response.` }
        }));
        return;
      }
      case 'wait_stop': {
        const roleKey = toRoleKey(message.role);
        if (!roleKey) return;
        updateFlowUi(key, (state) => ({
          ...state,
          waitLabels: { ...state.waitLabels, [roleKey]: null }
        }));
        return;
      }
      case 'output_text': {
        const roleKey = toRoleKey(message.role);
        if (!roleKey) return;
        updateFlowUi(key, (state) => ({
          ...state,
          waitLabels: { ...state.waitLabels, [roleKey]: null },
          roleFeeds: appendFeedItem(state.roleFeeds, roleKey, {
            id: nextFeedId(),
            type: 'assistant',
            label: 'Assistant',
            text: message.text
          })
        }));
        return;
      }
      case 'input_text':
        updateFlowUi(key, (state) => ({
          ...state,
          roleFeeds: appendFeedItem(state.roleFeeds, toRoleKey(message.role) ?? SYSTEM_ROLE_KEY, {
            id: nextFeedId(),
            type: 'user',
            label: 'You',
            text: message.text
          })
        }));
        return;
      case 'flow_state':
        ensureTab(message.flowRef, titleForFlow(message.flowRun));
        updateFlowUi(key, (state) => {
          const improvementGraphAvailable = hasImprovementGraph(message.flowRun);
          const wasImprovementGraphAvailable = hasImprovementGraph(state.flowRun);
          return {
            ...state,
            flowRun: areFlowRunsEqual(state.flowRun, message.flowRun) ? state.flowRun : message.flowRun,
            backwardActive: areStringArraysEqual(state.backwardActive, message.backwardActive)
              ? state.backwardActive
              : message.backwardActive,
            selectedGraph: improvementGraphAvailable && !wasImprovementGraphAvailable && message.flowRun.improvementPhase?.status === 'running'
              ? 'improvement'
              : !improvementGraphAvailable && state.selectedGraph === 'improvement'
                ? 'flow'
                : state.selectedGraph,
            stopRequested: message.flowRun.status !== 'running' ? false : state.stopRequested,
            hasActiveSession: message.hasActiveSession,
            latestInputTokensByRole: { ...message.inputTokensByRole, ...state.latestInputTokensByRole },
          };
        });
        void fetchProjectFlows(message.flowRef.projectNamespace);
        return;
      case 'error':
        updateFlowUi(key, (state) => ({
          ...state,
          stopRequested: false,
          roleFeeds: appendFeedItem(state.roleFeeds, SYSTEM_ROLE_KEY, {
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

  const hasConfiguredModel = settingsStatus?.hasConfiguredModel ?? false;
  const settingsReady = settingsStatus !== null;

  const ensureConfiguredModel = useCallback((): boolean => {
    if (hasConfiguredModel) return true;
    setSelectorError(SETTINGS_REQUIRED_MESSAGE);
    setSettingsOpen(true);
    return false;
  }, [hasConfiguredModel]);

  useEffect(() => {
    const ref = initialUrlFlowRef.current;
    if (socket.status !== 'open' || openedInitialFlow.current || !ref) return;
    openedInitialFlow.current = true;
    openFlow(ref);
  }, [socket.status, openFlow]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/settings/status')
      .then(async (res) => {
        if (cancelled || !res.ok) return;
        const status = normalizeSettingsStatus(await res.json());
        if (!cancelled && status) setSettingsStatus(status);
      })
      .catch(() => { if (!cancelled) setSettingsStatus({ hasConfiguredModel: false, modelCount: 0 }); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/settings/active-model/context-window')
      .then(async (res) => {
        if (cancelled || !res.ok) return;
        const data = await res.json() as { contextWindow: number | null };
        if (!cancelled) setContextWindow(data.contextWindow ?? null);
      })
      .catch(() => { });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (settingsReady && !hasConfiguredModel) {
      startTransition(() => setSettingsOpen(true));
      return;
    }
    if (hasConfiguredModel) {
      startTransition(() => setSelectorError((current) => current === SETTINGS_REQUIRED_MESSAGE ? null : current));
    }
  }, [hasConfiguredModel, settingsReady]);

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
  const selectedRole = activeUi?.selectedRole ?? null;
  const selectedGraph = activeUi?.selectedGraph ?? 'flow';
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
    if (flowRun && workflow && getOpenNodeIds(flowRun).length === 1) {
      const activeNode = workflow.nodes.find((node) => node.id === getOpenNodeIds(flowRun)[0]);
      if (activeNode) return toRoleKey(activeNode.role) ?? SYSTEM_ROLE_KEY;
    }
    if (selectedRole) return selectedRole;
    return SYSTEM_ROLE_KEY;
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
    if (!ensureConfiguredModel()) return;
    setSelectedProject(projectNamespace);
    setNewProjectName('');
    setSelectorError(null);
    sendMessage({ type: 'start_takeover_initialization', projectNamespace });
  }

  function handleCreateNewProject(): void {
    const projectName = newProjectName.trim();
    if (!projectName) return;
    if (!ensureConfiguredModel()) return;

    setSelectedProject(projectName);
    setSelectorError(null);
    sendMessage({ type: 'start_greenfield_initialization', projectName });
  }

  function handleOpenFlow(flow: FlowSummary): void {
    openFlow({ projectNamespace: flow.projectNamespace, flowId: flow.flowId }, titleForFlow(flow));
  }

  function handleNewFlow(projectNamespace: string): void {
    if (!ensureConfiguredModel()) return;
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
    if (!ensureConfiguredModel()) return;
    const text = activeUi.composerValue.trim();
    if (!text) return;
    const targetRole = resolveInputTargetRole();
    updateFlowUi(activeTab.key, (state) => ({
      ...state,
      composerValue: '',
    }));
    sendMessage({
      type: 'human_input',
      flowRef: activeTab.ref,
      text,
      role: targetRole === SYSTEM_ROLE_KEY ? undefined : targetRole
    });
  }

  function handleImprovementChoice(mode: 'graph-based' | 'parallel' | 'none'): void {
    if (!activeTab) return;
    if (mode !== 'none' && !ensureConfiguredModel()) return;
    if (mode !== 'none') {
      updateFlowUi(activeTab.key, (state) => ({ ...state, selectedGraph: 'improvement' }));
    }
    sendMessage({ type: 'improvement_choice', flowRef: activeTab.ref, mode });
  }

  function handleFeedbackConsentChoice(decision: 'granted' | 'denied'): void {
    if (!activeTab) return;
    if (decision === 'granted' && !ensureConfiguredModel()) return;
    if (decision === 'granted') {
      updateFlowUi(activeTab.key, (state) => ({ ...state, selectedGraph: 'improvement' }));
    }
    sendMessage({ type: 'feedback_consent_choice', flowRef: activeTab.ref, decision });
  }

  function handleConsentResponse(decision: ConsentResponseDecision): void {
    if (!activeTab) return;
    sendMessage({ type: 'consent_response', flowRef: activeTab.ref, decision });
  }

  function handleConsentModeChange(mode: ConsentMode): void {
    if (!activeTab) return;
    sendMessage({ type: 'consent_mode', flowRef: activeTab.ref, mode });
  }

  function handleStopActiveTurn(): void {
    if (!activeTab || !activeUi || activeUi.stopRequested) return;
    updateFlowUi(activeTab.key, (state) => ({ ...state, stopRequested: true }));
    sendMessage({ type: 'stop_active_turn', flowRef: activeTab.ref, role: viewedRole ?? undefined });
  }

  function handleResumeFlow(): void {
    if (!activeTab) return;
    if (!ensureConfiguredModel()) return;
    sendMessage({ type: 'resume_flow', flowRef: activeTab.ref });
  }

  const handleWorkflowLoaded = useCallback((graph: WorkflowGraph) => {
    if (!activeTabKey) return;
    updateFlowUi(activeTabKey, (state) => ({
      ...state,
      workflow: areWorkflowGraphsEqual(state.workflow, graph) ? state.workflow : graph
    }));
  }, [activeTabKey, updateFlowUi]);

  const handleGraphNodeClick = useCallback((_nodeId: string) => { }, []);

  const handleGraphModeChange = useCallback((mode: GraphMode) => {
    if (!activeTabKey) return;
    updateFlowUi(activeTabKey, (state) => ({ ...state, selectedGraph: mode }));
  }, [activeTabKey, updateFlowUi]);

  const activeNodeIds = flowRun ? getOpenNodeIds(flowRun) : undefined;
  const improvementGraphAvailable = hasImprovementGraph(flowRun);
  const graphMode = selectedGraph === 'improvement' && improvementGraphAvailable ? 'improvement' : 'flow';
  const lastHandoffFromNodeId = lastHandoff?.fromNodeId;
  const backwardSources = useMemo(() => (
    activeNodeIds && lastHandoffFromNodeId && activeNodeIds.includes(lastHandoffFromNodeId)
      ? [lastHandoffFromNodeId]
      : EMPTY_STRINGS
  ), [activeNodeIds, lastHandoffFromNodeId]);

  const roles = useMemo(() => {
    const roleSet = new Set<string>();
    if (workflow) {
      for (const node of workflow.nodes) {
        const key = toRoleKey(node.role);
        if (key && key !== SYSTEM_ROLE_KEY) roleSet.add(key);
      }
    }
    for (const role of Object.keys(activeUi?.roleFeeds ?? {})) {
      if (role !== SYSTEM_ROLE_KEY) roleSet.add(role);
    }
    return roleSet.size > 0 ? [...roleSet] : EMPTY_STRINGS;
  }, [activeUi?.roleFeeds, workflow]);

  const activeRoles = useMemo(() => {
    if (!flowRun || !workflow) return EMPTY_STRINGS;

    return [...new Set(
      getOpenNodeIds(flowRun)
        .map((nodeId) => workflow.nodes.find((node) => node.id === nodeId)?.role)
        .map((role) => (role ? toRoleKey(role) : null))
        .filter((role): role is string => role !== null)
    )];
  }, [flowRun, workflow]);

  const viewedRole = selectedRole ?? activeRoles[0] ?? null;
  const displayedFeed = viewedRole ? (activeUi?.roleFeeds[viewedRole] ?? []) : [];
  const visibleFeed = displayedFeed.length > 0 ? displayedFeed : (activeUi?.roleFeeds[SYSTEM_ROLE_KEY] ?? []);
  const isViewedRoleActive = viewedRole ? activeRoles.includes(viewedRole) : false;
  const viewedRoleAwaitingNodeId = getAwaitingNodeIdForRole(flowRun, viewedRole);
  const isAwaitingImprovementChoice = flowRun?.status === 'awaiting_improvement_choice';
  const isAwaitingFeedbackConsent = flowRun?.status === 'awaiting_feedback_consent';
  const feedbackPrompt = feedbackConsentCopy(flowRun);
  const visibleWaitLabel = isViewedRoleActive && viewedRole ? (activeUi?.waitLabels[viewedRole] ?? null) : null;
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
            canStartFlows={socket.status === 'open' && hasConfiguredModel}
            settingsReady={settingsReady}
            settingsConfigured={hasConfiguredModel}
            onSelectInitialized={handleProjectSelect}
            onInitializeExisting={handleExistingInitialization}
            onOpenFlow={handleOpenFlow}
            onNewFlow={handleNewFlow}
            onDeleteFlow={handleDeleteFlow}
            onNewProjectNameChange={setNewProjectName}
            onCreateNew={handleCreateNewProject}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        </Panel>

        <PanelResizeHandle className="resize-handle" />

        <Panel defaultSize={85} style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>

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
                    graphMode={graphMode}
                    improvementAvailable={improvementGraphAvailable}
                    backwardActive={backwardActive}
                    backwardSources={backwardSources}
                    recordFolderPath={flowRun.recordFolderPath}
                    showResume={flowRun.status === 'running' && !(activeUi?.hasActiveSession ?? true)}
                    onResume={handleResumeFlow}
                    onNodeClick={handleGraphNodeClick}
                    onGraphModeChange={handleGraphModeChange}
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
                  showComposer={true}
                  canStop={canStopViewedRole}
                  stopRequested={activeUi?.stopRequested ?? false}
                  roles={roles}
                  selectedRole={viewedRole ?? undefined}
                  activeRoles={activeRoles}
                  consentRequest={activeUi?.consentRequest ?? null}
                  consentMode={flowRun?.consentState?.mode ?? 'no-access'}
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
                  onConsentResponse={handleConsentResponse}
                  onConsentModeChange={handleConsentModeChange}
                  contextWindow={contextWindow}
                  latestInputTokens={viewedRole ? (activeUi?.latestInputTokensByRole[viewedRole] ?? null) : null}
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
            {flowRun?.improvementPhase?.singleRole ? (
              <>
                <h2>Run improvement?</h2>
                <p className="modal-copy">Forward pass is complete. Do you want to run the backward pass?</p>
                <div className="modal-choices">
                  <button className="modal-choice" onClick={() => handleImprovementChoice('parallel')}>
                    <span className="modal-choice-label">Yes</span>
                    <span className="modal-choice-desc">Run the backward pass for this role.</span>
                  </button>
                  <button className="modal-choice modal-choice-neutral" onClick={() => handleImprovementChoice('none')}>
                    <span className="modal-choice-label">No</span>
                    <span className="modal-choice-desc">Close the record now without a backward pass.</span>
                  </button>
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      ) : null}

      {isAwaitingFeedbackConsent ? (
        <div className="modal-overlay">
          <div className="modal-panel">
            <p className="eyebrow">Feedback Step</p>
            <h2>{feedbackPrompt.title}</h2>
            <p className="modal-copy">{feedbackPrompt.body}</p>
            <p className="modal-copy">{feedbackPrompt.details}</p>
            <div className="modal-choices">
              <button className="modal-choice" onClick={() => handleFeedbackConsentChoice('granted')}>
                <span className="modal-choice-label">Generate feedback</span>
                <span className="modal-choice-desc">Run the feedback agent, create the report in `a-society/feedback/`, and leave it ready for review or manual PR sharing.</span>
              </button>
              <button className="modal-choice modal-choice-neutral" onClick={() => handleFeedbackConsentChoice('denied')}>
                <span className="modal-choice-label">Skip feedback</span>
                <span className="modal-choice-desc">Close the flow now without spending another turn or creating an upstream feedback file.</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {settingsOpen && (
        <SettingsModal
          required={!hasConfiguredModel}
          onClose={() => setSettingsOpen(false)}
          onModelsChange={() => { void fetchSettingsStatus(); }}
        />
      )}
    </main>
  );
}

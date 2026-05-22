import { lazy, startTransition, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { flowKey } from '../../src/common/flow-ref.js';
import { getActiveNodeIds } from '../../src/common/flow-state.js';
import {
  DEFAULT_SELECTED_ROLE_KEY,
  EMPTY_STRINGS,
  SETTINGS_REQUIRED_MESSAGE,
  SYSTEM_ROLE_KEY,
} from './app/constants';
import { feedbackConsentCopy } from './app/feedback-copy';
import {
  collectSelectableRoles,
  createFlowUiState,
  getAwaitingNodeIdForRole,
  hasImprovementGraph,
  titleForFlow,
  type FlowTab,
  type FlowUiState,
} from './app/flow-ui';
import { parseUrlFlowRef, writeUrlFlowRef } from './app/routing';
import { toRoleKey } from './app/roles';
import {
  deleteFlow as deleteFlowApi,
  fetchActiveModelContextWindow,
  fetchFlowState,
  fetchProjectFlows as fetchProjectFlowsApi,
  fetchSettingsStatus as fetchSettingsStatusApi,
  IncompatibleFlowError,
} from './app/runtime-api';
import { handleServerMessage } from './app/server-messages';
import { ChatInterface } from './components/ChatInterface';
import { EmptyGraphPanel } from './components/EmptyGraphPanel';
import { FeedbackConsentModal } from './components/FeedbackConsentModal';
import { FlowTabs } from './components/FlowTabs';
import type { GraphMode } from './components/GraphView';
import { ImprovementChoiceModal } from './components/ImprovementChoiceModal';
import { ProjectSelector } from './components/ProjectSelector';
import { SettingsModal } from './components/SettingsModal';
import { areFlowRunsEqual, areWorkflowGraphsEqual } from './equality';
import { useWebSocket } from './hooks/useWebSocket';
import type {
  ClientMessage,
  ConsentMode,
  ConsentResponseDecision,
  FlowRef,
  FlowSummary,
  ProjectDiscovery,
  ServerMessage,
  SettingsStatus,
  WorkflowGraph,
} from './types';

const GraphView = lazy(async () => {
  const module = await import('./components/GraphView');
  return { default: module.GraphView };
});

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
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string): void => {
    if (toastTimerRef.current !== null) clearTimeout(toastTimerRef.current);
    setErrorToast(message);
    toastTimerRef.current = setTimeout(() => setErrorToast(null), 5000);
  }, []);

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

  const refreshSettingsStatus = useCallback(async (): Promise<void> => {
    try {
      setSettingsStatus(await fetchSettingsStatusApi());
    } catch {
      setSettingsStatus({ hasConfiguredModel: false, modelCount: 0 });
    }
  }, []);

  const setProjectFlows = useCallback((projectNamespace: string, flows: FlowSummary[]): void => {
    setProjectFlowsByProject((current) => ({ ...current, [projectNamespace]: flows }));
  }, []);

  const refreshProjectFlows = useCallback(async (projectNamespace: string): Promise<void> => {
    try {
      setProjectFlows(projectNamespace, await fetchProjectFlowsApi(projectNamespace));
    } catch {
      setProjectFlowsByProject((current) => ({ ...current, [projectNamespace]: current[projectNamespace] ?? [] }));
    }
  }, [setProjectFlows]);

  const handleIncomingMessage = useCallback((message: ServerMessage): void => {
    handleServerMessage(message, {
      updateFlowUi,
      ensureTab,
      setProjects,
      setProjectFlows,
      setNewProjectName,
      setSelectorError,
      refreshProjectFlows: (projectNamespace) => {
        void refreshProjectFlows(projectNamespace);
      },
      showToast,
    });
  }, [ensureTab, refreshProjectFlows, setProjectFlows, showToast, updateFlowUi]);

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
    fetchSettingsStatusApi()
      .then((status) => {
        if (!cancelled) setSettingsStatus(status);
      })
      .catch(() => { if (!cancelled) setSettingsStatus({ hasConfiguredModel: false, modelCount: 0 }); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchActiveModelContextWindow()
      .then((modelContextWindow) => {
        if (!cancelled) setContextWindow(modelContextWindow);
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
        const flows = await fetchProjectFlowsApi(selectedProject);
        if (!cancelled) setProjectFlows(selectedProject, flows);
      } catch {
        if (!cancelled) setProjectFlowsByProject((current) => ({ ...current, [selectedProject]: current[selectedProject] ?? [] }));
      }
    })();
    return () => { cancelled = true; };
  }, [selectedProject, setProjectFlows]);

  const activeUi = activeTabKey ? flowUiByKey[activeTabKey] ?? null : null;
  const flowRun = activeUi?.flowRun ?? null;
  const workflow = activeUi?.workflow ?? null;
  const selectedRole = activeUi?.selectedRole ?? DEFAULT_SELECTED_ROLE_KEY;
  const selectedGraph = activeUi?.selectedGraph ?? 'flow';
  const lastHandoff = activeUi?.lastHandoff ?? null;
  const backwardActive = activeUi?.backwardActive ?? EMPTY_STRINGS;
  const projectFlows = selectedProject ? projectFlowsByProject[selectedProject] ?? [] : [];
  const hasActiveFlowState = flowRun !== null;

  useEffect(() => {
    if (socket.status !== 'open' || !activeTab || !hasActiveFlowState) {
      return;
    }

    let cancelled = false;

    const syncFlowState = async () => {
      try {
        const nextFlowRun = await fetchFlowState(activeTab.ref);
        if (cancelled || !nextFlowRun) return;

        updateFlowUi(activeTab.key, (state) => ({
          ...state,
          flowRun: areFlowRunsEqual(state.flowRun, nextFlowRun) ? state.flowRun : nextFlowRun,
        }));
      } catch (err) {
        if (!cancelled && err instanceof IncompatibleFlowError) {
          updateFlowUi(activeTab.key, (state) => ({ ...state, flowRun: null }));
          showToast(err.message);
          return;
        }
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
  }, [socket.status, activeTab, hasActiveFlowState, updateFlowUi, showToast]);

  function resolveInputTargetRole(): string {
    if (flowRun && selectedRole && getAwaitingNodeIdForRole(flowRun, selectedRole)) {
      return selectedRole;
    }
    if (flowRun && workflow && getActiveNodeIds(flowRun).length === 1) {
      const activeNode = workflow.nodes.find((node) => node.id === getActiveNodeIds(flowRun)[0]);
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
      void refreshProjectFlows(projectNamespace);
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
      await deleteFlowApi(flow);

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

      void refreshProjectFlows(flow.projectNamespace);
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
    if (!activeTab || !visibleConsentRequest) return;
    const role = visibleConsentRequest.role;
    sendMessage({ type: 'consent_response', flowRef: activeTab.ref, decision, role });
  }

  function handleConsentModeChange(mode: ConsentMode): void {
    if (!activeTab) return;
    sendMessage({ type: 'consent_mode', flowRef: activeTab.ref, mode });
  }

  function handleStopActiveTurn(): void {
    if (!activeTab || !activeUi || !viewedRole || activeUi.stopRequestedRoles[viewedRole]) return;
    updateFlowUi(activeTab.key, (state) => ({
      ...state,
      stopRequestedRoles: { ...state.stopRequestedRoles, [viewedRole]: true },
    }));
    sendMessage({ type: 'stop_active_turn', flowRef: activeTab.ref, role: viewedRole });
  }

  function handleCompactContext(): void {
    if (!activeTab || !viewedRole) return;
    if (!ensureConfiguredModel()) return;
    if (activeUi?.compactingRoles[viewedRole]) return;
    updateFlowUi(activeTab.key, (state) => ({
      ...state,
      compactingRoles: { ...state.compactingRoles, [viewedRole]: true },
    }));
    sendMessage({ type: 'compact_context', flowRef: activeTab.ref, role: viewedRole });
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

  const activeNodeIds = flowRun ? getActiveNodeIds(flowRun) : undefined;
  const improvementGraphAvailable = hasImprovementGraph(flowRun);
  const graphMode = selectedGraph === 'improvement' && improvementGraphAvailable ? 'improvement' : 'flow';
  const lastHandoffFromNodeId = lastHandoff?.fromNodeId;
  const backwardSources = useMemo(() => (
    activeNodeIds && lastHandoffFromNodeId && activeNodeIds.includes(lastHandoffFromNodeId)
      ? [lastHandoffFromNodeId]
      : EMPTY_STRINGS
  ), [activeNodeIds, lastHandoffFromNodeId]);

  const roles = useMemo(() => {
    const roleList = collectSelectableRoles(activeUi?.roleFeeds ?? {}, workflow);
    return roleList.length > 0 ? roleList : EMPTY_STRINGS;
  }, [activeUi?.roleFeeds, workflow]);

  const activeRoles = useMemo(() => {
    if (!flowRun || !workflow) return EMPTY_STRINGS;

    return [...new Set(
      getActiveNodeIds(flowRun)
        .map((nodeId) => workflow.nodes.find((node) => node.id === nodeId)?.role)
        .map((role) => (role ? toRoleKey(role) : null))
        .filter((role): role is string => role !== null)
    )];
  }, [flowRun, workflow]);

  const viewedRole = selectedRole;
  const displayedFeed = viewedRole ? (activeUi?.roleFeeds[viewedRole] ?? []) : [];
  const visibleFeed = displayedFeed.length > 0 ? displayedFeed : (activeUi?.roleFeeds[SYSTEM_ROLE_KEY] ?? []);
  const visibleConsentRequest =
    viewedRole
      ? activeUi?.consentRequests[viewedRole] ?? null
      : null;
  const isViewedRoleActive = viewedRole ? activeRoles.includes(viewedRole) : false;
  const viewedRoleAwaitingNodeId = getAwaitingNodeIdForRole(flowRun, viewedRole);
  const isAwaitingImprovementChoice = flowRun?.status === 'awaiting_improvement_choice';
  const isAwaitingFeedbackConsent = flowRun?.status === 'awaiting_feedback_consent';
  const feedbackPrompt = feedbackConsentCopy(flowRun);
  const isViewedRoleCompacting = viewedRole ? Boolean(activeUi?.compactingRoles[viewedRole]) : false;
  const visibleWaitLabel = isViewedRoleCompacting
    ? 'Compacting...'
    : isViewedRoleActive && viewedRole
      ? (activeUi?.waitLabels[viewedRole] ?? null)
      : null;
  const hasActiveSession = activeUi?.hasActiveSession ?? false;
  const inputDisabled = isViewedRoleCompacting || !hasActiveSession || !viewedRoleAwaitingNodeId;
  const inputPlaceholder = !hasActiveSession
    ? 'Resume the flow to reply.'
    : isViewedRoleCompacting
      ? 'Compacting context...'
    : !inputDisabled
      ? 'Reply to the selected role.'
      : 'Select a role that is awaiting input.';
  const canStop =
    !!flowRun &&
    hasActiveSession &&
    !viewedRoleAwaitingNodeId &&
    socket.status === 'open';
  const viewedRoleWaitLabel = viewedRole ? (activeUi?.waitLabels[viewedRole] ?? null) : null;
  const canStopViewedRole = canStop && (!!viewedRoleWaitLabel || isViewedRoleActive);
  const stopRequestedForViewedRole = viewedRole ? Boolean(activeUi?.stopRequestedRoles[viewedRole]) : false;

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

          <FlowTabs
            tabs={tabs}
            activeTabKey={activeTabKey}
            onSelect={handleTabSelect}
            onClose={handleCloseTab}
          />

          <div className="workspace-grid-wrapper" style={{ display: 'flex', flex: 1, minHeight: 0 }}>
            <PanelGroup orientation="horizontal">
              <Panel defaultSize={60} style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                {flowRun && activeTab ? (
                  <Suspense fallback={<section className="panel center-panel graph-panel" style={{ flex: 1 }}><div className="graph-empty">Loading graph...</div></section>}>
                    <GraphView
                      flowRun={flowRun}
                      flowRef={activeTab.ref}
                      graphMode={graphMode}
                      improvementAvailable={improvementGraphAvailable}
                      backwardActive={backwardActive}
                      backwardSources={backwardSources}
                      recordFolderPath={flowRun.recordFolderPath}
                      showResume={flowRun.status === 'running' && !hasActiveSession}
                      onResume={handleResumeFlow}
                      onNodeClick={handleGraphNodeClick}
                      onGraphModeChange={handleGraphModeChange}
                      onWorkflowLoaded={handleWorkflowLoaded}
                    />
                  </Suspense>
                ) : <EmptyGraphPanel selectedProject={selectedProject} />}
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
                  placeholder={inputPlaceholder}
                  showComposer={true}
                  canStop={canStopViewedRole}
                  stopRequested={stopRequestedForViewedRole}
                  roles={roles}
                  selectedRole={viewedRole ?? undefined}
                  activeRoles={activeRoles}
                  consentRequest={visibleConsentRequest}
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
                  onCompactContext={viewedRole ? handleCompactContext : undefined}
                  contextWindow={contextWindow}
                  latestContextUsage={viewedRole ? (activeUi?.latestContextUsageByRole[viewedRole] ?? null) : null}
                  isCompactingContext={isViewedRoleCompacting}
                />
              </Panel>
            </PanelGroup>
          </div>
        </Panel>
      </PanelGroup>

      {isAwaitingImprovementChoice ? (
        <ImprovementChoiceModal
          flowRun={flowRun}
          onChoice={handleImprovementChoice}
        />
      ) : null}

      {isAwaitingFeedbackConsent ? (
        <FeedbackConsentModal
          title={feedbackPrompt.title}
          body={feedbackPrompt.body}
          details={feedbackPrompt.details}
          onChoice={handleFeedbackConsentChoice}
        />
      ) : null}

      {errorToast && (
        <div className="error-toast" role="alert">
          <span className="error-toast-message">{errorToast}</span>
          <button className="error-toast-dismiss" onClick={() => setErrorToast(null)}>×</button>
        </div>
      )}

      {settingsOpen && (
        <SettingsModal
          required={!hasConfiguredModel}
          onClose={() => setSettingsOpen(false)}
          onModelsChange={() => { void refreshSettingsStatus(); }}
        />
      )}
    </main>
  );
}

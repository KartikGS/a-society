import { PanelLeft, X } from 'lucide-react';
import { lazy, startTransition, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
  useDefaultLayout,
} from 'react-resizable-panels';
import { flowKey } from '../../shared/flow-ref.js';
import { CLIENT_MESSAGE_TYPE, CONSENT_MODE } from '../../shared/protocol-constants.js';
import { createActiveFlowView } from './app/active-flow-view';
import { SETTINGS_REQUIRED_MESSAGE } from './app/constants';
import {
  createFlowUiState,
  type FlowTab,
  type FlowUiState,
} from './app/flow-ui';
import { parseUrlFlowRef, writeUrlFlowRef } from './app/routing';
import {
  fetchActiveModelContextWindow,
  fetchFlowState,
  fetchMcpServers as fetchMcpServersApi,
  fetchModels as fetchModelsApi,
  fetchProjectFlows as fetchProjectFlowsApi,
  fetchProjects as fetchProjectsApi,
  fetchSettingsStatus as fetchSettingsStatusApi,
  fetchSkills as fetchSkillsApi,
  IncompatibleFlowError,
} from './app/runtime-api';
import { handleServerMessage } from './app/server-messages';
import { useAppCommands } from './app/use-app-commands';
import { ChatInterface } from './components/ChatInterface';
import { EmptyGraphPanel } from './components/EmptyGraphPanel';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FeedbackConsentModal } from './components/FeedbackConsentModal';
import { FlowTabs } from './components/FlowTabs';
import { ImprovementChoiceModal } from './components/ImprovementChoiceModal';
import { ProjectSelector } from './components/ProjectSelector';
import { ProjectSettingsModal } from './components/ProjectSettingsModal';
import { SettingsModal } from './components/SettingsModal';
import { areFlowRunsEqual } from './equality';
import { useConfirm } from './hooks/useConfirm';
import { useViewport } from './hooks/useViewport';
import { useWebSocket } from './hooks/useWebSocket';
import type { ClientMessage, ServerMessage } from '../../shared/operator-protocol.js';
import type { FlowRef, FlowSummary } from '../../shared/types.js';
import type { McpServerSummary, ModelConfig, SettingsStatus } from '../../shared/settings.js';
import type { ProjectDiscovery, ProjectSummary } from '../../shared/projects.js';
import type { SkillSummary } from '../../shared/skills.js';

const GraphView = lazy(async () => {
  const module = await import('./components/GraphView');
  return { default: module.GraphView };
});

const ERROR_TOAST_DURATION_MS = 12_000;
const SUCCESS_TOAST_DURATION_MS = 4_000;
const MAX_VISIBLE_TOASTS = 4;

type ToastTone = 'error' | 'success';

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

export function App() {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const socketUrl = `${protocol}://${window.location.host}`;
  const initialFlowRef = useMemo(() => parseUrlFlowRef(), []);
  const initialUrlFlowRef = useRef<FlowRef | null>(initialFlowRef);
  const openedInitialFlow = useRef(false);
  const lastSubscribedConnectionId = useRef(0);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [projectSettingsTarget, setProjectSettingsTarget] = useState<ProjectSummary | null>(null);
  const [settingsStatus, setSettingsStatus] = useState<SettingsStatus | null>(null);
  const [contextWindow, setContextWindow] = useState<number | null>(null);
  const [configuredModels, setConfiguredModels] = useState<ModelConfig[]>([]);
  const [configuredSkills, setConfiguredSkills] = useState<SkillSummary[]>([]);
  const [configuredMcpServers, setConfiguredMcpServers] = useState<McpServerSummary[]>([]);
  const [projects, setProjects] = useState<ProjectDiscovery>({ withADocs: [], withoutADocs: [] });
  const [selectedProject, setSelectedProject] = useState<string | null>(initialFlowRef?.projectNamespace ?? null);
  const [projectFlowsByProject, setProjectFlowsByProject] = useState<Record<string, FlowSummary[]>>({});
  const [newProjectName, setNewProjectName] = useState('');
  const [selectorError, setSelectorError] = useState<string | null>(null);
  const [tabs, setTabs] = useState<FlowTab[]>([]);
  const [activeTabKey, setActiveTabKey] = useState<string | null>(initialFlowRef ? flowKey(initialFlowRef) : null);
  const [flowUiByKey, setFlowUiByKey] = useState<Record<string, FlowUiState>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toastIdRef = useRef(0);

  const viewport = useViewport();
  const { confirm, confirmElement } = useConfirm();

  const dismissToast = useCallback((id: number): void => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((message: string, tone: ToastTone = 'error'): void => {
    const id = ++toastIdRef.current;
    setToasts((current) => [...current.slice(-(MAX_VISIBLE_TOASTS - 1)), { id, message, tone }]);
    window.setTimeout(
      () => dismissToast(id),
      tone === 'error' ? ERROR_TOAST_DURATION_MS : SUCCESS_TOAST_DURATION_MS,
    );
  }, [dismissToast]);

  const showToast = useCallback((message: string): void => {
    notify(message, 'error');
  }, [notify]);

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

  const refreshConfiguredModels = useCallback(async (): Promise<void> => {
    try {
      setConfiguredModels(await fetchModelsApi());
    } catch {
      // Keep the last known model list; the selection card re-renders on the next refresh.
    }
  }, []);

  const refreshConfiguredSkills = useCallback(async (): Promise<void> => {
    try {
      const results = await fetchSkillsApi();
      setConfiguredSkills(results
        .filter((result): result is Extract<typeof result, { kind: 'ok' }> => result.kind === 'ok')
        .map((result) => result.skill));
    } catch {
      // Keep the last known skill list; role configuration validates on submit.
    }
  }, []);

  const refreshConfiguredMcpServers = useCallback(async (): Promise<void> => {
    try {
      setConfiguredMcpServers(await fetchMcpServersApi());
    } catch {
      // Keep the last known MCP server list; role configuration validates on submit.
    }
  }, []);

  const handleModelsChange = useCallback((): void => {
    void refreshSettingsStatus();
    void refreshConfiguredModels();
  }, [refreshConfiguredModels, refreshSettingsStatus]);

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

  const refreshProjects = useCallback(async (): Promise<void> => {
    try {
      setProjects(await fetchProjectsApi());
    } catch (err) {
      setSelectorError(err instanceof Error ? err.message : 'Failed to load projects.');
    }
  }, []);

  const handleIncomingMessage = useCallback((message: ServerMessage): void => {
    handleServerMessage(message, {
      updateFlowUi,
      ensureTab,
      setProjectFlows,
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

  const activeView = useMemo(() => createActiveFlowView({
    tabs,
    activeTabKey,
    flowUiByKey,
    selectedProject,
    projectFlowsByProject,
    socketOpen: socket.status === 'open',
  }), [activeTabKey, flowUiByKey, projectFlowsByProject, selectedProject, socket.status, tabs]);

  const {
    activeTab,
    flowRun,
    backwardActive,
    projectFlows,
    hasActiveFlowState,
    graphMode,
    improvementGraphAvailable,
    backwardSources,
    roles,
    activeRoles,
    viewedRole,
    visibleFeed,
    visibleConsentRequest,
    roleConfigurationNodeId,
    roleConfigurationPending,
    handoffApprovalNodeId,
    handoffApprovalTargets,
    isAwaitingImprovementChoice,
    isAwaitingFeedbackConsent,
    feedbackPrompt,
    visibleWaitLabel,
    hasActiveSession,
    inputDisabled,
    inputPlaceholder,
    canStopViewedRole,
    stopRequestedForViewedRole,
    isViewedRoleCompacting,
    composerValue,
    latestContextUsage,
    viewedRoleContextWindow,
    projectSettingsEnabled,
  } = activeView;

  const hasConfiguredModel = settingsStatus?.hasConfiguredModel ?? false;
  const settingsReady = settingsStatus !== null;

  const ensureConfiguredModel = useCallback((): boolean => {
    if (hasConfiguredModel) return true;
    setSelectorError(SETTINGS_REQUIRED_MESSAGE);
    setSettingsOpen(true);
    return false;
  }, [hasConfiguredModel]);

  const appCommandInput = useMemo(() => ({
    activeView,
    activeTabKey,
    selectedProject,
    newProjectName,
    confirm,
    ensureConfiguredModel,
    ensureTab,
    refreshProjects,
    refreshProjectFlows,
    sendMessage,
    updateFlowUi,
    setSelectedProject,
    setProjects,
    setProjectFlowsByProject,
    setNewProjectName,
    setSelectorError,
    setActiveTabKey,
    setTabs,
    setFlowUiByKey,
  }), [
    activeTabKey,
    activeView,
    confirm,
    ensureConfiguredModel,
    ensureTab,
    newProjectName,
    refreshProjects,
    refreshProjectFlows,
    selectedProject,
    sendMessage,
    updateFlowUi,
  ]);

  const {
    openFlow,
    handleProjectSelect,
    handleExistingInitialization,
    handleCreateNewProject,
    handleOpenFlow,
    handleNewFlow,
    handleDeleteFlow,
    handleDeleteProject,
    handleUpdateProject,
    handleTabSelect,
    handleCloseTab,
    handleSubmit,
    handleImprovementChoice,
    handleFeedbackConsentChoice,
    handleConsentResponse,
    handleRoleConfigure,
    handleHandoffApproval,
    handleConsentModeChange,
    handleStopActiveTurn,
    handleCompactContext,
    handleResumeFlow,
    handleWorkflowLoaded,
    handleGraphNodeClick,
    handleGraphModeChange,
    handleRoleSelect,
    handleComposerChange,
  } = useAppCommands(appCommandInput);

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
    fetchProjectsApi()
      .then((nextProjects) => {
        if (!cancelled) setProjects(nextProjects);
      })
      .catch((err) => {
        if (!cancelled) setSelectorError(err instanceof Error ? err.message : 'Failed to load projects.');
      });
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
    let cancelled = false;
    fetchModelsApi()
      .then((models) => {
        if (!cancelled) setConfiguredModels(models);
      })
      .catch(() => { });
    return () => { cancelled = true; };
  }, [roleConfigurationNodeId]);

  useEffect(() => {
    let cancelled = false;
    fetchSkillsApi()
      .then((results) => {
        if (cancelled) return;
        setConfiguredSkills(results
          .filter((result): result is Extract<typeof result, { kind: 'ok' }> => result.kind === 'ok')
          .map((result) => result.skill));
      })
      .catch(() => { });
    return () => { cancelled = true; };
  }, [roleConfigurationNodeId]);

  useEffect(() => {
    let cancelled = false;
    fetchMcpServersApi()
      .then((servers) => {
        if (!cancelled) setConfiguredMcpServers(servers);
      })
      .catch(() => { });
    return () => { cancelled = true; };
  }, [roleConfigurationNodeId]);

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
    sendMessage({ type: CLIENT_MESSAGE_TYPE.OPEN_FLOW, flowRef: activeTab.ref });
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

  const [prevViewport, setPrevViewport] = useState(viewport);
  if (prevViewport !== viewport) {
    setPrevViewport(viewport);
    if (viewport !== 'narrow' && drawerOpen) setDrawerOpen(false);
  }

  const sidebarVisible = viewport !== 'narrow';
  const showToolbar = tabs.length > 0 || !sidebarVisible;

  const mainLayout = useDefaultLayout({
    id: 'a-society-layout-main',
    storage: window.localStorage,
    panelIds: sidebarVisible ? ['sidebar', 'workspace'] : ['workspace'],
  });
  const centerLayout = useDefaultLayout({
    id: 'a-society-layout-center',
    storage: window.localStorage,
    panelIds: ['graph', 'chat'],
  });

  const sidebarContent = (
    <ErrorBoundary label="project sidebar">
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
        onDeleteFlow={(flowRef) => { void handleDeleteFlow(flowRef); }}
        onDeleteProject={(projectNamespace) => { void handleDeleteProject(projectNamespace); }}
        onUpdateProject={handleUpdateProject}
        onOpenProjectSettings={setProjectSettingsTarget}
        onNewProjectNameChange={setNewProjectName}
        onCreateNew={handleCreateNewProject}
        onOpenSettings={() => setSettingsOpen(true)}
      />
    </ErrorBoundary>
  );

  return (
    <main className="app-shell">
      {socket.status !== 'open' ? (
        <div className="connection-pill" role="status">
          <span className="connection-pill-dot" aria-hidden="true" />
          Reconnecting to runtime…
        </div>
      ) : null}

      <PanelGroup
        orientation="horizontal"
        defaultLayout={mainLayout.defaultLayout}
        onLayoutChanged={mainLayout.onLayoutChanged}
      >
        {sidebarVisible ? (
          <>
            <Panel id="sidebar" className="workspace-pane workspace-sidebar-pane" defaultSize="18%" minSize={220}>
              {sidebarContent}
            </Panel>
            <PanelResizeHandle className="resize-handle" />
          </>
        ) : null}

        <Panel id="workspace" className="workspace-pane" defaultSize="82%">
          {showToolbar ? (
            <div className="workspace-toolbar">
              {!sidebarVisible ? (
                <button
                  type="button"
                  className="drawer-toggle-btn"
                  aria-label="Open project sidebar"
                  onClick={() => setDrawerOpen(true)}
                >
                  <PanelLeft aria-hidden="true" />
                </button>
              ) : null}
              <FlowTabs
                tabs={tabs}
                activeTabKey={activeTabKey}
                onSelect={handleTabSelect}
                onClose={handleCloseTab}
              />
            </div>
          ) : null}

          <div className="workspace-grid-wrapper">
            <PanelGroup
              orientation={viewport === 'wide' ? 'horizontal' : 'vertical'}
              defaultLayout={centerLayout.defaultLayout}
              onLayoutChanged={centerLayout.onLayoutChanged}
            >
              <Panel id="graph" className="workspace-pane" defaultSize="60%" minSize={200}>
                <ErrorBoundary label="workflow graph">
                  {flowRun && activeTab ? (
                    <Suspense fallback={<section className="panel graph-panel"><div className="graph-empty">Loading graph...</div></section>}>
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
                </ErrorBoundary>
              </Panel>

              <PanelResizeHandle className="resize-handle" />

              <Panel id="chat" className="workspace-pane" defaultSize="40%" minSize={200}>
                <ErrorBoundary label="role chat">
                  <ChatInterface
                    subtitle={
                      flowRun
                        ? 'Select a role to view its conversation.'
                        : 'Open or create a flow to start the runtime conversation.'
                    }
                    messages={visibleFeed}
                    waitingLabel={visibleWaitLabel}
                    inputValue={composerValue}
                    inputDisabled={inputDisabled}
                    placeholder={inputPlaceholder}
                    showComposer={true}
                    canStop={canStopViewedRole}
                    stopRequested={stopRequestedForViewedRole}
                    roles={roles}
                    selectedRole={viewedRole ?? undefined}
                    activeRoles={activeRoles}
                    consentRequest={visibleConsentRequest}
                    consentMode={flowRun?.consentState?.mode ?? CONSENT_MODE.NO_ACCESS}
                    projectSettingsEnabled={projectSettingsEnabled}
                    roleConfiguration={roleConfigurationNodeId ? {
                      nodeId: roleConfigurationNodeId,
                      models: configuredModels,
                      skills: configuredSkills,
                      mcpServers: configuredMcpServers,
                      pendingModel: roleConfigurationPending?.pendingModel ?? true,
                      pendingSkills: roleConfigurationPending?.pendingSkills ?? true,
                      pendingMcp: roleConfigurationPending?.pendingMcp ?? true,
                    } : null}
                    handoffApproval={handoffApprovalNodeId ? {
                      nodeId: handoffApprovalNodeId,
                      targets: handoffApprovalTargets ?? [],
                    } : null}
                    onRoleSelect={handleRoleSelect}
                    onInputChange={handleComposerChange}
                    onSubmit={handleSubmit}
                    onStop={handleStopActiveTurn}
                    onConsentResponse={handleConsentResponse}
                    onRoleConfigure={handleRoleConfigure}
                    onHandoffApproval={handleHandoffApproval}
                    onConsentModeChange={handleConsentModeChange}
                    onCompactContext={viewedRole ? handleCompactContext : undefined}
                    isCompactingContext={isViewedRoleCompacting}
                    contextWindow={viewedRoleContextWindow ?? contextWindow}
                    latestContextUsage={latestContextUsage}
                  />
                </ErrorBoundary>
              </Panel>
            </PanelGroup>
          </div>
        </Panel>
      </PanelGroup>

      {!sidebarVisible && drawerOpen ? (
        <>
          <button
            type="button"
            className="drawer-backdrop"
            aria-label="Close project sidebar"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="sidebar-drawer">
            {sidebarContent}
          </aside>
        </>
      ) : null}

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

      {toasts.length > 0 ? (
        <div className="toast-stack">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`toast toast-${toast.tone}`}
              role={toast.tone === 'error' ? 'alert' : 'status'}
            >
              <span className="toast-message">{toast.message}</span>
              <button
                type="button"
                className="toast-dismiss"
                aria-label="Dismiss notification"
                onClick={() => dismissToast(toast.id)}
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {settingsOpen && (
        <SettingsModal
          required={!hasConfiguredModel}
          onClose={() => setSettingsOpen(false)}
          onModelsChange={handleModelsChange}
          onSkillsChange={refreshConfiguredSkills}
          onMcpServersChange={refreshConfiguredMcpServers}
          onError={showToast}
          onSuccess={(message) => notify(message, 'success')}
        />
      )}

      {projectSettingsTarget && (
        <ProjectSettingsModal
          projectNamespace={projectSettingsTarget.folderName}
          displayName={projectSettingsTarget.displayName}
          deletable={projectSettingsTarget.folderName !== 'a-society'}
          onClose={() => setProjectSettingsTarget(null)}
          onError={showToast}
          onDeleteProject={() => {
            const target = projectSettingsTarget;
            setProjectSettingsTarget(null);
            void handleDeleteProject(target);
          }}
        />
      )}

      {confirmElement}
    </main>
  );
}

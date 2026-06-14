import { lazy, startTransition, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { flowKey } from '../../src/common/flow-ref.js';
import { CLIENT_MESSAGE_TYPE, CONSENT_MODE } from '../../src/common/protocol-constants.js';
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
import { FeedbackConsentModal } from './components/FeedbackConsentModal';
import { FlowTabs } from './components/FlowTabs';
import { ImprovementChoiceModal } from './components/ImprovementChoiceModal';
import { ProjectSelector } from './components/ProjectSelector';
import { SettingsModal } from './components/SettingsModal';
import { areFlowRunsEqual } from './equality';
import { useWebSocket } from './hooks/useWebSocket';
import type {
  ClientMessage,
  FlowRef,
  FlowSummary,
  McpServerSummary,
  ModelConfig,
  ProjectDiscovery,
  ServerMessage,
  SettingsStatus,
  SkillSummary,
} from './types';

const GraphView = lazy(async () => {
  const module = await import('./components/GraphView');
  return { default: module.GraphView };
});

const ERROR_TOAST_DURATION_MS = 12_000;

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
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string): void => {
    if (toastTimerRef.current !== null) clearTimeout(toastTimerRef.current);
    setErrorToast(message);
    toastTimerRef.current = setTimeout(() => setErrorToast(null), ERROR_TOAST_DURATION_MS);
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
    handleTabSelect,
    handleCloseTab,
    handleSubmit,
    handleImprovementChoice,
    handleFeedbackConsentChoice,
    handleConsentResponse,
    handleRoleConfigure,
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
            onDeleteProject={handleDeleteProject}
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
                  roleConfiguration={roleConfigurationNodeId ? {
                    nodeId: roleConfigurationNodeId,
                    models: configuredModels,
                    skills: configuredSkills,
                    mcpServers: configuredMcpServers,
                    pendingModel: roleConfigurationPending?.pendingModel ?? true,
                    pendingSkills: roleConfigurationPending?.pendingSkills ?? true,
                    pendingMcp: roleConfigurationPending?.pendingMcp ?? true,
                  } : null}
                  onRoleSelect={handleRoleSelect}
                  onInputChange={handleComposerChange}
                  onSubmit={handleSubmit}
                  onStop={handleStopActiveTurn}
                  onConsentResponse={handleConsentResponse}
                  onRoleConfigure={handleRoleConfigure}
                  onConsentModeChange={handleConsentModeChange}
                  onCompactContext={viewedRole ? handleCompactContext : undefined}
                  isCompactingContext={isViewedRoleCompacting}
                  contextWindow={viewedRoleContextWindow ?? contextWindow}
                  latestContextUsage={latestContextUsage}
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
          onModelsChange={handleModelsChange}
          onSkillsChange={refreshConfiguredSkills}
          onMcpServersChange={refreshConfiguredMcpServers}
          onError={showToast}
        />
      )}
    </main>
  );
}

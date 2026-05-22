import { useCallback, type Dispatch, type SetStateAction } from 'react';
import { flowKey } from '../../../src/common/flow-ref.js';
import type { GraphMode } from '../components/GraphView';
import { areWorkflowGraphsEqual } from '../equality';
import type {
  ClientMessage,
  ConsentMode,
  ConsentResponseDecision,
  FlowRef,
  FlowSummary,
  WorkflowGraph,
} from '../types';
import type { ActiveFlowView } from './active-flow-view';
import { SYSTEM_ROLE_KEY } from './constants';
import { titleForFlow, type FlowTab, type FlowUiState } from './flow-ui';
import { writeUrlFlowRef } from './routing';
import { deleteFlow as deleteFlowApi } from './runtime-api';

type FlowUiUpdater = (state: FlowUiState) => FlowUiState;

interface UseAppCommandsInput {
  activeView: ActiveFlowView;
  activeTabKey: string | null;
  newProjectName: string;
  ensureConfiguredModel: () => boolean;
  ensureTab: (ref: FlowRef, title: string) => void;
  refreshProjectFlows: (projectNamespace: string) => Promise<void>;
  sendMessage: (message: ClientMessage) => void;
  updateFlowUi: (key: string, updater: FlowUiUpdater) => void;
  setSelectedProject: Dispatch<SetStateAction<string | null>>;
  setNewProjectName: Dispatch<SetStateAction<string>>;
  setSelectorError: Dispatch<SetStateAction<string | null>>;
  setActiveTabKey: Dispatch<SetStateAction<string | null>>;
  setTabs: Dispatch<SetStateAction<FlowTab[]>>;
  setFlowUiByKey: Dispatch<SetStateAction<Record<string, FlowUiState>>>;
}

export function useAppCommands(input: UseAppCommandsInput) {
  const {
    activeTabKey,
    ensureConfiguredModel,
    ensureTab,
    newProjectName,
    refreshProjectFlows,
    sendMessage,
    setActiveTabKey,
    setFlowUiByKey,
    setNewProjectName,
    setSelectedProject,
    setSelectorError,
    setTabs,
    updateFlowUi,
  } = input;
  const {
    activeTab,
    activeUi,
    inputTargetRole,
    viewedRole,
    visibleConsentRequest,
  } = input.activeView;

  const openFlow = useCallback((ref: FlowRef, title = ref.flowId): void => {
    ensureTab(ref, title);
    updateFlowUi(flowKey(ref), (state) => state);
    sendMessage({ type: 'open_flow', flowRef: ref });
  }, [ensureTab, sendMessage, updateFlowUi]);

  const handleProjectSelect = useCallback((projectNamespace: string | null): void => {
    setSelectedProject(projectNamespace);
    setNewProjectName('');
    setSelectorError(null);
    if (projectNamespace) {
      void refreshProjectFlows(projectNamespace);
    }
  }, [refreshProjectFlows, setNewProjectName, setSelectedProject, setSelectorError]);

  const handleExistingInitialization = useCallback((projectNamespace: string): void => {
    if (!ensureConfiguredModel()) return;
    setSelectedProject(projectNamespace);
    setNewProjectName('');
    setSelectorError(null);
    sendMessage({ type: 'start_takeover_initialization', projectNamespace });
  }, [ensureConfiguredModel, sendMessage, setNewProjectName, setSelectedProject, setSelectorError]);

  const handleCreateNewProject = useCallback((): void => {
    const projectName = newProjectName.trim();
    if (!projectName) return;
    if (!ensureConfiguredModel()) return;

    setSelectedProject(projectName);
    setSelectorError(null);
    sendMessage({ type: 'start_greenfield_initialization', projectName });
  }, [ensureConfiguredModel, newProjectName, sendMessage, setSelectedProject, setSelectorError]);

  const handleOpenFlow = useCallback((flow: FlowSummary): void => {
    openFlow({ projectNamespace: flow.projectNamespace, flowId: flow.flowId }, titleForFlow(flow));
  }, [openFlow]);

  const handleNewFlow = useCallback((projectNamespace: string): void => {
    if (!ensureConfiguredModel()) return;
    setSelectorError(null);
    sendMessage({ type: 'start_initialized_flow', projectNamespace });
  }, [ensureConfiguredModel, sendMessage, setSelectorError]);

  const handleDeleteFlow = useCallback(async (flow: FlowSummary): Promise<void> => {
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
  }, [activeTabKey, refreshProjectFlows, setActiveTabKey, setFlowUiByKey, setSelectorError, setTabs]);

  const handleTabSelect = useCallback((tab: FlowTab): void => {
    setActiveTabKey(tab.key);
    setSelectedProject(tab.ref.projectNamespace);
    writeUrlFlowRef(tab.ref);
    sendMessage({ type: 'open_flow', flowRef: tab.ref });
  }, [sendMessage, setActiveTabKey, setSelectedProject]);

  const handleCloseTab = useCallback((tab: FlowTab): void => {
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
  }, [activeTabKey, setActiveTabKey, setFlowUiByKey, setSelectedProject, setTabs]);

  const handleSubmit = useCallback((): void => {
    if (!activeTab || !activeUi) return;
    if (!ensureConfiguredModel()) return;
    const text = activeUi.composerValue.trim();
    if (!text) return;
    updateFlowUi(activeTab.key, (state) => ({
      ...state,
      composerValue: '',
    }));
    sendMessage({
      type: 'human_input',
      flowRef: activeTab.ref,
      text,
      role: inputTargetRole === SYSTEM_ROLE_KEY ? undefined : inputTargetRole
    });
  }, [activeTab, activeUi, ensureConfiguredModel, inputTargetRole, sendMessage, updateFlowUi]);

  const handleImprovementChoice = useCallback((mode: 'graph-based' | 'parallel' | 'none'): void => {
    if (!activeTab) return;
    if (mode !== 'none' && !ensureConfiguredModel()) return;
    if (mode !== 'none') {
      updateFlowUi(activeTab.key, (state) => ({ ...state, selectedGraph: 'improvement' }));
    }
    sendMessage({ type: 'improvement_choice', flowRef: activeTab.ref, mode });
  }, [activeTab, ensureConfiguredModel, sendMessage, updateFlowUi]);

  const handleFeedbackConsentChoice = useCallback((decision: 'granted' | 'denied'): void => {
    if (!activeTab) return;
    if (decision === 'granted' && !ensureConfiguredModel()) return;
    if (decision === 'granted') {
      updateFlowUi(activeTab.key, (state) => ({ ...state, selectedGraph: 'improvement' }));
    }
    sendMessage({ type: 'feedback_consent_choice', flowRef: activeTab.ref, decision });
  }, [activeTab, ensureConfiguredModel, sendMessage, updateFlowUi]);

  const handleConsentResponse = useCallback((decision: ConsentResponseDecision): void => {
    if (!activeTab || !visibleConsentRequest) return;
    sendMessage({
      type: 'consent_response',
      flowRef: activeTab.ref,
      decision,
      role: visibleConsentRequest.role,
    });
  }, [activeTab, sendMessage, visibleConsentRequest]);

  const handleConsentModeChange = useCallback((mode: ConsentMode): void => {
    if (!activeTab) return;
    sendMessage({ type: 'consent_mode', flowRef: activeTab.ref, mode });
  }, [activeTab, sendMessage]);

  const handleStopActiveTurn = useCallback((): void => {
    if (!activeTab || !activeUi || !viewedRole || activeUi.stopRequestedRoles[viewedRole]) return;
    updateFlowUi(activeTab.key, (state) => ({
      ...state,
      stopRequestedRoles: { ...state.stopRequestedRoles, [viewedRole]: true },
    }));
    sendMessage({ type: 'stop_active_turn', flowRef: activeTab.ref, role: viewedRole });
  }, [activeTab, activeUi, sendMessage, updateFlowUi, viewedRole]);

  const handleCompactContext = useCallback((): void => {
    if (!activeTab || !viewedRole) return;
    if (!ensureConfiguredModel()) return;
    if (activeUi?.compactingRoles[viewedRole]) return;
    updateFlowUi(activeTab.key, (state) => ({
      ...state,
      compactingRoles: { ...state.compactingRoles, [viewedRole]: true },
    }));
    sendMessage({ type: 'compact_context', flowRef: activeTab.ref, role: viewedRole });
  }, [activeTab, activeUi, ensureConfiguredModel, sendMessage, updateFlowUi, viewedRole]);

  const handleResumeFlow = useCallback((): void => {
    if (!activeTab) return;
    if (!ensureConfiguredModel()) return;
    sendMessage({ type: 'resume_flow', flowRef: activeTab.ref });
  }, [activeTab, ensureConfiguredModel, sendMessage]);

  const handleWorkflowLoaded = useCallback((graph: WorkflowGraph): void => {
    if (!activeTabKey) return;
    updateFlowUi(activeTabKey, (state) => ({
      ...state,
      workflow: areWorkflowGraphsEqual(state.workflow, graph) ? state.workflow : graph
    }));
  }, [activeTabKey, updateFlowUi]);

  const handleGraphNodeClick = useCallback((_nodeId: string): void => { }, []);

  const handleGraphModeChange = useCallback((mode: GraphMode): void => {
    if (!activeTabKey) return;
    updateFlowUi(activeTabKey, (state) => ({ ...state, selectedGraph: mode }));
  }, [activeTabKey, updateFlowUi]);

  const handleRoleSelect = useCallback((role: string): void => {
    if (!activeTabKey) return;
    updateFlowUi(activeTabKey, (state) => ({ ...state, selectedRole: role }));
  }, [activeTabKey, updateFlowUi]);

  const handleComposerChange = useCallback((value: string): void => {
    if (!activeTabKey) return;
    updateFlowUi(activeTabKey, (state) => ({ ...state, composerValue: value }));
  }, [activeTabKey, updateFlowUi]);

  return {
    openFlow,
    handleProjectSelect,
    handleExistingInitialization,
    handleCreateNewProject,
    handleOpenFlow,
    handleNewFlow,
    handleDeleteFlow,
    handleTabSelect,
    handleCloseTab,
    handleSubmit,
    handleImprovementChoice,
    handleFeedbackConsentChoice,
    handleConsentResponse,
    handleConsentModeChange,
    handleStopActiveTurn,
    handleCompactContext,
    handleResumeFlow,
    handleWorkflowLoaded,
    handleGraphNodeClick,
    handleGraphModeChange,
    handleRoleSelect,
    handleComposerChange,
  };
}

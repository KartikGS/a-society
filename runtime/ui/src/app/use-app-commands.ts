import { useCallback, type Dispatch, type SetStateAction } from 'react';
import { flowKey } from '../../../src/common/flow-ref.js';
import {
  CLIENT_MESSAGE_TYPE,
  FEEDBACK_CONSENT_DECISION,
  IMPROVEMENT_CHOICE_MODE,
} from '../../../src/common/protocol-constants.js';
import type {
  ProtocolFeedbackConsentDecision,
  ProtocolImprovementChoiceMode,
} from '../../../src/common/protocol-constants.js';
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
    improvementInputTargetRole,
    viewedRole,
    visibleConsentRequest,
  } = input.activeView;

  const openFlow = useCallback((ref: FlowRef, title = ref.flowId): void => {
    ensureTab(ref, title);
    updateFlowUi(flowKey(ref), (state) => state);
    sendMessage({ type: CLIENT_MESSAGE_TYPE.OPEN_FLOW, flowRef: ref });
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
    sendMessage({ type: CLIENT_MESSAGE_TYPE.START_TAKEOVER_INITIALIZATION, projectNamespace });
  }, [ensureConfiguredModel, sendMessage, setNewProjectName, setSelectedProject, setSelectorError]);

  const handleCreateNewProject = useCallback((): void => {
    const projectNamespace = newProjectName.trim();
    if (!projectNamespace) return;
    if (!ensureConfiguredModel()) return;

    setSelectedProject(projectNamespace);
    setSelectorError(null);
    sendMessage({ type: CLIENT_MESSAGE_TYPE.START_GREENFIELD_INITIALIZATION, projectNamespace });
  }, [ensureConfiguredModel, newProjectName, sendMessage, setSelectedProject, setSelectorError]);

  const handleOpenFlow = useCallback((flow: FlowSummary): void => {
    openFlow({ projectNamespace: flow.projectNamespace, flowId: flow.flowId }, titleForFlow(flow));
  }, [openFlow]);

  const handleNewFlow = useCallback((projectNamespace: string): void => {
    if (!ensureConfiguredModel()) return;
    setSelectorError(null);
    sendMessage({ type: CLIENT_MESSAGE_TYPE.START_INITIALIZED_FLOW, projectNamespace });
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
    sendMessage({ type: CLIENT_MESSAGE_TYPE.OPEN_FLOW, flowRef: tab.ref });
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
    if (improvementInputTargetRole) {
      sendMessage({
        type: CLIENT_MESSAGE_TYPE.IMPROVEMENT_HUMAN_INPUT,
        flowRef: activeTab.ref,
        role: improvementInputTargetRole,
        text,
      });
    } else {
      sendMessage({
        type: CLIENT_MESSAGE_TYPE.HUMAN_INPUT,
        flowRef: activeTab.ref,
        text,
        role: inputTargetRole === SYSTEM_ROLE_KEY ? undefined : inputTargetRole
      });
    }
  }, [activeTab, activeUi, ensureConfiguredModel, improvementInputTargetRole, inputTargetRole, sendMessage, updateFlowUi]);

  const handleImprovementChoice = useCallback((mode: ProtocolImprovementChoiceMode): void => {
    if (!activeTab) return;
    if (mode !== IMPROVEMENT_CHOICE_MODE.NONE && !ensureConfiguredModel()) return;
    if (mode !== IMPROVEMENT_CHOICE_MODE.NONE) {
      updateFlowUi(activeTab.key, (state) => ({ ...state, selectedGraph: 'improvement' }));
    }
    sendMessage({ type: CLIENT_MESSAGE_TYPE.IMPROVEMENT_CHOICE, flowRef: activeTab.ref, mode });
  }, [activeTab, ensureConfiguredModel, sendMessage, updateFlowUi]);

  const handleFeedbackConsentChoice = useCallback((decision: ProtocolFeedbackConsentDecision): void => {
    if (!activeTab) return;
    if (decision === FEEDBACK_CONSENT_DECISION.GRANTED && !ensureConfiguredModel()) return;
    if (decision === FEEDBACK_CONSENT_DECISION.GRANTED) {
      updateFlowUi(activeTab.key, (state) => ({ ...state, selectedGraph: 'improvement' }));
    }
    sendMessage({ type: CLIENT_MESSAGE_TYPE.FEEDBACK_CONSENT_CHOICE, flowRef: activeTab.ref, decision });
  }, [activeTab, ensureConfiguredModel, sendMessage, updateFlowUi]);

  const handleConsentResponse = useCallback((decision: ConsentResponseDecision): void => {
    if (!activeTab || !visibleConsentRequest) return;
    sendMessage({
      type: CLIENT_MESSAGE_TYPE.CONSENT_RESPONSE,
      flowRef: activeTab.ref,
      decision,
      role: visibleConsentRequest.role,
    });
  }, [activeTab, sendMessage, visibleConsentRequest]);

  const handleConsentModeChange = useCallback((mode: ConsentMode): void => {
    if (!activeTab) return;
    sendMessage({ type: CLIENT_MESSAGE_TYPE.CONSENT_MODE, flowRef: activeTab.ref, mode });
  }, [activeTab, sendMessage]);

  const handleStopActiveTurn = useCallback((): void => {
    if (!activeTab || !activeUi || !viewedRole || activeUi.stopRequestedRoles[viewedRole]) return;
    updateFlowUi(activeTab.key, (state) => ({
      ...state,
      stopRequestedRoles: { ...state.stopRequestedRoles, [viewedRole]: true },
    }));
    sendMessage({ type: CLIENT_MESSAGE_TYPE.STOP_ACTIVE_TURN, flowRef: activeTab.ref, role: viewedRole });
  }, [activeTab, activeUi, sendMessage, updateFlowUi, viewedRole]);

  const handleCompactContext = useCallback((): void => {
    if (!activeTab || !viewedRole) return;
    if (!ensureConfiguredModel()) return;
    sendMessage({ type: CLIENT_MESSAGE_TYPE.COMPACT_CONTEXT, flowRef: activeTab.ref, role: viewedRole });
  }, [activeTab, ensureConfiguredModel, sendMessage, viewedRole]);

  const handleResumeFlow = useCallback((): void => {
    if (!activeTab) return;
    if (!ensureConfiguredModel()) return;
    sendMessage({ type: CLIENT_MESSAGE_TYPE.RESUME_FLOW, flowRef: activeTab.ref });
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

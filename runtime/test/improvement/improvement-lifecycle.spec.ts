import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  FEEDBACK_CONSENT_STATUS,
  IMPROVEMENT_CHOICE_MODE,
} from '../../shared/protocol-constants.js';
import { CURRENT_FLOW_STATE_VERSION } from '../../src/common/types.js';
import type {
  FlowRun,
  GatewayTurnResult,
  OperatorEvent,
  OperatorRenderSink,
  RuntimeMessageParam,
  TurnOptions,
} from '../../src/common/types.js';
import { deterministicFindingsFilePath } from '../../src/framework-services/backward-pass-orderer.js';
import { ImprovementOrchestrator } from '../../src/improvement/improvement.js';
import { getFlowRecordDir } from '../../src/orchestration/state-paths.js';
import * as SessionStore from '../../src/orchestration/store.js';
import { LLMGateway } from '../../src/providers/llm.js';
import { seedTestModelSettings } from '../integration/settings-test-utils.js';
import { clearWorkspaceRoot, setFrameworkRoot, setWorkspaceRoot } from '../../src/common/workspace.js';
import type { FileToolExecutor } from '../../src/tools/file-executor.js';

const tempDirs = new Set<string>();

function createWorkspace(): string {
  const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-improvement-lifecycle-'));
  tempDirs.add(workspaceRoot);
  seedTestModelSettings(path.join(workspaceRoot, '.a-society'), { providerBaseUrl: 'http://127.0.0.1:1/v1' });
  setWorkspaceRoot(workspaceRoot);
  return workspaceRoot;
}

async function waitUntil(predicate: () => boolean, timeoutMs = 2_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!predicate()) {
    if (Date.now() >= deadline) {
      throw new Error('Timed out waiting for expected improvement state.');
    }
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

function createBaseFlowRun(workspaceRoot: string, projectNamespace: string, flowId: string): FlowRun {
  return {
    flowId,
    workspaceRoot,
    projectNamespace,
    recordFolderPath: getFlowRecordDir({ projectNamespace, flowId }),
    runningNodes: [],
    awaitingHumanNodes: {},
    pendingHumanInputs: {},
    pendingHandoffApprovals: {},
    visitedNodeIds: [],
    completedHandoffs: [],
    receivingHandoff: {},
    historyHandoff: {},
    awaitingHandoff: [],
    status: 'running',
    stateVersion: CURRENT_FLOW_STATE_VERSION,
    feedbackContext: { kind: 'standard' },
  };
}

function createRenderer(): { renderer: OperatorRenderSink; repairEvents: OperatorEvent[] } {
  const repairEvents: OperatorEvent[] = [];
  return {
    repairEvents,
    renderer: {
      emit(event: OperatorEvent) {
        if (event.kind === 'repair.requested') repairEvents.push(event);
      },
      requestSent() {},
      receivingResponse() {},
      responseEnd() {},
      sendError() {},
    },
  };
}

describe('improvement lifecycle', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tempDirs.clear();
    clearWorkspaceRoot();
  });

  it('marks improvement as skipped when no improvement mode is selected', async () => {
    const workspaceRoot = createWorkspace();
    const flowRun = createBaseFlowRun(workspaceRoot, 'demo-project', 'skip-flow');
    fs.mkdirSync(flowRun.recordFolderPath, { recursive: true });

    ImprovementOrchestrator.markAwaitingChoice(flowRun);
    SessionStore.saveFlowRun(flowRun, SessionStore.flowRef(flowRun));

    await ImprovementOrchestrator.skipImprovement(flowRun);

    expect(flowRun.status).toBe('completed');
    expect(flowRun.improvementPhase).toMatchObject({
      status: 'skipped',
      mode: IMPROVEMENT_CHOICE_MODE.NONE,
    });
  });

  it('pauses feedback on prompt-human and resumes with queued human input', async () => {
    const workspaceRoot = createWorkspace();
    const projectNamespace = 'demo-project';
    const flowId = 'feedback-human-flow';
    const flowRun = createBaseFlowRun(workspaceRoot, projectNamespace, flowId);
    const feedbackArtifactPath = '.a-society/feedback/demo-project-flow-feedback-human-flow.md';
    const feedbackArtifactFilePath = path.join(workspaceRoot, feedbackArtifactPath);

    fs.mkdirSync(path.join(workspaceRoot, 'a-society', 'runtime', 'contracts'), { recursive: true });
    fs.writeFileSync(
      path.join(workspaceRoot, 'a-society', 'runtime', 'contracts', 'feedback.md'),
      'Runtime feedback instructions'
    );
    fs.mkdirSync(flowRun.recordFolderPath, { recursive: true });
    fs.writeFileSync(
      path.join(flowRun.recordFolderPath, 'workflow.yaml'),
      'workflow:\n  name: Test Workflow\n  nodes:\n    - id: curator\n      role: curator\n  edges: []\n'
    );
    const findingsFilePath = deterministicFindingsFilePath(flowRun.recordFolderPath, 'curator');
    fs.mkdirSync(path.dirname(findingsFilePath), { recursive: true });
    fs.writeFileSync(findingsFilePath, 'Curator findings');

    flowRun.status = 'awaiting_feedback_consent';
    flowRun.improvementPhase = {
      status: 'awaiting_feedback_consent',
      mode: IMPROVEMENT_CHOICE_MODE.GRAPH_BASED,
      completedRoles: ['curator'],
      runningRoles: [],
      awaitingHumanRoles: {},
      pendingHumanInputs: {},
      findingsProduced: {
        curator: path.relative(workspaceRoot, findingsFilePath),
      },
      feedbackArtifactPath,
      feedbackConsent: FEEDBACK_CONSENT_STATUS.PENDING,
    };

    const flowRef = SessionStore.flowRef(flowRun);
    SessionStore.saveFlowRun(flowRun, flowRef);

    const promptHumanText = 'Need clarification. ```handoff\ntype: prompt-human\n```';
    const completeText = `Feedback complete. \`\`\`handoff\ntype: backward-pass-complete\nartifact_path: ${feedbackArtifactPath}\n\`\`\``;
    const responses = [promptHumanText, completeText];
    const observedHistories: RuntimeMessageParam[][] = [];

    vi.spyOn(LLMGateway.prototype, 'executeTurn').mockImplementation(async (
      _systemPrompt: string,
      messageHistory: RuntimeMessageParam[],
      options?: TurnOptions
    ): Promise<GatewayTurnResult> => {
      observedHistories.push(messageHistory.map((message) => ({ ...message })));
      const text = responses.shift();
      if (!text) throw new Error('No mock response available.');
      options?.outputStream?.write(text);
      options?.onAssistantTextDelta?.(text);
      if (text === completeText) {
        fs.mkdirSync(path.dirname(feedbackArtifactFilePath), { recursive: true });
        fs.writeFileSync(feedbackArtifactFilePath, 'Generated feedback');
      }
      return { text };
    });

    const { renderer, repairEvents } = createRenderer();
    const improvementOrchestrator = new ImprovementOrchestrator();
    const feedbackPromise = improvementOrchestrator.runFeedback(flowRun, renderer);

    await waitUntil(() => {
      const pausedFlow = SessionStore.loadFlowRun(flowRef);
      return pausedFlow?.improvementPhase?.awaitingHumanRoles?.['a-society-feedback']?.reason === 'prompt-human';
    });

    const pausedFlow = SessionStore.loadFlowRun(flowRef);
    expect(pausedFlow?.status).toBe('running');
    expect(pausedFlow?.improvementPhase?.status).toBe('running');
    expect(pausedFlow?.improvementPhase?.runningRoles).toContain('a-society-feedback');
    expect(pausedFlow?.improvementPhase?.awaitingHumanRoles?.['a-society-feedback']).toEqual({
      reason: 'prompt-human',
    });

    await SessionStore.updateFlowRun((latest) => {
      if (!latest.improvementPhase) throw new Error('Improvement phase missing while resuming feedback.');
      latest.improvementPhase.pendingHumanInputs = {
        ...latest.improvementPhase.pendingHumanInputs,
        'a-society-feedback': {
          text: 'Please continue with the feedback artifact.',
          receivedAt: '2026-06-07T00:00:00.000Z',
        },
      };
    }, flowRef);
    improvementOrchestrator.wake();

    await feedbackPromise;
    const finalFlow = SessionStore.loadFlowRun(flowRef);

    expect(finalFlow?.status).toBe('completed');
    expect(finalFlow?.improvementPhase).toMatchObject({
      status: 'completed',
      feedbackArtifactPath,
      feedbackConsent: FEEDBACK_CONSENT_STATUS.GRANTED,
      completedRoles: ['curator', 'a-society-feedback'],
      runningRoles: [],
    });
    expect(finalFlow?.improvementPhase?.awaitingHumanRoles?.['a-society-feedback']).toBeUndefined();
    expect(finalFlow?.improvementPhase?.pendingHumanInputs?.['a-society-feedback']).toBeUndefined();
    expect(repairEvents).toEqual([]);
    expect(observedHistories).toHaveLength(2);
    expect(observedHistories[1]).toEqual(expect.arrayContaining([
      expect.objectContaining({
        role: 'user',
        content: expect.stringContaining('Please continue with the feedback artifact.'),
      }),
    ]));
  });
  describe('feedback report location', () => {
    /**
     * Sets up a flow paused at the feedback consent gate with the given persisted path and a
     * framework root OUTSIDE the workspace (no `<ws>/a-society/`), then runs feedback once. The
     * mocked turn writes the report through the gateway's real FileToolExecutor, so the write
     * scope threaded through runRoleTurn → LLMGateway → FileToolExecutor is exercised.
     */
    async function runFeedbackFrom(persistedPath: string, options: { createLegacyFile?: boolean } = {}) {
      const workspaceRoot = createWorkspace();
      const frameworkRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-fw-'));
      tempDirs.add(frameworkRoot);
      fs.mkdirSync(path.join(frameworkRoot, 'runtime', 'contracts'), { recursive: true });
      fs.writeFileSync(path.join(frameworkRoot, 'runtime', 'contracts', 'feedback.md'), 'FRAMEWORK-ROOT feedback instructions');
      setFrameworkRoot(frameworkRoot);

      const flowRun = createBaseFlowRun(workspaceRoot, 'demo-project', 'loc-flow');
      fs.mkdirSync(flowRun.recordFolderPath, { recursive: true });
      fs.writeFileSync(
        path.join(flowRun.recordFolderPath, 'workflow.yaml'),
        'workflow:\n  name: Test Workflow\n  nodes:\n    - id: curator\n      role: curator\n  edges: []\n'
      );
      const findingsFilePath = deterministicFindingsFilePath(flowRun.recordFolderPath, 'curator');
      fs.mkdirSync(path.dirname(findingsFilePath), { recursive: true });
      fs.writeFileSync(findingsFilePath, 'Curator findings');
      if (options.createLegacyFile) {
        fs.mkdirSync(path.dirname(path.join(workspaceRoot, persistedPath)), { recursive: true });
        fs.writeFileSync(path.join(workspaceRoot, persistedPath), 'Existing legacy report');
      }

      flowRun.status = 'awaiting_feedback_consent';
      flowRun.improvementPhase = {
        status: 'awaiting_feedback_consent',
        mode: IMPROVEMENT_CHOICE_MODE.GRAPH_BASED,
        completedRoles: ['curator'],
        runningRoles: [],
        awaitingHumanRoles: {},
        pendingHumanInputs: {},
        findingsProduced: { curator: path.relative(workspaceRoot, findingsFilePath) },
        feedbackArtifactPath: persistedPath,
        feedbackConsent: FEEDBACK_CONSENT_STATUS.PENDING,
      };
      const flowRef = SessionStore.flowRef(flowRun);
      SessionStore.saveFlowRun(flowRun, flowRef);

      const entryMessages: string[] = [];
      const writeResults: Array<{ isError: boolean; content: string }> = [];
      vi.spyOn(LLMGateway.prototype, 'executeTurn').mockImplementation(async function (
        this: LLMGateway,
        _systemPrompt: string,
        messageHistory: RuntimeMessageParam[],
      ): Promise<GatewayTurnResult> {
        for (const m of messageHistory) if (m.role === 'user' && typeof m.content === 'string') entryMessages.push(m.content);
        const assigned = /\.?a-society\/feedback\/[A-Za-z0-9.-]+\.md/.exec(entryMessages.join('\n'))?.[0];
        const executor = (this as unknown as { fileExecutor: FileToolExecutor }).fileExecutor;
        if (!assigned || !options.createLegacyFile) {
          writeResults.push(await executor.execute({ id: 'w1', name: 'write_file', input: { path: assigned ?? 'missing', content: 'Generated feedback' } }));
        }
        writeResults.push(await executor.execute({ id: 'w2', name: 'write_file', input: { path: 'demo-project/../root.md', content: 'x' } }));
        return { text: `Done. \`\`\`handoff\ntype: backward-pass-complete\nartifact_path: ${assigned}\n\`\`\`` };
      });

      await new ImprovementOrchestrator().runFeedback(flowRun, createRenderer().renderer);
      return { workspaceRoot, flowRef, entryMessages, writeResults };
    }

    it('reassigns a legacy path whose report was never written, reads the contract from the framework root, and lets the feedback turn write only there', async () => {
      const { workspaceRoot, flowRef, entryMessages, writeResults } = await runFeedbackFrom('a-society/feedback/x.md');
      const expected = '.a-society/feedback/demo-project-flow-loc-flow.md';

      const finalFlow = SessionStore.loadFlowRun(flowRef);
      expect(finalFlow?.improvementPhase?.feedbackArtifactPath).toBe(expected);
      expect(finalFlow?.improvementPhase?.status).toBe('completed');
      expect(fs.readFileSync(path.join(workspaceRoot, expected), 'utf8')).toBe('Generated feedback');
      expect(fs.existsSync(path.join(workspaceRoot, 'a-society'))).toBe(false);
      expect(entryMessages.join('\n')).toContain('FRAMEWORK-ROOT feedback instructions');
      expect(writeResults[0].isError).toBe(false);
      expect(writeResults[1].content).toBe(
        `Error: path 'demo-project/../root.md' is outside the permitted write area — writes are restricted to the project directory, the active record folder, and .a-society/feedback.`
      );
    });

    it('keeps a legacy path whose report already exists', async () => {
      const { flowRef } = await runFeedbackFrom('a-society/feedback/x.md', { createLegacyFile: true });
      expect(SessionStore.loadFlowRun(flowRef)?.improvementPhase?.feedbackArtifactPath).toBe('a-society/feedback/x.md');
    });
  });
});

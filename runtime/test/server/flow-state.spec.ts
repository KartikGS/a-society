import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { CURRENT_FLOW_STATE_VERSION, type FlowRun } from '../../src/common/types.js';
import { saveRoleModelSelection } from '../../src/orchestration/role-model.js';
import * as SessionStore from '../../src/orchestration/store.js';
import { buildFlowStateMessage } from '../../src/server/runtime-session/flow-state.js';
import { clearWorkspaceRoot, setWorkspaceRoot } from '../../src/common/workspace.js';
import { seedTestMultiModelSettings } from '../integration/settings-test-utils.js';

describe('flow state message', () => {
  afterEach(() => {
    clearWorkspaceRoot();
  });

  it('reports each role context window from its resolved per-flow model', () => {
    const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-state-windows-'));
    try {
      setWorkspaceRoot(workspaceRoot);
      seedTestMultiModelSettings(path.join(workspaceRoot, '.a-society'), [
        { id: 'model-a', providerBaseUrl: 'http://127.0.0.1:1/v1', contextWindow: 10_000, active: true },
        { id: 'model-b', providerBaseUrl: 'http://127.0.0.1:1/v1', contextWindow: 200_000 },
      ]);
      SessionStore.init();

      const ref = { projectNamespace: 'test-project', flowId: 'test-flow' };
      const flow: FlowRun = {
        flowId: ref.flowId,
        workspaceRoot,
        projectNamespace: ref.projectNamespace,
        recordFolderPath: path.join(workspaceRoot, '.a-society', 'state', ref.projectNamespace, ref.flowId, 'record'),
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
      };
      SessionStore.saveFlowRun(flow, ref);

      // owner selected model-b; curator has role state but no selection and
      // resolves to the active model.
      saveRoleModelSelection(workspaceRoot, ref, 'owner', {
        modelConfigId: 'model-b',
        displayName: 'model-b',
        modelId: 'model-b',
        selectedAt: new Date().toISOString(),
      });
      SessionStore.saveRoleFeed([], ref, 'curator');

      const message = buildFlowStateMessage(null, ref, () => flow, workspaceRoot);

      expect(message?.contextWindowByRole).toEqual({
        owner: 200_000,
        curator: 10_000,
      });
    } finally {
      fs.rmSync(workspaceRoot, { recursive: true, force: true });
    }
  });
});

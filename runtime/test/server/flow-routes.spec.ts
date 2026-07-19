import express from 'express';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setWorkspaceRoot } from '../../src/common/workspace.js';
import type { FlowRef } from '../../src/common/types.js';
import type { InitializationMode } from '../../shared/projects.js';
import { createFlowReadModel } from '../../src/server/flow-read-model.js';
import { registerFlowRoutes } from '../../src/server/flow-routes.js';
import { createRuntimeSessionManager, FlowCreationError } from '../../src/server/runtime-session/manager.js';
import { SocketHub } from '../../src/server/socket-hub.js';
import { MODEL_CONFIGURATION_REQUIRED_MESSAGE } from '../../src/settings/settings-store.js';

interface MockResponse {
  statusCode: number;
  body: unknown;
  status(code: number): MockResponse;
  json(body: unknown): void;
}

function createMockResponse(): MockResponse {
  const response: MockResponse = {
    statusCode: 200,
    body: undefined,
    status(code: number): MockResponse {
      response.statusCode = code;
      return response;
    },
    json(body: unknown): void {
      response.body = body;
    },
  };
  return response;
}

function findPostFlowsHandler(app: express.Express) {
  const routePath = '/api/projects/:projectNamespace/flows';
  const stack = (app as unknown as { _router: { stack: any[] } })._router.stack;
  const layer = stack.find((entry) => entry.route?.path === routePath && entry.route.methods.post);
  if (!layer) throw new Error('Route POST /api/projects/:projectNamespace/flows was not registered.');
  // The last handle in the route stack is the flow-creation handler (route-level express.json() precedes it).
  return layer.route.stack[layer.route.stack.length - 1].handle as (
    req: { body: unknown; params: Record<string, string> },
    res: MockResponse
  ) => Promise<void> | void;
}

// §7.1 — route mapping and response-schema shape. These prove dispatch and status
// mapping against fake creation functions, not production bootstrap paths.
describe('flow creation route mapping', () => {
  type FlowCreation = {
    createInitializedFlow: (projectNamespace: string) => FlowRef;
    createInitializationFlow: (projectNamespace: string, mode: InitializationMode) => FlowRef;
    createUpdateFlow: (projectNamespace: string) => FlowRef;
  };

  function makeFlowCreation(overrides: Partial<FlowCreation> = {}) {
    return {
      createInitializedFlow: vi.fn((ns: string): FlowRef => ({ projectNamespace: ns, flowId: 'flow-initialized' })),
      createInitializationFlow: vi.fn((ns: string, mode: InitializationMode): FlowRef => ({ projectNamespace: ns, flowId: `flow-${mode}` })),
      createUpdateFlow: vi.fn((ns: string): FlowRef => ({ projectNamespace: ns, flowId: 'flow-update' })),
      ...overrides,
    };
  }

  async function callCreateFlow(
    flowCreation: FlowCreation,
    body: unknown,
    params: Record<string, string> = { projectNamespace: 'demo' }
  ): Promise<{ status: number; body: unknown }> {
    const app = express();
    registerFlowRoutes(app, {
      flowReadModel: createFlowReadModel(),
      flowCreation,
      onFlowDeleted: () => {},
      onProjectDeleted: () => {},
    });
    const response = createMockResponse();
    await findPostFlowsHandler(app)({ body, params }, response);
    return { status: response.statusCode, body: response.body };
  }

  it('dispatches each mode to its creation function with the mapped arguments', async () => {
    const flowCreation = makeFlowCreation();

    await callCreateFlow(flowCreation, { mode: 'initialized' });
    expect(flowCreation.createInitializedFlow).toHaveBeenCalledWith('demo');

    await callCreateFlow(flowCreation, { mode: 'takeover' });
    expect(flowCreation.createInitializationFlow).toHaveBeenCalledWith('demo', 'takeover');

    await callCreateFlow(flowCreation, { mode: 'greenfield' });
    expect(flowCreation.createInitializationFlow).toHaveBeenCalledWith('demo', 'greenfield');

    await callCreateFlow(flowCreation, { mode: 'update' });
    expect(flowCreation.createUpdateFlow).toHaveBeenCalledWith('demo');
  });

  it('returns 201 with the flowRef the creation function produced', async () => {
    const flowRef: FlowRef = { projectNamespace: 'demo', flowId: 'flow-xyz' };
    const flowCreation = makeFlowCreation({ createInitializedFlow: vi.fn(() => flowRef) });

    const response = await callCreateFlow(flowCreation, { mode: 'initialized' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ flowRef });
  });

  it('rejects an invalid or missing mode with 400 and invokes no creation function', async () => {
    const flowCreation = makeFlowCreation();

    const invalid = await callCreateFlow(flowCreation, { mode: 'bogus' });
    expect(invalid.status).toBe(400);
    expect(invalid.body).toEqual({ message: 'Invalid flow creation mode.' });

    const missing = await callCreateFlow(flowCreation, {});
    expect(missing.status).toBe(400);
    expect(missing.body).toEqual({ message: 'Invalid flow creation mode.' });

    expect(flowCreation.createInitializedFlow).not.toHaveBeenCalled();
    expect(flowCreation.createInitializationFlow).not.toHaveBeenCalled();
    expect(flowCreation.createUpdateFlow).not.toHaveBeenCalled();
  });

  it('maps a FlowCreationError to its status code and message', async () => {
    const flowCreation = makeFlowCreation({
      createUpdateFlow: vi.fn(() => {
        throw new FlowCreationError(409, 'Project "demo" has no available update.');
      }),
    });

    const response = await callCreateFlow(flowCreation, { mode: 'update' });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ message: 'Project "demo" has no available update.' });
  });

  it('maps an unexpected error to 500 with the message passthrough', async () => {
    const flowCreation = makeFlowCreation({
      createInitializedFlow: vi.fn(() => {
        throw new Error('boom');
      }),
    });

    const response = await callCreateFlow(flowCreation, { mode: 'initialized' });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'boom' });
  });
});

// §7.2 — production-path coverage of the precondition and missing-model guards in the
// real manager creation functions, exercised against a temp workspace.
describe('flow creation manager preconditions', () => {
  let workspaceRoot: string;

  beforeEach(() => {
    workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-flow-create-'));
    setWorkspaceRoot(workspaceRoot);
  });

  function createManager() {
    return createRuntimeSessionManager({ socketHub: new SocketHub(), flowReadModel: createFlowReadModel() });
  }

  function expectFlowCreationError(run: () => unknown, statusCode: number, message: string): void {
    let caught: unknown;
    try {
      run();
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(FlowCreationError);
    expect((caught as FlowCreationError).statusCode).toBe(statusCode);
    expect((caught as FlowCreationError).message).toBe(message);
  }

  it('throws 404 when the initialized project has no a-docs in the workspace', () => {
    const manager = createManager();
    expectFlowCreationError(
      () => manager.createInitializedFlow('missing'),
      404,
      'Project "missing" with a-docs was not found in the workspace.'
    );
  });

  it('throws 404 when the takeover project is not present without a-docs', () => {
    const manager = createManager();
    expectFlowCreationError(
      () => manager.createInitializationFlow('missing', 'takeover'),
      404,
      'Project "missing" without a-docs was not found in the workspace.'
    );
  });

  it('throws 409 when the update project has no available update', () => {
    const manager = createManager();
    expectFlowCreationError(
      () => manager.createUpdateFlow('missing'),
      409,
      'Project "missing" has no available update.'
    );
  });

  it('throws 409 when no usable model is configured after the precondition passes', () => {
    fs.mkdirSync(path.join(workspaceRoot, 'demo', 'a-docs'), { recursive: true });
    const manager = createManager();
    expectFlowCreationError(
      () => manager.createInitializedFlow('demo'),
      409,
      MODEL_CONFIGURATION_REQUIRED_MESSAGE
    );
  });

  it('checks the precondition before the missing-model guard (precondition error wins)', () => {
    // 'demo' has no a-docs folder and no model is configured: the 404 precondition
    // must win over the 409 missing-model status, proving the check order.
    const manager = createManager();
    expectFlowCreationError(
      () => manager.createInitializedFlow('demo'),
      404,
      'Project "demo" with a-docs was not found in the workspace.'
    );
  });
});

import { type Express, type Request, type Response } from 'express';
import type { FlowRef, FlowRun } from '../common/types.js';
import { SessionStore } from '../orchestration/store.js';
import { discoverProjects } from '../projects/project-discovery.js';
import type { FlowReadModel } from './flow-read-model.js';

type RegisterFlowRoutesOptions = {
  workspaceRoot: string;
  flowReadModel: FlowReadModel;
  onFlowDeleted(projectNamespace: string): void;
};

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

function flowRefFromParams(req: Request): FlowRef {
  return {
    projectNamespace: routeParam(req.params.projectNamespace),
    flowId: routeParam(req.params.flowId),
  };
}

function readFlowRunForHttp(flowReadModel: FlowReadModel, ref: FlowRef, res: Response): FlowRun | null | undefined {
  try {
    return flowReadModel.readFlowRun(ref);
  } catch (error: any) {
    res.status(409).json({
      message: error instanceof Error ? error.message : String(error)
    });
    return undefined;
  }
}

function workflowResponse(workflow: any) {
  return {
    name: typeof workflow.name === 'string' ? workflow.name : undefined,
    summary: typeof workflow.summary === 'string' ? workflow.summary : undefined,
    nodes: Array.isArray(workflow.nodes) ? workflow.nodes : [],
    edges: Array.isArray(workflow.edges) ? workflow.edges : []
  };
}

export function registerFlowRoutes(app: Express, options: RegisterFlowRoutesOptions): void {
  const { workspaceRoot, flowReadModel, onFlowDeleted } = options;

  app.get('/api/projects', (_req: Request, res: Response) => {
    res.json(discoverProjects(workspaceRoot));
  });

  app.get('/api/projects/:projectNamespace/flows', (req: Request, res: Response) => {
    const projectNamespace = routeParam(req.params.projectNamespace);
    res.json(SessionStore.listFlowSummaries(workspaceRoot, projectNamespace));
  });

  app.get('/api/flows/:projectNamespace/:flowId/state', (req: Request, res: Response) => {
    const ref = flowRefFromParams(req);
    const flowRun = readFlowRunForHttp(flowReadModel, ref, res);
    if (flowRun === undefined) return;
    res.json(flowRun);
  });

  app.get('/api/flows/:projectNamespace/:flowId/workflow', (req: Request, res: Response) => {
    const ref = flowRefFromParams(req);
    const flowRun = readFlowRunForHttp(flowReadModel, ref, res);
    if (flowRun === undefined) return;
    if (!flowRun) {
      res.status(404).json({ message: 'No flow state found.' });
      return;
    }

    const workflow = flowReadModel.resolveWorkflow(flowRun);
    if (!workflow) {
      res.status(404).json({ message: 'Workflow graph is unavailable for this flow.' });
      return;
    }

    res.json(workflowResponse(workflow));
  });

  app.get('/api/flows/:projectNamespace/:flowId/improvement-workflow', (req: Request, res: Response) => {
    const ref = flowRefFromParams(req);
    const flowRun = readFlowRunForHttp(flowReadModel, ref, res);
    if (flowRun === undefined) return;
    if (!flowRun) {
      res.status(404).json({ message: 'No flow state found.' });
      return;
    }

    const workflow = flowReadModel.resolveImprovementWorkflow(flowRun);
    if (!workflow) {
      res.status(404).json({ message: 'Improvement graph is unavailable for this flow.' });
      return;
    }

    res.json(workflowResponse(workflow));
  });

  app.delete('/api/flows/:projectNamespace/:flowId', (req: Request, res: Response) => {
    const ref = flowRefFromParams(req);

    SessionStore.deleteFlow(ref, workspaceRoot);
    onFlowDeleted(ref.projectNamespace);

    res.status(200).json({ ok: true });
  });

}

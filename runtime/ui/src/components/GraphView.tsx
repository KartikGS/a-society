import dagre from '@dagrejs/dagre';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  Position,
  ReactFlow,
  type Edge,
  type Node
} from '@xyflow/react';
import { areStringArraysEqual, areWorkflowGraphsEqual } from '../equality';
import type { FlowRef, FlowRun, WorkflowGraph } from '../types';

export type GraphMode = 'flow' | 'improvement';

interface GraphViewProps {
  flowRun: FlowRun;
  flowRef: FlowRef;
  graphMode: GraphMode;
  improvementAvailable: boolean;
  backwardActive: string[];
  backwardSources?: string[];
  recordFolderPath: string;
  onNodeClick: (nodeId: string) => void;
  onGraphModeChange: (mode: GraphMode) => void;
  onWorkflowLoaded?: (graph: WorkflowGraph) => void;
}

const EMPTY_GRAPH_STATE: { nodes: Node[]; edges: Edge[] } = { nodes: [], edges: [] };
const EMPTY_STRINGS: string[] = [];

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

const NODE_SIZE = 140;

function buildReactFlowState(
  workflow: WorkflowGraph,
  flowRun: FlowRun,
  graphMode: GraphMode,
  backwardActive: string[],
  backwardSources: string[]
): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR', nodesep: 60, ranksep: 100 });

  for (const node of workflow.nodes) {
    g.setNode(node.id, { width: NODE_SIZE, height: NODE_SIZE });
  }
  for (const edge of workflow.edges) {
    g.setEdge(edge.from, edge.to);
  }
  dagre.layout(g);

  const openNodeIds = getOpenNodeIds(flowRun);
  const improvementActiveNodeIds = flowRun.improvementPhase?.activeNodeIds ?? EMPTY_STRINGS;
  const improvementCompletedNodeIds = flowRun.improvementPhase?.completedNodeIds ?? EMPTY_STRINGS;

  const nodes: Node[] = workflow.nodes.map((node) => {
    const { x, y } = g.node(node.id);

    const isCompleted = graphMode === 'improvement'
      ? improvementCompletedNodeIds.includes(node.id)
      : flowRun.completedNodes.includes(node.id);
    const isBackward = graphMode === 'flow' && backwardActive.includes(node.id);
    const isBackwardSource = graphMode === 'flow' && backwardSources.includes(node.id) && openNodeIds.includes(node.id);
    const isActive = graphMode === 'improvement'
      ? improvementActiveNodeIds.includes(node.id)
      : openNodeIds.includes(node.id);

    let tone = 'node-neutral';
    if (isCompleted) tone = 'node-completed';
    else if (isBackward) tone = 'node-backward';
    else if (isBackwardSource) tone = 'node-backward-source';
    else if (isActive) tone = 'node-active';

    return {
      id: node.id,
      position: { x: x - NODE_SIZE / 2, y: y - NODE_SIZE / 2 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: {
        label: (
          <div className={`graph-node ${tone}`}>
            <span className="graph-node-id">{node.id}</span>
            <span className="graph-node-role">{node.role}</span>
          </div>
        )
      },
      style: {
        border: 'none',
        background: 'transparent',
        boxShadow: 'none',
        padding: 0,
        width: NODE_SIZE,
        height: NODE_SIZE
      }
    };
  });

  const edges: Edge[] = workflow.edges.map((edge) => ({
    id: `${edge.from}-${edge.to}`,
    source: edge.from,
    target: edge.to,
    type: 'straight',
    animated: false,
  }));

  return { nodes, edges };
}

function areGraphFlowRunsEqual(left: FlowRun, right: FlowRun): boolean {
  return (
    left.flowId === right.flowId &&
    left.projectNamespace === right.projectNamespace &&
    left.recordFolderPath === right.recordFolderPath &&
    left.recordName === right.recordName &&
    left.recordSummary === right.recordSummary &&
    left.status === right.status &&
    areStringArraysEqual(left.readyNodes, right.readyNodes) &&
    areStringArraysEqual(left.runningNodes, right.runningNodes) &&
    areStringArraysEqual(Object.keys(left.awaitingHumanNodes), Object.keys(right.awaitingHumanNodes)) &&
    areStringArraysEqual(left.completedNodes, right.completedNodes) &&
    left.improvementPhase?.status === right.improvementPhase?.status &&
    left.improvementPhase?.mode === right.improvementPhase?.mode &&
    left.improvementPhase?.currentStep === right.improvementPhase?.currentStep &&
    left.improvementPhase?.improvementWorkflowPath === right.improvementPhase?.improvementWorkflowPath &&
    areStringArraysEqual(left.improvementPhase?.activeNodeIds, right.improvementPhase?.activeNodeIds) &&
    areStringArraysEqual(left.improvementPhase?.completedNodeIds, right.improvementPhase?.completedNodeIds)
  );
}

function GraphViewComponent({
  flowRun,
  flowRef,
  graphMode,
  improvementAvailable,
  backwardActive,
  backwardSources: providedBackwardSources,
  recordFolderPath,
  onNodeClick,
  onGraphModeChange,
  onWorkflowLoaded
}: GraphViewProps) {
  const [workflow, setWorkflow] = useState<WorkflowGraph | null>(null);
  const [loadedGraphMode, setLoadedGraphMode] = useState<GraphMode | null>(null);
  const [error, setError] = useState<{ mode: GraphMode; message: string } | null>(null);
  const workflowRef = useRef<WorkflowGraph | null>(null);

  useEffect(() => {
    let cancelled = false;
    workflowRef.current = null;

    const loadWorkflow = async () => {
      try {
        const graphEndpoint = graphMode === 'improvement' ? 'improvement-workflow' : 'workflow';
        const response = await fetch(
          `/api/flows/${encodeURIComponent(flowRef.projectNamespace)}/${encodeURIComponent(flowRef.flowId)}/${graphEndpoint}`
        );
        if (!response.ok) {
          throw new Error(await response.text());
        }
        const graph = await response.json() as WorkflowGraph;
        if (cancelled) return;
        if (!areWorkflowGraphsEqual(workflowRef.current, graph)) {
          workflowRef.current = graph;
          setWorkflow(graph);
          setLoadedGraphMode(graphMode);
          if (graphMode === 'flow') {
            onWorkflowLoaded?.(graph);
          }
        }
        setError(null);
      } catch (loadError: unknown) {
        if (cancelled) return;
        workflowRef.current = null;
        setWorkflow(null);
        setLoadedGraphMode(null);
        setError({
          mode: graphMode,
          message: loadError instanceof Error ? loadError.message : 'Unable to load workflow graph.'
        });
      }
    };

    void loadWorkflow();
    const timer = window.setInterval(() => {
      void loadWorkflow();
    }, 1500);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [flowRef.projectNamespace, flowRef.flowId, graphMode, recordFolderPath, onWorkflowLoaded]);

  const visibleWorkflow = loadedGraphMode === graphMode ? workflow : null;
  const visibleError = error?.mode === graphMode ? error.message : null;

  const backwardSources = useMemo(() => (
    visibleWorkflow && providedBackwardSources && providedBackwardSources.length > 0
      ? providedBackwardSources
      : EMPTY_STRINGS
  ), [visibleWorkflow, providedBackwardSources]);

  const graphState = useMemo(() => (
    visibleWorkflow
      ? buildReactFlowState(visibleWorkflow, flowRun, graphMode, backwardActive, backwardSources)
      : EMPTY_GRAPH_STATE
  ), [visibleWorkflow, flowRun, graphMode, backwardActive, backwardSources]);

  const graphTitle = visibleWorkflow?.name ?? flowRun.recordName ?? flowRun.flowId;
  const graphSummary = visibleWorkflow?.summary ?? flowRun.recordSummary ?? flowRun.projectNamespace;
  const graphStateLabel = graphMode === 'improvement'
    ? flowRun.improvementPhase?.status ?? flowRun.status
    : flowRun.status;
  const graphModeLabel = graphMode === 'improvement' ? 'Improvement Graph' : 'Workflow Graph';

  return (
    <section className="panel graph-panel">
      <div className="graph-panel-header">
        <div>
          <p className="eyebrow">{graphModeLabel}</p>
          <h2>{graphTitle}</h2>
          <p className="panel-copy">
            {graphSummary}
          </p>
        </div>
        <div className="graph-header-actions">
          <div className="graph-mode-tabs" aria-label="Graph view">
            <button
              type="button"
              className={`graph-mode-tab${graphMode === 'flow' ? ' graph-mode-tab-active' : ''}`}
              onClick={() => onGraphModeChange('flow')}
            >
              Flow
            </button>
            <button
              type="button"
              className={`graph-mode-tab${graphMode === 'improvement' ? ' graph-mode-tab-active' : ''}`}
              disabled={!improvementAvailable}
              onClick={() => onGraphModeChange('improvement')}
            >
              Improvement
            </button>
          </div>
          <div className="legend">
            <span><i className="legend-swatch legend-active" /> Active</span>
            {graphMode === 'flow' ? <span><i className="legend-swatch legend-backward" /> Backward</span> : null}
            <span><i className="legend-swatch legend-complete" /> Complete</span>
            <span><i className="legend-swatch legend-neutral" /> Pending</span>
          </div>
        </div>
      </div>

      <div className="graph-meta-plain">
        <span>Project: {flowRun.projectNamespace}</span>
        <span className="graph-meta-sep">·</span>
        <span>Record: {flowRun.flowId}</span>
        <span className="graph-meta-sep">·</span>
        <span>State: {graphStateLabel}</span>
        <span className="graph-meta-sep">·</span>
        <span>{recordFolderPath}</span>
      </div>

      <div className="graph-canvas">
        {visibleError ? <div className="graph-empty">{visibleError}</div> : null}
        {!visibleWorkflow && !visibleError ? <div className="graph-empty">Loading {graphMode === 'improvement' ? 'improvement' : 'workflow'} graph…</div> : null}
        {visibleWorkflow ? (
          <ReactFlow
            nodes={graphState.nodes}
            edges={graphState.edges}
            fitView
            proOptions={{ hideAttribution: true }}
            onlyRenderVisibleElements
            nodesDraggable={false}
            onNodeClick={(_event, node) => onNodeClick(node.id)}
          >
            <Background gap={20} color="rgba(65, 78, 92, 0.09)" />
            <MiniMap pannable zoomable />
            <Controls />
          </ReactFlow>
        ) : null}
      </div>
    </section>
  );
}

function areGraphViewPropsEqual(prev: GraphViewProps, next: GraphViewProps): boolean {
  return (
    prev.recordFolderPath === next.recordFolderPath &&
    prev.flowRef.projectNamespace === next.flowRef.projectNamespace &&
    prev.flowRef.flowId === next.flowRef.flowId &&
    prev.graphMode === next.graphMode &&
    prev.improvementAvailable === next.improvementAvailable &&
    prev.onNodeClick === next.onNodeClick &&
    prev.onGraphModeChange === next.onGraphModeChange &&
    prev.onWorkflowLoaded === next.onWorkflowLoaded &&
    areGraphFlowRunsEqual(prev.flowRun, next.flowRun) &&
    areStringArraysEqual(prev.backwardActive, next.backwardActive) &&
    areStringArraysEqual(prev.backwardSources, next.backwardSources)
  );
}

export const GraphView = memo(GraphViewComponent, areGraphViewPropsEqual);

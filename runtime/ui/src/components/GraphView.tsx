import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  Position,
  ReactFlow,
  type ReactFlowInstance,
  type Edge,
  type Node
} from '@xyflow/react';
import { areStringArraysEqual, areWorkflowGraphsEqual } from '../equality';
import type { FlowRef, FlowRun, WorkflowGraph } from '../types';

interface GraphViewProps {
  flowRun: FlowRun;
  flowRef: FlowRef;
  backwardActive: string[];
  backwardSources?: string[];
  recordFolderPath: string;
  onNodeClick: (nodeId: string) => void;
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

function computeDepths(workflow: WorkflowGraph): Map<string, number> {
  const incomingCount = new Map<string, number>();
  const outgoing = new Map<string, string[]>();
  const queue: string[] = [];
  const depths = new Map<string, number>();

  for (const node of workflow.nodes) {
    incomingCount.set(node.id, 0);
    outgoing.set(node.id, []);
  }

  for (const edge of workflow.edges) {
    incomingCount.set(edge.to, (incomingCount.get(edge.to) ?? 0) + 1);
    outgoing.set(edge.from, [...(outgoing.get(edge.from) ?? []), edge.to]);
  }

  for (const node of workflow.nodes) {
    if ((incomingCount.get(node.id) ?? 0) === 0) {
      queue.push(node.id);
      depths.set(node.id, 0);
    }
  }

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const nextDepth = (depths.get(nodeId) ?? 0) + 1;
    for (const targetId of outgoing.get(nodeId) ?? []) {
      incomingCount.set(targetId, (incomingCount.get(targetId) ?? 1) - 1);
      depths.set(targetId, Math.max(depths.get(targetId) ?? 0, nextDepth));
      if ((incomingCount.get(targetId) ?? 0) === 0) {
        queue.push(targetId);
      }
    }
  }

  return depths;
}

function buildReactFlowState(
  workflow: WorkflowGraph,
  flowRun: FlowRun,
  backwardActive: string[],
  backwardSources: string[]
): { nodes: Node[]; edges: Edge[] } {
  const depths = computeDepths(workflow);
  const levels = new Map<number, Array<{ id: string; role: string }>>();

  for (const node of workflow.nodes) {
    const depth = depths.get(node.id) ?? 0;
    levels.set(depth, [...(levels.get(depth) ?? []), node]);
  }

  const nodes: Node[] = [];
  for (const [depth, group] of levels) {
    group.forEach((node, index) => {
      const isCompleted = flowRun.completedNodes.includes(node.id);
      const isBackward = backwardActive.includes(node.id);
      const openNodeIds = getOpenNodeIds(flowRun);
      const isBackwardSource = backwardSources.includes(node.id) && openNodeIds.includes(node.id);
      const isActive = openNodeIds.includes(node.id);

      let tone = 'node-neutral';
      if (isCompleted) tone = 'node-completed';
      else if (isBackward) tone = 'node-backward';
      else if (isBackwardSource) tone = 'node-backward-source';
      else if (isActive) tone = 'node-active';

      nodes.push({
        id: node.id,
        position: { x: depth * 280, y: index * 170 },
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
          width: 140,
          height: 140
        }
      });
    });
  }

  const edges: Edge[] = workflow.edges.map((edge) => ({
    id: `${edge.from}-${edge.to}`,
    source: edge.from,
    target: edge.to,
    type: 'straight',
    animated: false,
    style: {
      stroke: 'rgba(35, 48, 63, 0.35)',
      strokeWidth: 2
    }
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
    areStringArraysEqual(left.completedNodes, right.completedNodes)
  );
}

function GraphViewComponent({
  flowRun,
  flowRef,
  backwardActive,
  backwardSources: providedBackwardSources,
  recordFolderPath,
  onNodeClick,
  onWorkflowLoaded
}: GraphViewProps) {
  const [workflow, setWorkflow] = useState<WorkflowGraph | null>(null);
  const [error, setError] = useState<string | null>(null);
  const workflowRef = useRef<WorkflowGraph | null>(null);
  const reactFlowRef = useRef<ReactFlowInstance<Node, Edge> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadWorkflow = async () => {
      try {
        const response = await fetch(
          `/api/flows/${encodeURIComponent(flowRef.projectNamespace)}/${encodeURIComponent(flowRef.flowId)}/workflow`
        );
        if (!response.ok) {
          throw new Error(await response.text());
        }
        const graph = await response.json() as WorkflowGraph;
        if (cancelled) return;
        if (!areWorkflowGraphsEqual(workflowRef.current, graph)) {
          workflowRef.current = graph;
          setWorkflow(graph);
          onWorkflowLoaded?.(graph);
        }
        setError(null);
      } catch (loadError: unknown) {
        if (cancelled) return;
        workflowRef.current = null;
        setWorkflow(null);
        setError(loadError instanceof Error ? loadError.message : 'Unable to load workflow graph.');
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
  }, [flowRef.projectNamespace, flowRef.flowId, recordFolderPath, onWorkflowLoaded]);

  const backwardSources = useMemo(() => (
    workflow && providedBackwardSources && providedBackwardSources.length > 0
      ? providedBackwardSources
      : EMPTY_STRINGS
  ), [workflow, providedBackwardSources]);

  const graphState = useMemo(() => (
    workflow
      ? buildReactFlowState(workflow, flowRun, backwardActive, backwardSources)
      : EMPTY_GRAPH_STATE
  ), [workflow, flowRun, backwardActive, backwardSources]);

  const handleWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    if (!reactFlowRef.current || event.deltaY === 0) {
      return;
    }

    event.preventDefault();
    const currentZoom = reactFlowRef.current.getZoom();
    const zoomFactor = event.deltaY < 0 ? 1.18 : 1 / 1.18;
    const nextZoom = Math.max(0.2, Math.min(2.5, currentZoom * zoomFactor));
    void reactFlowRef.current.zoomTo(nextZoom, { duration: 80 });
  }, []);

  return (
    <section className="panel graph-panel">
      <div className="graph-panel-header">
        <div>
          <p className="eyebrow">Workflow Graph</p>
          <h2>{flowRun.recordName ?? flowRun.flowId}</h2>
          <p className="panel-copy">
            {flowRun.recordSummary ?? flowRun.projectNamespace}
          </p>
        </div>
        <div className="legend">
          <span><i className="legend-swatch legend-active" /> Active</span>
          <span><i className="legend-swatch legend-backward" /> Backward</span>
          <span><i className="legend-swatch legend-complete" /> Complete</span>
          <span><i className="legend-swatch legend-neutral" /> Pending</span>
        </div>
      </div>

      <div className="graph-meta-plain">
        <span>Project: {flowRun.projectNamespace}</span>
        <span className="graph-meta-sep">·</span>
        <span>Record: {flowRun.flowId}</span>
        <span className="graph-meta-sep">·</span>
        <span>State: {flowRun.status}</span>
        <span className="graph-meta-sep">·</span>
        <span>{recordFolderPath}</span>
      </div>

      <div className="graph-canvas" onWheelCapture={handleWheel}>
        {error ? <div className="graph-empty">{error}</div> : null}
        {!workflow && !error ? <div className="graph-empty">Loading workflow graph…</div> : null}
        {workflow ? (
          <ReactFlow
            nodes={graphState.nodes}
            edges={graphState.edges}
            fitView
            proOptions={{ hideAttribution: true }}
            onlyRenderVisibleElements
            nodesDraggable={false}
            panOnDrag={true}
            panOnScroll={true}
            zoomOnScroll={false}
            zoomOnPinch={true}
            onInit={(instance) => {
              reactFlowRef.current = instance;
            }}
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
    prev.onNodeClick === next.onNodeClick &&
    prev.onWorkflowLoaded === next.onWorkflowLoaded &&
    areGraphFlowRunsEqual(prev.flowRun, next.flowRun) &&
    areStringArraysEqual(prev.backwardActive, next.backwardActive) &&
    areStringArraysEqual(prev.backwardSources, next.backwardSources)
  );
}

export const GraphView = memo(GraphViewComponent, areGraphViewPropsEqual);

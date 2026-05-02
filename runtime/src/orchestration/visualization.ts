import type { FlowRun } from '../common/types.js';

interface WfGraph {
  nodes: Array<{ id: string; role: string }>;
  edges: Array<{ from: string; to: string }>;
}

export function renderFlowStatus(flowRun: FlowRun, wf: WfGraph): string {
  let output = `=== RUNTIME FLOW STATUS ===\n`;
  output += `Record Folder: ${flowRun.recordFolderPath}\n`;
  output += `Status: ${flowRun.status}\n`;
  if (flowRun.status === 'awaiting_human') {
    output += `Suspended: waiting for operator input\n`;
  }
  output += `\n`;

  // Ready/running/waiting nodes
  output += `Ready nodes:\n`;
  if (flowRun.readyNodes.length === 0) {
    output += `  (none)\n`;
  } else {
    // List in wf.nodes order
    const ready = wf.nodes.filter(n => flowRun.readyNodes.includes(n.id));
    for (const n of ready) {
      output += `  [→] ${n.id} (${n.role})\n`;
    }
  }
  output += `\n`;

  output += `Running nodes:\n`;
  if (flowRun.runningNodes.length === 0) {
    output += `  (none)\n`;
  } else {
    const running = wf.nodes.filter(n => flowRun.runningNodes.includes(n.id));
    for (const n of running) {
      output += `  [~] ${n.id} (${n.role})\n`;
    }
  }
  output += `\n`;

  output += `Awaiting human nodes:\n`;
  const awaitingIds = Object.keys(flowRun.awaitingHumanNodes);
  if (awaitingIds.length === 0) {
    output += `  (none)\n`;
  } else {
    const awaiting = wf.nodes.filter(n => awaitingIds.includes(n.id));
    for (const n of awaiting) {
      output += `  [?] ${n.id} (${n.role})\n`;
    }
  }
  output += `\n`;

  // Completed nodes
  output += `Completed nodes:\n`;
  if (flowRun.completedNodes.length === 0) {
    output += `  (none)\n`;
  } else {
    // List in wf.nodes order
    const completed = wf.nodes.filter(n => flowRun.completedNodes.includes(n.id));
    for (const n of completed) {
      output += `  [✓] ${n.id} (${n.role})\n`;
    }
  }

  // Pending joins
  const pendingJoins = findPendingJoins(flowRun, wf);
  if (pendingJoins.length > 0) {
    output += `\nPending joins:\n`;
    for (const pj of pendingJoins) {
      output += `  [ ] ${pj.id} (${pj.role}) — waiting for: ${pj.waiting.join(', ')}\n`;
    }
  }

  return output;
}

function findPendingJoins(flowRun: FlowRun, wf: WfGraph): Array<{ id: string; role: string; waiting: string[] }> {
  const incomingEdges: Record<string, string[]> = {};
  for (const edge of wf.edges) {
    incomingEdges[edge.to] = [...(incomingEdges[edge.to] ?? []), edge.from];
  }

  const hasRealizedIncomingEdge = (fromId: string, toId: string): boolean =>
    `${fromId}=>${toId}` in flowRun.completedEdgeArtifacts;

  return wf.nodes
    .filter(n => {
      const preds = incomingEdges[n.id] ?? [];
      if (preds.length <= 1) return false;
      if (flowRun.readyNodes.includes(n.id)) return false;
      if (flowRun.runningNodes.includes(n.id)) return false;
      if (n.id in flowRun.awaitingHumanNodes) return false;
      if (flowRun.completedNodes.includes(n.id)) return false;
      // At least one predecessor has produced its edge to this join.
      return preds.some(p => hasRealizedIncomingEdge(p, n.id));
    })
    .map(n => ({
      id: n.id,
      role: n.role,
      waiting: (incomingEdges[n.id] ?? []).filter(p => !hasRealizedIncomingEdge(p, n.id)),
    }));
}

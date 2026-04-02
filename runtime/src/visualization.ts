import type { FlowRun } from './types.js';

interface WfGraph {
  nodes: Array<{ id: string; role: string }>;
  edges: Array<{ from: string; to: string }>;
}

export function renderFlowStatus(flowRun: FlowRun, wf: WfGraph): string {
  let output = `=== RUNTIME FLOW STATUS ===\n`;
  output += `Record Folder: ${flowRun.recordFolderPath}\n`;
  output += `Status: ${flowRun.status}\n\n`;

  // Active nodes
  output += `Active nodes:\n`;
  if (flowRun.activeNodes.length === 0) {
    output += `  (none)\n`;
  } else {
    // List in wf.nodes order
    const active = wf.nodes.filter(n => flowRun.activeNodes.includes(n.id));
    for (const n of active) {
      output += `  [→] ${n.id} (${n.role})\n`;
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

  return wf.nodes
    .filter(n => {
      const preds = incomingEdges[n.id] ?? [];
      if (preds.length <= 1) return false;
      if (flowRun.activeNodes.includes(n.id)) return false;
      if (flowRun.completedNodes.includes(n.id)) return false;
      // At least one predecessor is completed
      return preds.some(p => flowRun.completedNodes.includes(p));
    })
    .map(n => ({
      id: n.id,
      role: n.role,
      waiting: (incomingEdges[n.id] ?? []).filter(p => !flowRun.completedNodes.includes(p)),
    }));
}

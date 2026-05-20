export interface ActiveNodeState {
  runningNodes: readonly string[];
  awaitingHumanNodes: Record<string, unknown>;
}

export function getActiveNodeIds(flowRun: ActiveNodeState): string[] {
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const nodeId of [
    ...flowRun.runningNodes,
    ...Object.keys(flowRun.awaitingHumanNodes)
  ]) {
    if (seen.has(nodeId)) continue;
    seen.add(nodeId);
    ids.push(nodeId);
  }
  return ids;
}

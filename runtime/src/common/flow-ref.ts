import type { FlowRef, FlowRun } from './types.js';

export function flowKey(ref: FlowRef): string {
  return `${ref.projectNamespace}/${ref.flowId}`;
}

export function flowRefFromRun(flowRun: Pick<FlowRun, 'projectNamespace' | 'flowId'>): FlowRef {
  return {
    projectNamespace: flowRun.projectNamespace,
    flowId: flowRun.flowId,
  };
}

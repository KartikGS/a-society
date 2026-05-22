import type { FlowRef } from '../types';

export function parseUrlFlowRef(): FlowRef | null {
  const pathMatch = window.location.pathname.match(/^\/projects\/([^/]+)\/flows\/([^/]+)$/);
  if (pathMatch) {
    return {
      projectNamespace: decodeURIComponent(pathMatch[1]),
      flowId: decodeURIComponent(pathMatch[2]),
    };
  }

  const params = new URLSearchParams(window.location.search);
  const projectNamespace = params.get('project');
  const flowId = params.get('flow');
  if (!projectNamespace || !flowId) return null;
  return { projectNamespace, flowId };
}

export function writeUrlFlowRef(ref: FlowRef | null): void {
  const url = new URL(window.location.href);
  if (ref) {
    url.pathname = `/projects/${encodeURIComponent(ref.projectNamespace)}/flows/${encodeURIComponent(ref.flowId)}`;
  } else {
    url.pathname = '/';
  }
  url.searchParams.delete('project');
  url.searchParams.delete('flow');
  window.history.replaceState({}, '', url);
}

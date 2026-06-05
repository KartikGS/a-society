import path from 'node:path';
import type { FlowRef } from '../common/types.js';

export function getStateRoot(workspaceRoot = process.cwd()): string {
  return path.join(path.resolve(workspaceRoot), '.a-society', 'state');
}

export function assertSafeStateSegment(label: string, value: string): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '.' || trimmed === '..' || trimmed.includes('/') || trimmed.includes('\\')) {
    throw new Error(`Invalid ${label} "${value}".`);
  }
  return trimmed;
}

export function getProjectStateDir(workspaceRoot: string, projectNamespace: string): string {
  const safeProject = assertSafeStateSegment('project namespace', projectNamespace);
  return path.join(getStateRoot(workspaceRoot), safeProject);
}

export function getFlowDir(workspaceRoot: string, ref: FlowRef): string {
  const safeFlowId = assertSafeStateSegment('flow id', ref.flowId);
  return path.join(getProjectStateDir(workspaceRoot, ref.projectNamespace), safeFlowId);
}

export function getFlowRecordDir(workspaceRoot: string, ref: FlowRef): string {
  return path.join(getFlowDir(workspaceRoot, ref), 'record');
}

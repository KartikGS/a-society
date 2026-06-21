import path from 'node:path';
import type { FlowRef } from '../common/types.js';
import { getWorkspaceRoot } from '../common/workspace.js';
import { parseRoleIdentity } from '../../shared/role-id.js';

export function getStateRoot(): string {
  return path.join(getWorkspaceRoot(), '.a-society', 'state');
}

export function assertSafeStateSegment(label: string, value: string): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '.' || trimmed === '..' || trimmed.includes('/') || trimmed.includes('\\')) {
    throw new Error(`Invalid ${label} "${value}".`);
  }
  return trimmed;
}

export function getProjectStateDir(projectNamespace: string): string {
  const safeProject = assertSafeStateSegment('project namespace', projectNamespace);
  return path.join(getStateRoot(), safeProject);
}

export function getFlowDir(ref: FlowRef): string {
  const safeFlowId = assertSafeStateSegment('flow id', ref.flowId);
  return path.join(getProjectStateDir(ref.projectNamespace), safeFlowId);
}

export function getFlowRecordDir(ref: FlowRef): string {
  return path.join(getFlowDir(ref), 'record');
}

export function getRoleStateDir(ref: FlowRef, roleInstanceId: string): string {
  const roleKey = parseRoleIdentity(roleInstanceId).instanceRoleId;
  return path.join(getFlowDir(ref), 'roles', roleKey);
}

export function getRoleStateFilePath(
  ref: FlowRef,
  roleInstanceId: string,
  fileName: string
): string {
  return path.join(
    getRoleStateDir(ref, roleInstanceId),
    assertSafeStateSegment('role state file name', fileName)
  );
}

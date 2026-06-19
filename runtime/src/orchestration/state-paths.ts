import path from 'node:path';
import type { FlowRef } from '../common/types.js';
import { parseRoleIdentity } from '../../shared/role-id.js';

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

export function getRoleStateDir(workspaceRoot: string, ref: FlowRef, roleInstanceId: string): string {
  const roleKey = parseRoleIdentity(roleInstanceId).instanceRoleId;
  return path.join(getFlowDir(workspaceRoot, ref), 'roles', roleKey);
}

export function getRoleStateFilePath(
  workspaceRoot: string,
  ref: FlowRef,
  roleInstanceId: string,
  fileName: string
): string {
  return path.join(
    getRoleStateDir(workspaceRoot, ref, roleInstanceId),
    assertSafeStateSegment('role state file name', fileName)
  );
}

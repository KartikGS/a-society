import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { clearWorkspaceRoot, getFrameworkRoot, setFrameworkRoot, setWorkspaceRoot } from '../../src/common/workspace.js';

describe('framework root singleton', () => {
  afterEach(() => clearWorkspaceRoot());

  it('defaults to <workspace>/a-society', () => {
    setWorkspaceRoot('/tmp/ws');
    expect(getFrameworkRoot()).toBe(path.resolve('/tmp/ws/a-society'));
  });

  it('prefers an explicitly set framework root', () => {
    setWorkspaceRoot('/tmp/ws');
    setFrameworkRoot('/tmp/elsewhere/a-society-dev');
    expect(getFrameworkRoot()).toBe(path.resolve('/tmp/elsewhere/a-society-dev'));
  });

  it('clearWorkspaceRoot clears both roots', () => {
    setWorkspaceRoot('/tmp/ws');
    setFrameworkRoot('/tmp/fw');
    clearWorkspaceRoot();
    expect(() => getFrameworkRoot()).toThrow('Workspace root is not configured');
    setWorkspaceRoot('/tmp/ws2');
    expect(getFrameworkRoot()).toBe(path.resolve('/tmp/ws2/a-society'));
  });
});

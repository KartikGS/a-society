import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

import os from 'node:os';
import path from 'node:path';
import { exec } from 'node:child_process';
import { TelemetryManager } from '../observability/observability.js';
import { startServer } from './server.js';

export function parsePort(rawPort: string | undefined): number {
  const parsed = Number(rawPort ?? '3000');
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error(`Invalid A_SOCIETY_UI_PORT value "${rawPort}". Expected an integer between 1 and 65535.`);
  }
  return parsed;
}

export function resolveWorkspaceRoot(): string {
  let current = path.dirname(fileURLToPath(import.meta.url));

  while (true) {
    if (path.basename(current) === 'runtime' && path.basename(path.dirname(current)) === 'a-society') {
      return path.dirname(path.dirname(current));
    }

    const parent = path.dirname(current);
    if (parent === current) {
      throw new Error('Could not resolve workspace root from the fixed a-society/runtime location.');
    }
    current = parent;
  }
}

function buildOpenCommand(url: string): string | null {
  switch (os.platform()) {
    case 'darwin':
      return `open "${url}"`;
    case 'win32':
      return `start "" "${url}"`;
    default:
      return `xdg-open "${url}"`;
  }
}

function openBrowser(url: string): void {
  const command = buildOpenCommand(url);
  if (!command) return;

  exec(command, (error) => {
    if (error) {
      process.stderr.write(`[runtime/server] Browser auto-open skipped: ${error.message}\n`);
    }
  });
}

async function main(): Promise<void> {
  const port = parsePort(process.env.A_SOCIETY_UI_PORT);
  const workspaceRoot = resolveWorkspaceRoot();
  const url = `http://localhost:${port}`;
  await startServer(workspaceRoot, port);
  openBrowser(url);
  process.stderr.write(`[runtime/server] UI available at ${url}\n`);
}

main().catch(async (error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  await TelemetryManager.shutdown();
  process.exit(1);
});

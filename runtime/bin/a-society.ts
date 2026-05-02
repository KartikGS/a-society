import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

import { TelemetryManager } from '../src/observability/observability.js';
TelemetryManager.init();

import os from 'node:os';
import { exec } from 'node:child_process';
import { startServer } from '../src/server/server.js';

function parsePort(rawPort: string | undefined): number {
  const parsed = Number(rawPort ?? '3000');
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error(`Invalid A_SOCIETY_UI_PORT value "${rawPort}". Expected an integer between 1 and 65535.`);
  }
  return parsed;
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

async function main() {
  const workspaceRoot = process.cwd();
  const port = parsePort(process.env.A_SOCIETY_UI_PORT);
  const url = `http://localhost:${port}`;

  try {
    await startServer(workspaceRoot, port);
    openBrowser(url);
    process.stderr.write(`[runtime/server] UI available at ${url}\n`);
  } catch (err: any) {
    process.stderr.write(`${err.message}\n`);
    process.exit(1);
  }
}

try {
  await main();
} catch (err: any) {
  console.error(`Fatal error:`, err);
  process.exit(1);
}

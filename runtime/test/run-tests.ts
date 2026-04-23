import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const runtimeRoot = path.resolve(testDir, '..');
const localTsx = path.join(runtimeRoot, 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.cmd' : 'tsx');
const tsxCommand = fs.existsSync(localTsx) ? localTsx : 'tsx';

function toPosixPath(filePath: string): string {
  return filePath.split(path.sep).join('/');
}

function discoverTests(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...discoverTests(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.test.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

function parseArgs(args: string[]): { filters: string[]; listOnly: boolean } {
  const filters: string[] = [];
  let listOnly = false;

  for (const arg of args) {
    if (arg === '--list') {
      listOnly = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log('Usage: tsx test/run-tests.ts [--list] [path-or-name-filter ...]');
      process.exit(0);
    } else if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`);
    } else {
      filters.push(arg);
    }
  }

  return { filters, listOnly };
}

function matchesFilters(relativePath: string, filters: string[]): boolean {
  return filters.every((filter) => relativePath.includes(filter));
}

const { filters, listOnly } = parseArgs(process.argv.slice(2));
const testFiles = discoverTests(testDir)
  .map((filePath) => toPosixPath(path.relative(runtimeRoot, filePath)))
  .filter((relativePath) => matchesFilters(relativePath, filters));

if (testFiles.length === 0) {
  console.error('[test-runner] No test files matched.');
  process.exit(1);
}

if (listOnly) {
  for (const testFile of testFiles) {
    console.log(testFile);
  }
  process.exit(0);
}

console.log(`[test-runner] Running ${testFiles.length} test file(s).`);

const failed: string[] = [];

for (let index = 0; index < testFiles.length; index++) {
  const testFile = testFiles[index];
  console.log(`\n[test-runner] ${index + 1}/${testFiles.length}: ${testFile}`);

  const result = spawnSync(tsxCommand, [testFile], {
    cwd: runtimeRoot,
    env: process.env,
    stdio: 'inherit'
  });

  if (result.error) {
    console.error(`[test-runner] Failed to launch ${testFile}: ${result.error.message}`);
    failed.push(testFile);
  } else if (result.signal) {
    console.error(`[test-runner] ${testFile} terminated with signal ${result.signal}.`);
    failed.push(testFile);
  } else if (result.status !== 0) {
    failed.push(testFile);
  }
}

if (failed.length > 0) {
  console.error(`\n[test-runner] ${failed.length} of ${testFiles.length} test file(s) failed:`);
  for (const testFile of failed) {
    console.error(`  - ${testFile}`);
  }
  process.exit(1);
}

console.log(`\n[test-runner] ${testFiles.length} test file(s) passed.`);

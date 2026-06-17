import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  parseFrontmatter,
  readVersionFrontmatter,
  parseVersion,
  compareVersions,
  evaluateProjectVersion,
} from '../../src/framework-services/version-comparator.js';

const tempDirs = new Set<string>();

function tempFile(content: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-version-'));
  tempDirs.add(dir);
  const filePath = path.join(dir, 'doc.md');
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}

afterEach(() => {
  for (const dir of tempDirs) fs.rmSync(dir, { recursive: true, force: true });
  tempDirs.clear();
});

describe('parseFrontmatter', () => {
  it('parses a leading YAML frontmatter block', () => {
    expect(parseFrontmatter('---\na_society_version: "0.2.0"\n---\n# Title\n')).toEqual({
      a_society_version: '0.2.0',
    });
  });

  it('returns null when there is no frontmatter', () => {
    expect(parseFrontmatter('# Title\n\nNo frontmatter here.\n')).toBeNull();
  });

  it('returns null for malformed YAML', () => {
    expect(parseFrontmatter('---\n: : :\n---\n')).toBeNull();
  });
});

describe('readVersionFrontmatter', () => {
  it('reads a quoted version string', () => {
    expect(readVersionFrontmatter(tempFile('---\na_society_version: "0.2.0"\n---\n'))).toBe('0.2.0');
  });

  it('coerces a numeric YAML value to a string', () => {
    expect(readVersionFrontmatter(tempFile('---\na_society_version: 0.2\n---\n'))).toBe('0.2');
  });

  it('returns null when the key is absent', () => {
    expect(readVersionFrontmatter(tempFile('---\nother: 1\n---\n'))).toBeNull();
  });

  it('returns null when the file does not exist', () => {
    expect(readVersionFrontmatter(path.join(os.tmpdir(), 'a-society-missing-version-file.md'))).toBeNull();
  });
});

describe('parseVersion / compareVersions', () => {
  it('parses dotted numeric versions', () => {
    expect(parseVersion('0.2.0')?.components).toEqual([0, 2, 0]);
  });

  it('rejects non-numeric versions', () => {
    expect(parseVersion('v37.0')).toBeNull();
    expect(parseVersion('latest')).toBeNull();
    expect(parseVersion('')).toBeNull();
  });

  it('treats missing trailing components as zero', () => {
    expect(compareVersions(parseVersion('0.2')!, parseVersion('0.2.0')!)).toBe(0);
  });

  it('orders by component significance', () => {
    expect(compareVersions(parseVersion('1.0.0')!, parseVersion('0.9.9')!)).toBeGreaterThan(0);
    expect(compareVersions(parseVersion('0.2.0')!, parseVersion('0.2.1')!)).toBeLessThan(0);
  });
});

describe('evaluateProjectVersion', () => {
  it('flags an update when the current version is newer', () => {
    expect(evaluateProjectVersion('0.1.0', '0.2.0')).toEqual({
      aDocsVersion: '0.1.0',
      currentVersion: '0.2.0',
      updateAvailable: true,
    });
  });

  it('does not flag an update when versions match', () => {
    expect(evaluateProjectVersion('0.2.0', '0.2.0').updateAvailable).toBe(false);
  });

  it('does not flag a downgrade', () => {
    expect(evaluateProjectVersion('0.3.0', '0.2.0').updateAvailable).toBe(false);
  });

  it('does not flag an update when either version is missing or unparseable', () => {
    expect(evaluateProjectVersion(null, '0.2.0').updateAvailable).toBe(false);
    expect(evaluateProjectVersion('0.1.0', null).updateAvailable).toBe(false);
    expect(evaluateProjectVersion('v37.0', '0.2.0').updateAvailable).toBe(false);
  });
});

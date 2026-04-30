import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

interface ManifestEntry {
  path: string;
  scaffold: string;
  source_path: string;
  required?: boolean;
  description?: string;
}

interface ScaffoldOptions {
  overwrite?: boolean;
  includeOptional?: boolean;
}

interface ScaffoldCreatedItem {
  path: string;
  scaffold: string;
  source: string;
}

interface ScaffoldSkippedItem {
  path: string;
  reason: string;
}

export interface ScaffoldResult {
  created: ScaffoldCreatedItem[];
  skipped: ScaffoldSkippedItem[];
  failed: ScaffoldSkippedItem[];
}

/**
 * Derives a human-readable title from a manifest entry's file path.
 * Used when generating stub file content.
 */
export function titleFromPath(entryPath: string): string {
  const base = path.basename(entryPath, '.md');
  return base
    .replace(/^TEMPLATE-/, 'Template: ')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Renders the content for a stub file.
 */
export function renderStub(entry: ManifestEntry): string {
  if (entry.path.endsWith('.yaml') || entry.path.endsWith('.yml')) {
    if (entry.path === 'workflow/main.yaml' || entry.path === 'workflow/main.yml') {
      return `# Stub — fill in per ${entry.source_path}\nworkflow:\n  name: <project workflow>\n  summary: <one-line workflow summary>\n  nodes: []\n  edges: []\n`;
    }
    const roleMatch = entry.path.match(/^roles\/([^/]+)\/(required-readings|ownership)\.ya?ml$/);
    if (roleMatch) {
      const [, roleId, kind] = roleMatch;
      if (kind === 'required-readings') {
        return `# Stub — fill in per ${entry.source_path}\nrole: ${roleId}\nrequired_readings: []\n`;
      }
      return `# Stub — fill in per ${entry.source_path}\nrole: ${roleId}\nsurfaces: []\n`;
    }
    return `# Stub — fill in per ${entry.source_path}\n`;
  }

  const title = titleFromPath(entry.path);
  return `# ${title}\n\n<!-- Stub — fill in per ${entry.source_path} -->\n`;
}

/**
 * Creates the a-docs/ folder structure and files for a new project.
 *
 * For each entry in `entries`:
 *   - scaffold: 'copy'  → copies source file from aSocietyRoot/source_path verbatim
 *   - scaffold: 'stub'  → writes a minimal titled stub pointing to the instruction source
 *
 * Does not overwrite existing files unless options.overwrite is true.
 */
export function scaffold(
  projectRoot: string,
  projectName: string,
  aSocietyRoot: string,
  entries: ManifestEntry[],
  options: ScaffoldOptions = {},
): ScaffoldResult {
  if (!projectRoot) throw new Error('projectRoot is required');
  if (!projectName) throw new Error('projectName is required');
  if (!aSocietyRoot) throw new Error('aSocietyRoot is required');
  if (!Array.isArray(entries)) throw new Error('entries must be an array');

  const { overwrite = false } = options;
  const aDocsRoot = path.join(projectRoot, 'a-docs');

  const created: ScaffoldCreatedItem[] = [];
  const skipped: ScaffoldSkippedItem[] = [];
  const failed: ScaffoldSkippedItem[] = [];

  for (const entry of entries) {
    if (!entry.path || !entry.scaffold) {
      failed.push({ path: String(entry.path || ''), reason: 'Entry missing required fields: path, scaffold' });
      continue;
    }

    const targetPath = path.join(aDocsRoot, entry.path);

    // Skip existing files unless overwrite is set
    if (fs.existsSync(targetPath) && !overwrite) {
      skipped.push({ path: targetPath, reason: 'already-existed' });
      continue;
    }

    // Ensure parent directory exists
    try {
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    } catch (err) {
      failed.push({ path: targetPath, reason: `Cannot create directory: ${(err as Error).message}` });
      continue;
    }

    if (entry.scaffold === 'copy') {
      // Generic copy: read source and write to target
      const sourcePath = path.join(aSocietyRoot, entry.source_path);
      try {
        const content = fs.readFileSync(sourcePath, 'utf8');
        fs.writeFileSync(targetPath, content, 'utf8');
        created.push({ path: targetPath, scaffold: 'copy', source: sourcePath });
      } catch (err) {
        failed.push({ path: targetPath, reason: `Cannot copy from ${sourcePath}: ${(err as Error).message}` });
      }

    } else if (entry.scaffold === 'stub') {
      // Stub: write a minimal titled placeholder
      try {
        fs.writeFileSync(targetPath, renderStub(entry), 'utf8');
        created.push({ path: targetPath, scaffold: 'stub', source: entry.source_path || '' });
      } catch (err) {
        failed.push({ path: targetPath, reason: `Cannot write stub: ${(err as Error).message}` });
      }

    } else {
      failed.push({ path: targetPath, reason: `Unknown scaffold type: "${entry.scaffold}"` });
    }
  }

  return { created, skipped, failed };
}

/**
 * Loads a manifest YAML file and runs scaffold() against it.
 *
 * Filters to required-only entries by default. Pass `options.includeOptional: true`
 * to include entries with `required: false`.
 */
export function scaffoldFromManifestFile(
  projectRoot: string,
  projectName: string,
  aSocietyRoot: string,
  manifestFilePath: string,
  options: ScaffoldOptions = {},
): ScaffoldResult {
  const { includeOptional = false } = options;

  let content: string;
  try {
    content = fs.readFileSync(manifestFilePath, 'utf8');
  } catch (err) {
    throw new Error(`Cannot read manifest file: ${(err as Error).message}`);
  }

  let doc: unknown;
  try {
    doc = yaml.load(content);
  } catch (err) {
    throw new Error(`Cannot parse manifest YAML: ${(err as Error).message}`);
  }
  const d = doc as any;
  if (!d || !Array.isArray(d.files)) {
    throw new Error('Manifest must contain a "files" array');
  }

  const entries: ManifestEntry[] = includeOptional ? d.files : d.files.filter((f: any) => f.required === true);

  return scaffold(projectRoot, projectName, aSocietyRoot, entries, options);
}

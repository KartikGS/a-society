import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import type { FlowRun } from '../common/types.js';
import { resolveProjectRecordsRoot, resolveProjectRoot } from './draft-flow.js';
import { scaffoldFromManifestFile, type ScaffoldResult } from '../framework-services/scaffolding-system.js';
import { buildRecordId, syncRecordMetadataFromWorkflow } from './record-metadata.js';

export type InitializationMode = 'takeover' | 'greenfield';

export interface InitializationBootstrapResult {
  flowRun: FlowRun;
  scaffoldResult: ScaffoldResult;
}

const RUNTIME_INITIALIZATION_RELATIVE_PATH = path.join('a-society', 'runtime', 'contracts', 'initialization.md');

function sanitizeProjectVariablePrefix(projectNamespace: string): string {
  const normalized = projectNamespace
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_')
    .toUpperCase();

  return normalized || 'PROJECT';
}

function validateProjectNamespace(projectNamespace: string): string {
  const trimmed = projectNamespace.trim();
  if (!trimmed) {
    throw new Error('Project name is required.');
  }
  if (trimmed === '.' || trimmed === '..') {
    throw new Error('Project name must not be "." or "..".');
  }
  if (trimmed.includes('/') || trimmed.includes('\\')) {
    throw new Error('Project name must not contain path separators.');
  }
  return trimmed;
}

function buildBootstrapIndex(projectNamespace: string): string {
  const prefix = sanitizeProjectVariablePrefix(projectNamespace);
  const projectPath = (relativePath: string) => path.posix.join(projectNamespace, relativePath);

  const rows: Array<{ variable: string; currentPath: string; description: string }> = [
    {
      variable: `$${prefix}_INDEX`,
      currentPath: projectPath('a-docs/indexes/main.md'),
      description: 'Project path index — bootstrap registry for initialization'
    },
    {
      variable: `$${prefix}_AGENTS`,
      currentPath: projectPath('a-docs/agents.md'),
      description: 'Agent entry point — scaffolded during initialization'
    },
    {
      variable: `$${prefix}_A_DOCS_GUIDE`,
      currentPath: projectPath('a-docs/a-docs-guide.md'),
      description: 'a-docs rationale guide — scaffolded during initialization'
    },
    {
      variable: `$${prefix}_VISION`,
      currentPath: projectPath('a-docs/project-information/vision.md'),
      description: 'Project vision — scaffolded during initialization'
    },
    {
      variable: `$${prefix}_STRUCTURE`,
      currentPath: projectPath('a-docs/project-information/structure.md'),
      description: 'Project structure — scaffolded during initialization'
    },
    {
      variable: `$${prefix}_LOG`,
      currentPath: projectPath('a-docs/project-information/log.md'),
      description: 'Project log — scaffolded during initialization'
    },
    {
      variable: `$${prefix}_OWNER_ROLE`,
      currentPath: projectPath('a-docs/roles/owner/main.md'),
      description: 'Owner role — scaffolded coordinator contract'
    },
    {
      variable: `$${prefix}_OWNER_REQUIRED_READINGS`,
      currentPath: projectPath('a-docs/roles/owner/required-readings.yaml'),
      description: 'Owner startup context authority — bootstrap seed'
    },
    {
      variable: `$${prefix}_OWNER_OWNERSHIP`,
      currentPath: projectPath('a-docs/roles/owner/ownership.yaml'),
      description: 'Owner ownership file — scaffolded accountability stub'
    },
    {
      variable: `$${prefix}_WORKFLOW`,
      currentPath: projectPath('a-docs/workflow/main.yaml'),
      description: 'Canonical workflow definition — scaffolded during initialization'
    }
  ];

  const lines = [
    '# Project Path Index',
    '',
    'This bootstrap index was created by the runtime to seed initialization. Expand and refine it during initialization.',
    '',
    '| Variable | Current Path | Description |',
    '|---|---|---|',
    ...rows.map((row) => `| \`${row.variable}\` | \`${row.currentPath}\` | ${row.description} |`)
  ];

  return lines.join('\n') + '\n';
}

function buildBootstrapOwnerRequiredReadings(projectNamespace: string): string {
  const prefix = sanitizeProjectVariablePrefix(projectNamespace);
  return [
    'role: owner',
    'required_readings:',
    `  - $${prefix}_INDEX`,
    `  - $${prefix}_OWNER_ROLE`
  ].join('\n') + '\n';
}

function seedBootstrapContextFiles(projectRoot: string, projectNamespace: string): void {
  fs.writeFileSync(
    path.join(projectRoot, 'a-docs', 'indexes', 'main.md'),
    buildBootstrapIndex(projectNamespace),
    'utf8'
  );
  fs.writeFileSync(
    path.join(projectRoot, 'a-docs', 'roles', 'owner', 'required-readings.yaml'),
    buildBootstrapOwnerRequiredReadings(projectNamespace),
    'utf8'
  );
}

function formatScaffoldSummary(scaffoldResult: ScaffoldResult): string[] {
  const lines: string[] = [];
  lines.push(`- Created: ${scaffoldResult.created.length}`);
  lines.push(`- Skipped: ${scaffoldResult.skipped.length}`);
  lines.push(`- Failed: ${scaffoldResult.failed.length}`);

  if (scaffoldResult.created.length > 0) {
    lines.push('- Created paths:');
    for (const item of scaffoldResult.created.slice(0, 15)) {
      lines.push(`  - ${item.path}`);
    }
  }

  if (scaffoldResult.skipped.length > 0) {
    lines.push('- Skipped paths:');
    for (const item of scaffoldResult.skipped.slice(0, 10)) {
      lines.push(`  - ${item.path} (${item.reason})`);
    }
  }

  return lines;
}

function listTopLevelProjectEntries(projectRoot: string): string[] {
  const entries = fs.readdirSync(projectRoot, { withFileTypes: true })
    .map((entry) => `${entry.name}${entry.isDirectory() ? '/' : ''}`)
    .sort((left, right) => left.localeCompare(right));

  return entries.slice(0, 25);
}

function buildInitializationBrief(
  workspaceRoot: string,
  projectNamespace: string,
  projectRoot: string,
  recordFolderPath: string,
  mode: InitializationMode,
  scaffoldResult: ScaffoldResult
): string {
  const relativeRecordFolder = path.relative(workspaceRoot, recordFolderPath);
  const topLevelEntries = listTopLevelProjectEntries(projectRoot);
  const lines = [
    '# Runtime Initialization Brief',
    '',
    `- Mode: ${mode}`,
    `- Project namespace: ${projectNamespace}`,
    `- Project root: ${projectRoot}`,
    `- Record folder: ${relativeRecordFolder}`,
    '',
    '## Runtime intent',
    '',
    mode === 'greenfield'
      ? 'This is a brand-new project. The runtime already created the project folder and scaffolded the compulsory `a-docs/` surfaces. Gather the missing project truth interactively, then replace scaffold placeholders with real content.'
      : 'This is an existing project without `a-docs/`. The runtime already scaffolded the compulsory `a-docs/` surfaces. Read the existing project first, infer what you can, then ask only the questions needed to fill the missing truth.',
    '',
    '## Scaffold summary',
    '',
    ...formatScaffoldSummary(scaffoldResult),
    '',
    '## Existing top-level project entries',
    '',
    ...(topLevelEntries.length > 0
      ? topLevelEntries.map((entry) => `- ${entry}`)
      : ['- (No project files existed before scaffold.)']),
    '',
    '## Required outcomes for this initialization flow',
    '',
    '- Fill the compulsory scaffolded `a-docs/` surfaces with project-specific content rather than recreating them.',
    '- Replace template or placeholder language in the scaffolded role and project documents.',
    '- Populate `a-docs/indexes/main.md` beyond the runtime bootstrap seed if additional variables are needed.',
    '- Expand `a-docs/roles/owner/required-readings.yaml` so future Owner sessions have the startup context they actually need.',
    '- Keep all writes inside this project\'s `a-docs/` during this initialization flow.',
    '- Close the flow only when the scaffolded `a-docs/` are usable for normal Owner-led work.'
  ];

  return lines.join('\n') + '\n';
}

function buildInitializationWorkflowDocument(): string {
  return yaml.dump({
    workflow: {
      name: 'Runtime Project Initialization',
      summary: 'Runtime-created single-node Owner flow for project initialization.',
      nodes: [
        {
          id: 'owner-intake',
          role: 'Owner',
          'human-collaborative': 'direction',
          guidance: [
            'This is a runtime-created initialization flow.',
            'Use the runtime initialization guide and initialization brief as the authoritative instructions for this flow.',
            'The runtime already scaffolded the compulsory a-docs files; fill those files rather than recreating them.',
            'Ask batched questions only after reading what the project already reveals.',
            'When the compulsory scaffolded surfaces are populated enough for normal Owner-led work, close the forward pass from this node.'
          ],
          inputs: [
            'Runtime initialization guide artifact',
            'Runtime initialization brief artifact',
            'Scaffolded a-docs permanent files',
            'Existing project files when present'
          ],
          work: [
            'Determine the project truth needed to populate the scaffolded a-docs.',
            'For takeover flows: read the existing project before asking questions.',
            'For greenfield flows: gather the minimum viable project truth interactively.',
            'Rewrite scaffold placeholders into real project content.',
            'Keep the flow Owner-only unless the runtime later introduces a richer initialization workflow.'
          ],
          outputs: [
            'Updated scaffolded a-docs files',
            'Owner-authored initialization artifacts in the record folder',
            'A forward-pass closure artifact when initialization is complete'
          ],
          notes: [
            'This node is the sole forward-pass node for runtime initialization.',
            'The runtime seeded a minimal index and Owner required-readings file; treat them as starting points, not finished project truth.'
          ]
        }
      ],
      edges: []
    }
  }, { noRefs: true, lineWidth: 120 });
}

function buildInitializationArtifacts(
  workspaceRoot: string,
  projectNamespace: string,
  projectRoot: string,
  recordFolderPath: string,
  scaffoldResult: ScaffoldResult,
  mode: InitializationMode
): string[] {
  const briefPath = path.join(recordFolderPath, '00-runtime-initialization-brief.md');
  fs.writeFileSync(
    briefPath,
    buildInitializationBrief(workspaceRoot, projectNamespace, projectRoot, recordFolderPath, mode, scaffoldResult),
    'utf8'
  );

  return [
    RUNTIME_INITIALIZATION_RELATIVE_PATH,
    path.relative(workspaceRoot, briefPath)
  ];
}

export function bootstrapInitializationFlow(
  workspaceRoot: string,
  projectNamespace: string,
  mode: InitializationMode
): InitializationBootstrapResult {
  const namespace = validateProjectNamespace(projectNamespace);
  const projectRoot = resolveProjectRoot(workspaceRoot, namespace);

  if (mode === 'greenfield') {
    if (fs.existsSync(projectRoot)) {
      throw new Error(`Project "${namespace}" already exists in the workspace.`);
    }
    fs.mkdirSync(projectRoot, { recursive: true });
  } else {
    if (!fs.existsSync(projectRoot) || !fs.statSync(projectRoot).isDirectory()) {
      throw new Error(`Project "${namespace}" was not found in the workspace.`);
    }
  }

  const aSocietyRoot = path.join(workspaceRoot, 'a-society');
  const manifestPath = path.join(aSocietyRoot, 'general', 'manifest.yaml');
  const runtimeInitializationPath = path.join(workspaceRoot, RUNTIME_INITIALIZATION_RELATIVE_PATH);

  if (!fs.existsSync(aSocietyRoot)) {
    throw new Error(`A-Society root not found at ${aSocietyRoot}.`);
  }
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest not found at ${manifestPath}.`);
  }
  if (!fs.existsSync(runtimeInitializationPath)) {
    throw new Error(`Runtime initialization guide not found at ${runtimeInitializationPath}.`);
  }

  const scaffoldResult = scaffoldFromManifestFile(
    projectRoot,
    namespace,
    aSocietyRoot,
    manifestPath,
    { overwrite: false }
  );

  if (scaffoldResult.failed.length > 0) {
    const failureSummary = scaffoldResult.failed
      .map((item) => `${item.path}: ${item.reason}`)
      .join('; ');
    throw new Error(`Scaffold failed: ${failureSummary}`);
  }

  seedBootstrapContextFiles(projectRoot, namespace);

  const flowId = buildRecordId();
  const recordsRoot = resolveProjectRecordsRoot(workspaceRoot, namespace);
  fs.mkdirSync(recordsRoot, { recursive: true });

  const recordFolderPath = path.join(recordsRoot, flowId);
  fs.mkdirSync(recordFolderPath, { recursive: true });

  fs.writeFileSync(
    path.join(recordFolderPath, 'workflow.yaml'),
    buildInitializationWorkflowDocument(),
    'utf8'
  );
  syncRecordMetadataFromWorkflow(recordFolderPath, flowId);

  const activeArtifacts = buildInitializationArtifacts(
    workspaceRoot,
    namespace,
    projectRoot,
    recordFolderPath,
    scaffoldResult,
    mode
  );

  return {
    flowRun: {
      flowId,
      workspaceRoot,
      projectNamespace: namespace,
      recordFolderPath,
      readyNodes: ['owner-intake'],
      runningNodes: [],
      awaitingHumanNodes: {},
      completedNodes: [],
      visitedNodeIds: [],
      completedEdgeArtifacts: {},
      pendingNodeArtifacts: {
        'owner-intake': activeArtifacts
      },
      status: 'running',
      stateVersion: '7',
      feedbackContext: {
        kind: 'initialization',
        initializationMode: mode,
      }
    },
    scaffoldResult
  };
}

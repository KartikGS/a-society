import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { CURRENT_FLOW_STATE_VERSION, type FlowRun } from '../common/types.js';
import { resolveProjectRoot } from './draft-flow.js';
import { scaffoldFromManifestFile, type ScaffoldResult } from '../framework-services/scaffolding-system.js';
import { buildFlowId, syncRecordMetadataFromWorkflow } from './record-metadata.js';
import {
  RUNTIME_ADOCS_MANIFEST_RELATIVE_PATH,
  A_SOCIETY_CHANGELOG_RELATIVE_PATH,
  A_DOCS_VERSION_RECORD_RELATIVE_PATH,
} from '../common/runtime-contracts.js';
import { readVersionFrontmatter } from '../framework-services/version-comparator.js';
import { getFlowRecordDir } from '../orchestration/state-paths.js';

export type InitializationMode = 'takeover' | 'greenfield';

export interface InitializationBootstrapResult {
  flowRun: FlowRun;
  scaffoldResult: ScaffoldResult;
}

const RUNTIME_INITIALIZATION_RELATIVE_PATH = path.join('a-society', 'runtime', 'contracts', 'initialization.md');
const A_SOCIETY_GENERAL_INDEX_RELATIVE_PATH = path.join('a-society', 'index.md');

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
  // Index paths are project-relative: they are resolved under the project root,
  // so they stay correct regardless of the folder the project lives in.
  const projectPath = (relativePath: string) => relativePath;

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
    'Paths in this table are **project-relative** — relative to this project\'s root (the folder containing `a-docs/`), not the workspace. Write `a-docs/agents.md`, not `<project>/a-docs/agents.md`.',
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

function buildVersionRecord(version: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return [
    '---',
    `a_society_version: "${version}"`,
    '---',
    '',
    '# A-Society Version Record',
    '',
    `This project's \`a-docs/\` conform to A-Society **${version}**.`,
    '',
    'The authoritative value is `a_society_version` in the frontmatter above. The',
    'runtime compares it against the canonical current version (the',
    '`a_society_version` in A-Society\'s `CHANGELOG.md`) to decide whether an update',
    'flow is offered for this project. The Owner bumps this version during an update',
    'flow.',
    '',
    '## Applied Updates',
    '',
    '| Version After | Date | Notes |',
    '|---|---|---|',
    `| ${version} | ${today} | Stamped at initialization. |`,
    '',
  ].join('\n');
}

/**
 * Overwrites the scaffolded version-record stub with the framework version
 * current at initialization time, recorded in YAML frontmatter. The version
 * record is compulsory, so a readable current version must exist.
 */
function stampVersionRecord(projectRoot: string, currentVersion: string): void {
  fs.writeFileSync(
    path.join(projectRoot, 'a-docs', A_DOCS_VERSION_RECORD_RELATIVE_PATH),
    buildVersionRecord(currentVersion),
    'utf8'
  );
}

function buildInitializationBrief(
  workspaceRoot: string,
  projectNamespace: string,
  projectRoot: string,
  recordFolderPath: string,
  mode: InitializationMode
): string {
  const relativeRecordFolder = path.relative(workspaceRoot, recordFolderPath);
  const modeGuidance = mode === 'greenfield'
    ? [
        '- Gather the minimum project truth interactively.',
        '- Ask for project purpose, outputs, intended users, workflow, contributors, tools, and major constraints.',
        '- Keep the questioning practical and batched.',
        '- Fill the scaffolded `a-docs/` from those answers.'
      ]
    : [
        '- Inspect existing non-`a-docs/` project files before asking questions.',
        '- Infer what you can from the existing files and folder structure.',
        '- Ask only the questions required to fill the missing truth.',
        '- Document the project as it exists rather than redesigning it.'
      ];
  const lines = [
    '# Runtime Initialization Brief',
    '',
    `- Mode: ${mode}`,
    `- Project namespace: ${projectNamespace}`,
    `- Project root: ${projectRoot}`,
    `- Record folder: ${relativeRecordFolder}`,
    '',
    '## Mode-specific guidance',
    '',
    ...modeGuidance,
  ];

  return lines.join('\n') + '\n';
}

function buildInitializationWorkflowDocument(
  initializationGuideContent: string,
  initializationBriefContent: string,
  generalIndexContent: string
): string {
  return yaml.dump({
    workflow: {
      name: 'Runtime Project Initialization',
      summary: 'Runtime-created single-node Owner flow for project initialization.',
      nodes: [
        {
          id: 'owner-intake',
          role: 'owner',
          'human-collaborative': 'direction',
          guidance: [
            'Use the runtime workflow contract when creating or updating workflow.yaml for this initialization flow.',
            `Runtime initialization guide:\n\n${initializationGuideContent.trim()}`,
            `Runtime initialization brief:\n\n${initializationBriefContent.trim()}`,
            `A-Society general index:\n\n${generalIndexContent.trim()}`
          ]
        }
      ],
      edges: []
    }
  }, { noRefs: true, lineWidth: 120 });
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
  const manifestPath = path.join(workspaceRoot, RUNTIME_ADOCS_MANIFEST_RELATIVE_PATH);
  const runtimeInitializationPath = path.join(workspaceRoot, RUNTIME_INITIALIZATION_RELATIVE_PATH);
  const aSocietyGeneralIndexPath = path.join(workspaceRoot, A_SOCIETY_GENERAL_INDEX_RELATIVE_PATH);
  const changelogPath = path.join(workspaceRoot, A_SOCIETY_CHANGELOG_RELATIVE_PATH);

  if (!fs.existsSync(aSocietyRoot)) {
    throw new Error(`A-Society root not found at ${aSocietyRoot}.`);
  }
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Runtime a-docs manifest not found at ${manifestPath}.`);
  }
  if (!fs.existsSync(runtimeInitializationPath)) {
    throw new Error(`Runtime initialization guide not found at ${runtimeInitializationPath}.`);
  }
  if (!fs.existsSync(aSocietyGeneralIndexPath)) {
    throw new Error(`A-Society general index not found at ${aSocietyGeneralIndexPath}.`);
  }

  const currentVersion = readVersionFrontmatter(changelogPath);
  if (!currentVersion) {
    throw new Error(`A-Society changelog at ${changelogPath} is missing a readable "a_society_version" frontmatter value.`);
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
  stampVersionRecord(projectRoot, currentVersion);

  const flowId = buildFlowId();
  const recordFolderPath = getFlowRecordDir(workspaceRoot, { projectNamespace: namespace, flowId });
  fs.mkdirSync(recordFolderPath, { recursive: true });

  const initializationGuideContent = fs.readFileSync(runtimeInitializationPath, 'utf8');
  const generalIndexContent = fs.readFileSync(aSocietyGeneralIndexPath, 'utf8');
  const initializationBriefContent = buildInitializationBrief(
    workspaceRoot,
    namespace,
    projectRoot,
    recordFolderPath,
    mode
  );

  fs.writeFileSync(
    path.join(recordFolderPath, 'workflow.yaml'),
    buildInitializationWorkflowDocument(initializationGuideContent, initializationBriefContent, generalIndexContent),
    'utf8'
  );
  syncRecordMetadataFromWorkflow(recordFolderPath);

  return {
    flowRun: {
      flowId,
      workspaceRoot,
      projectNamespace: namespace,
      recordFolderPath,
      runningNodes: ['owner-intake'],
      awaitingHumanNodes: {},
      pendingHumanInputs: {},
      visitedNodeIds: [],
      completedHandoffs: [],
      receivingHandoff: {},
      historyHandoff: {},
      awaitingHandoff: [],
      status: 'running',
      stateVersion: CURRENT_FLOW_STATE_VERSION,
      feedbackContext: {
        kind: 'initialization',
        initializationMode: mode,
      }
    },
    scaffoldResult
  };
}

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { CURRENT_FLOW_STATE_VERSION, type FlowRun } from '../common/types.js';
import { getWorkspaceRoot } from '../common/workspace.js';
import { resolveProjectRoot } from './draft-flow.js';
import { buildFlowId, syncRecordMetadataFromWorkflow } from './record-metadata.js';
import {
  A_SOCIETY_CHANGELOG_RELATIVE_PATH,
  A_DOCS_VERSION_RECORD_RELATIVE_PATH,
} from '../common/runtime-contracts.js';
import { readVersionFrontmatter, evaluateProjectVersion } from '../framework-services/version-comparator.js';
import { getFlowRecordDir } from '../orchestration/state-paths.js';

export interface UpdateBootstrapResult {
  flowRun: FlowRun;
}

const RUNTIME_UPDATE_RELATIVE_PATH = path.join('a-society', 'runtime', 'contracts', 'update.md');
const A_SOCIETY_GENERAL_INDEX_RELATIVE_PATH = path.join('a-society', 'index.md');

function buildUpdateBrief(
  projectNamespace: string,
  projectRoot: string,
  recordFolderPath: string,
  fromVersion: string | null,
  toVersion: string,
  changelogContent: string
): string {
  const workspaceRoot = getWorkspaceRoot();
  const relativeRecordFolder = path.relative(workspaceRoot, recordFolderPath);
  const lines = [
    '# Runtime Update Brief',
    '',
    `- Project namespace: ${projectNamespace}`,
    `- Project root: ${projectRoot}`,
    `- Record folder: ${relativeRecordFolder}`,
    `- Version this project conforms to: ${fromVersion ?? 'unknown (no readable version record)'}`,
    `- Target version: ${toVersion}`,
    '',
    'Follow the runtime update guide for how to work this flow. The changelog below is the delta to apply.',
    '',
    '## A-Society changelog',
    '',
    changelogContent.trim(),
  ];

  return lines.join('\n') + '\n';
}

function buildUpdateWorkflowDocument(
  updateGuideContent: string,
  updateBriefContent: string,
  generalIndexContent: string
): string {
  return yaml.dump({
    workflow: {
      name: 'Runtime Project Update',
      summary: 'Runtime-created single-node Owner flow for migrating an initialized project to the current A-Society version.',
      nodes: [
        {
          id: 'owner-intake',
          role: 'owner',
          work: [
            'Use the runtime workflow contract when creating or updating workflow.yaml for this update flow.',
            `Runtime update guide:\n\n${updateGuideContent.trim()}`,
            `Runtime update brief:\n\n${updateBriefContent.trim()}`,
            `A-Society general index:\n\n${generalIndexContent.trim()}`
          ]
        }
      ],
      edges: []
    }
  }, { noRefs: true, lineWidth: 120 });
}

/**
 * Sets up an Owner-only update flow for an already-initialized project. Mirrors
 * the initialization bootstrap shape: a single Owner intake node with
 * update-specific context injected, a fresh record folder, and an update
 * feedback context carrying the from/to versions.
 *
 * Does not scaffold or modify the project's a-docs/ — the Owner does that during
 * the flow.
 */
export function bootstrapUpdateFlow(
  projectNamespace: string
): UpdateBootstrapResult {
  const namespace = projectNamespace.trim();
  if (!namespace) {
    throw new Error('Project name is required.');
  }

  const workspaceRoot = getWorkspaceRoot();
  const projectRoot = resolveProjectRoot(namespace);
  const aDocsRoot = path.join(projectRoot, 'a-docs');
  if (!fs.existsSync(aDocsRoot) || !fs.statSync(aDocsRoot).isDirectory()) {
    throw new Error(`Project "${namespace}" has no a-docs/ to update.`);
  }

  const changelogPath = path.join(workspaceRoot, A_SOCIETY_CHANGELOG_RELATIVE_PATH);
  const updateGuidePath = path.join(workspaceRoot, RUNTIME_UPDATE_RELATIVE_PATH);
  const generalIndexPath = path.join(workspaceRoot, A_SOCIETY_GENERAL_INDEX_RELATIVE_PATH);

  if (!fs.existsSync(updateGuidePath)) {
    throw new Error(`Runtime update guide not found at ${updateGuidePath}.`);
  }
  if (!fs.existsSync(generalIndexPath)) {
    throw new Error(`A-Society general index not found at ${generalIndexPath}.`);
  }
  if (!fs.existsSync(changelogPath)) {
    throw new Error(`A-Society changelog not found at ${changelogPath}.`);
  }

  const currentVersion = readVersionFrontmatter(changelogPath);
  if (!currentVersion) {
    throw new Error(`A-Society changelog at ${changelogPath} is missing a readable "a_society_version" frontmatter value.`);
  }

  const aDocsVersion = readVersionFrontmatter(path.join(aDocsRoot, A_DOCS_VERSION_RECORD_RELATIVE_PATH));
  const status = evaluateProjectVersion(aDocsVersion, currentVersion);
  if (!status.updateAvailable) {
    throw new Error(
      `Project "${namespace}" is already up to date (a-docs version ${aDocsVersion ?? 'unknown'}, current ${currentVersion}).`
    );
  }

  const flowId = buildFlowId();
  const recordFolderPath = getFlowRecordDir({ projectNamespace: namespace, flowId });
  fs.mkdirSync(recordFolderPath, { recursive: true });

  const updateGuideContent = fs.readFileSync(updateGuidePath, 'utf8');
  const generalIndexContent = fs.readFileSync(generalIndexPath, 'utf8');
  const changelogContent = fs.readFileSync(changelogPath, 'utf8');
  const updateBriefContent = buildUpdateBrief(
    namespace,
    projectRoot,
    recordFolderPath,
    aDocsVersion,
    currentVersion,
    changelogContent
  );

  fs.writeFileSync(
    path.join(recordFolderPath, 'workflow.yaml'),
    buildUpdateWorkflowDocument(updateGuideContent, updateBriefContent, generalIndexContent),
    'utf8'
  );
  syncRecordMetadataFromWorkflow(recordFolderPath);

  const feedbackContext: FlowRun['feedbackContext'] = { kind: 'update', updateToVersion: currentVersion };
  if (aDocsVersion) feedbackContext.updateFromVersion = aDocsVersion;

  return {
    flowRun: {
      flowId,
      workspaceRoot,
      projectNamespace: namespace,
      recordFolderPath,
      runningNodes: ['owner-intake'],
      awaitingHumanNodes: {},
      pendingHumanInputs: {},
      pendingHandoffApprovals: {},
      visitedNodeIds: [],
      completedHandoffs: [],
      receivingHandoff: {},
      historyHandoff: {},
      awaitingHandoff: [],
      status: 'running',
      stateVersion: CURRENT_FLOW_STATE_VERSION,
      feedbackContext,
    },
  };
}

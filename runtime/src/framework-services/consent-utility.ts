import fs from 'node:fs';
import path from 'node:path';

interface FeedbackTypeMeta {
  displayName: string;
  dirName: string;
  description: string;
}

// Enumerated feedback types: input key → file/display metadata
export const FEEDBACK_TYPES: Record<string, FeedbackTypeMeta> = {
  'onboarding': {
    displayName: 'onboarding-signal',
    dirName: 'onboarding',
    description: 'The Initializer writes a signal report to a-society/feedback/onboarding/ after completing an initialization run.',
  },
  'migration': {
    displayName: 'migration',
    dirName: 'migration',
    description: 'The Curator writes a migration feedback report to a-society/feedback/migration/ after implementing a framework update report.',
  },
  'curator-signal': {
    displayName: 'curator-signal',
    dirName: 'curator-signal',
    description: 'The Curator writes a curator-signal report to a-society/feedback/curator-signal/ after backward passes or ongoing observation.',
  },
};

const VALID_CONSENT_VALUES = ['yes', 'no', 'pending'] as const;
type ConsentValue = typeof VALID_CONSENT_VALUES[number];
type ConsentStatus = ConsentValue | 'unknown';

export interface CreateConsentResult {
  status: 'created' | 'already-existed' | 'failed';
  path: string;
  reason?: string;
}

export interface CheckConsentResult {
  consented: ConsentStatus;
  file_status: 'present' | 'absent';
  path_checked: string;
}

interface CreateConsentOptions {
  overwrite?: boolean;
  recordedBy?: string;
}

function consentFilePath(adocsPath: string, feedbackType: string): string {
  const meta = FEEDBACK_TYPES[feedbackType];
  if (!meta) throw new Error(`Unknown feedback type: "${feedbackType}". Valid types: ${Object.keys(FEEDBACK_TYPES).join(', ')}`);
  return path.join(adocsPath, 'feedback', meta.dirName, 'consent.md');
}

function renderConsentFile(feedbackType: string, projectName: string, consentValue: string, recordedBy?: string): string {
  const meta = FEEDBACK_TYPES[feedbackType];
  const today = new Date().toISOString().slice(0, 10);
  const consentDisplay = consentValue.charAt(0).toUpperCase() + consentValue.slice(1);
  const recorder = recordedBy || 'Consent Utility';

  return [
    `# Feedback Consent: ${meta.displayName}`,
    '',
    `**Project:** ${projectName}`,
    `**Type:** ${meta.displayName}`,
    `**Consented:** ${consentDisplay}`,
    `**Date:** ${today}`,
    `**Recorded by:** ${recorder}`,
    '',
    '## What This Covers',
    '',
    meta.description,
    '',
    '## Agent Behavior',
    '',
    `- If \`Consented: Yes\` — proceed with writing the feedback artifact to the designated path in \`a-society/feedback/${meta.dirName}/\`.`,
    `- If \`Consented: No\` or this file is absent — skip writing. Note in session output: "Feedback skipped — consent not recorded for ${meta.displayName}."`,
    '',
  ].join('\n');
}

/**
 * Creates a consent file for a given feedback type in the target project.
 *
 * Does NOT overwrite an existing file unless overwrite is explicitly true.
 */
export function createConsentFile(
  adocsPath: string,
  feedbackType: string,
  projectName: string,
  consentValue: string,
  options: CreateConsentOptions = {},
): CreateConsentResult {
  if (!adocsPath) throw new Error('adocsPath is required');
  if (!projectName) throw new Error('projectName is required');
  if (!FEEDBACK_TYPES[feedbackType]) {
    throw new Error(`Unknown feedback type: "${feedbackType}". Valid types: ${Object.keys(FEEDBACK_TYPES).join(', ')}`);
  }
  if (!(VALID_CONSENT_VALUES as readonly string[]).includes(consentValue)) {
    throw new Error(`Invalid consent value: "${consentValue}". Valid values: ${VALID_CONSENT_VALUES.join(', ')}`);
  }

  const filePath = consentFilePath(adocsPath, feedbackType);
  const { overwrite = false, recordedBy } = options;

  // Check if file already exists
  if (fs.existsSync(filePath) && !overwrite) {
    return { status: 'already-existed', path: filePath };
  }

  // Ensure the directory exists
  const dir = path.dirname(filePath);
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (err) {
    return { status: 'failed', path: filePath, reason: `Cannot create directory: ${(err as Error).message}` };
  }

  // Write the file
  try {
    const content = renderConsentFile(feedbackType, projectName, consentValue, recordedBy);
    fs.writeFileSync(filePath, content, 'utf8');
    return { status: 'created', path: filePath };
  } catch (err) {
    return { status: 'failed', path: filePath, reason: `Cannot write file: ${(err as Error).message}` };
  }
}

/**
 * Checks the consent status for a given feedback type in the target project.
 *
 * Reads the consent file at the expected path and parses the Consented field.
 * Does not modify any files.
 */
export function checkConsent(adocsPath: string, feedbackType: string): CheckConsentResult {
  if (!adocsPath) throw new Error('adocsPath is required');
  if (!FEEDBACK_TYPES[feedbackType]) {
    throw new Error(`Unknown feedback type: "${feedbackType}". Valid types: ${Object.keys(FEEDBACK_TYPES).join(', ')}`);
  }

  const filePath = consentFilePath(adocsPath, feedbackType);

  if (!fs.existsSync(filePath)) {
    return { consented: 'unknown', file_status: 'absent', path_checked: filePath };
  }

  let content: string;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (_err) {
    return { consented: 'unknown', file_status: 'present', path_checked: filePath };
  }

  // Parse **Consented:** field
  const match = content.match(/^\*\*Consented:\*\*\s*(\S+)/m);
  if (!match) {
    return { consented: 'unknown', file_status: 'present', path_checked: filePath };
  }

  const raw = match[1].toLowerCase();
  const consented: ConsentStatus = (VALID_CONSENT_VALUES as readonly string[]).includes(raw)
    ? (raw as ConsentValue)
    : 'unknown';

  return { consented, file_status: 'present', path_checked: filePath };
}

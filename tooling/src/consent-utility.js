'use strict';

const fs = require('fs');
const path = require('path');

// Enumerated feedback types: input key → file/display metadata
const FEEDBACK_TYPES = {
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

const VALID_CONSENT_VALUES = ['yes', 'no', 'pending'];

/**
 * Returns the path to a project's consent file for a given feedback type.
 *
 * @param {string} adocsPath - Path to the project's a-docs/ directory
 * @param {string} feedbackType - 'onboarding' | 'migration' | 'curator-signal'
 * @returns {string}
 */
function consentFilePath(adocsPath, feedbackType) {
  const meta = FEEDBACK_TYPES[feedbackType];
  if (!meta) throw new Error(`Unknown feedback type: "${feedbackType}". Valid types: ${Object.keys(FEEDBACK_TYPES).join(', ')}`);
  return path.join(adocsPath, 'feedback', meta.dirName, 'consent.md');
}

/**
 * Renders the consent file content from the template.
 *
 * @param {string} feedbackType - 'onboarding' | 'migration' | 'curator-signal'
 * @param {string} projectName
 * @param {string} consentValue - 'yes' | 'no' | 'pending'
 * @param {string} recordedBy - Role that recorded consent (optional)
 * @returns {string}
 */
function renderConsentFile(feedbackType, projectName, consentValue, recordedBy) {
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
 *
 * @param {string} adocsPath - Path to the project's a-docs/ directory
 * @param {string} feedbackType - 'onboarding' | 'migration' | 'curator-signal'
 * @param {string} projectName
 * @param {string} consentValue - 'yes' | 'no' | 'pending'
 * @param {object} [options]
 * @param {boolean} [options.overwrite=false] - If true, overwrite an existing file
 * @param {string} [options.recordedBy] - Role that recorded consent
 * @returns {{ status: 'created' | 'already-existed' | 'failed', path: string, reason?: string }}
 */
function createConsentFile(adocsPath, feedbackType, projectName, consentValue, options = {}) {
  if (!adocsPath) throw new Error('adocsPath is required');
  if (!projectName) throw new Error('projectName is required');
  if (!FEEDBACK_TYPES[feedbackType]) {
    throw new Error(`Unknown feedback type: "${feedbackType}". Valid types: ${Object.keys(FEEDBACK_TYPES).join(', ')}`);
  }
  if (!VALID_CONSENT_VALUES.includes(consentValue)) {
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
    return { status: 'failed', path: filePath, reason: `Cannot create directory: ${err.message}` };
  }

  // Write the file
  try {
    const content = renderConsentFile(feedbackType, projectName, consentValue, recordedBy);
    fs.writeFileSync(filePath, content, 'utf8');
    return { status: 'created', path: filePath };
  } catch (err) {
    return { status: 'failed', path: filePath, reason: `Cannot write file: ${err.message}` };
  }
}

/**
 * Checks the consent status for a given feedback type in the target project.
 *
 * Reads the consent file at the expected path and parses the Consented field.
 * Does not modify any files.
 *
 * @param {string} adocsPath - Path to the project's a-docs/ directory
 * @param {string} feedbackType - 'onboarding' | 'migration' | 'curator-signal'
 * @returns {{
 *   consented: 'yes' | 'no' | 'pending' | 'unknown',
 *   file_status: 'present' | 'absent',
 *   path_checked: string
 * }}
 */
function checkConsent(adocsPath, feedbackType) {
  if (!adocsPath) throw new Error('adocsPath is required');
  if (!FEEDBACK_TYPES[feedbackType]) {
    throw new Error(`Unknown feedback type: "${feedbackType}". Valid types: ${Object.keys(FEEDBACK_TYPES).join(', ')}`);
  }

  const filePath = consentFilePath(adocsPath, feedbackType);

  if (!fs.existsSync(filePath)) {
    return { consented: 'unknown', file_status: 'absent', path_checked: filePath };
  }

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    return { consented: 'unknown', file_status: 'present', path_checked: filePath };
  }

  // Parse **Consented:** field
  const match = content.match(/^\*\*Consented:\*\*\s*(\S+)/m);
  if (!match) {
    return { consented: 'unknown', file_status: 'present', path_checked: filePath };
  }

  const raw = match[1].toLowerCase();
  const consented = VALID_CONSENT_VALUES.includes(raw) ? raw : 'unknown';

  return { consented, file_status: 'present', path_checked: filePath };
}

module.exports = { createConsentFile, checkConsent, FEEDBACK_TYPES };

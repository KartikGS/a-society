import path from 'node:path';
import { getFrameworkRoot } from './workspace.js';

/** Framework files the runtime reads, relative to the framework root. */
export const FRAMEWORK_FILES = {
  adocsManifest: 'runtime/contracts/a-docs-manifest.yaml',
  initializationContract: 'runtime/contracts/initialization.md',
  updateContract: 'runtime/contracts/update.md',
  feedbackContract: 'runtime/contracts/feedback.md',
  /** Canonical source of the current framework version (`a_society_version` frontmatter). */
  changelog: 'CHANGELOG.md',
  generalIndex: 'index.md',
} as const;

export type FrameworkFile = keyof typeof FRAMEWORK_FILES;

/** Absolute path of a framework file under the framework root. */
export function frameworkFilePath(file: FrameworkFile): string {
  return path.join(getFrameworkRoot(), ...FRAMEWORK_FILES[file].split('/'));
}

/**
 * Per-project version record, relative to the project's a-docs/ root. Records
 * the A-Society version this project's a-docs conform to, in YAML frontmatter
 * (`a_society_version`). Stamped at initialization, bumped by the Owner during
 * an update flow.
 */
export const A_DOCS_VERSION_RECORD_RELATIVE_PATH = path.join('a-society-version.md');

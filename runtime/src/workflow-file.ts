import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const CANONICAL_WORKFLOW_FILENAME = 'workflow.yaml';

export function canonicalWorkflowFilename(): string {
  return CANONICAL_WORKFLOW_FILENAME;
}

export function findWorkflowFilePath(recordFolderPath: string): string | null {
  const candidatePath = path.join(recordFolderPath, CANONICAL_WORKFLOW_FILENAME);
  return fs.existsSync(candidatePath) ? candidatePath : null;
}

export function parseWorkflowFile(filePath: string): unknown {
  const content = fs.readFileSync(filePath, 'utf8');
  return yaml.load(content);
}

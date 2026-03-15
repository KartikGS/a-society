'use strict';

const fs = require('fs');
const yaml = require('js-yaml');

/**
 * Extracts YAML frontmatter from a markdown file.
 * Frontmatter is the content between the first pair of "---" delimiters.
 *
 * @param {string} content - Full file content
 * @returns {string | null} YAML string, or null if no frontmatter found
 */
function extractFrontmatter(content) {
  // Must start with "---" (optionally preceded by a BOM or whitespace-only lines)
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match ? match[1] : null;
}

/**
 * Validates a parsed workflow graph object against the approved schema.
 *
 * @param {unknown} doc - The parsed YAML document
 * @returns {string[]} List of validation errors; empty if valid
 */
function validateGraph(doc) {
  const errors = [];

  if (!doc || typeof doc !== 'object') {
    errors.push('Document is not an object');
    return errors;
  }

  if (!('workflow' in doc)) {
    errors.push('Missing required field: workflow');
    return errors;
  }

  const wf = doc.workflow;

  if (!wf || typeof wf !== 'object') {
    errors.push('workflow must be an object');
    return errors;
  }

  // workflow.name
  if (typeof wf.name !== 'string' || wf.name.trim() === '') {
    errors.push('workflow.name must be a non-empty string');
  }

  // workflow.phases
  if (!Array.isArray(wf.phases) || wf.phases.length === 0) {
    errors.push('workflow.phases must be a non-empty array');
  } else {
    const phaseIds = new Set();
    wf.phases.forEach((phase, i) => {
      if (!phase || typeof phase !== 'object') {
        errors.push(`workflow.phases[${i}] must be an object`);
        return;
      }
      if (typeof phase.id !== 'string' || phase.id.trim() === '') {
        errors.push(`workflow.phases[${i}].id must be a non-empty string`);
      } else if (phaseIds.has(phase.id)) {
        errors.push(`workflow.phases[${i}].id "${phase.id}" is not unique`);
      } else {
        phaseIds.add(phase.id);
      }
      if (typeof phase.name !== 'string' || phase.name.trim() === '') {
        errors.push(`workflow.phases[${i}].name must be a non-empty string`);
      }
    });

    // workflow.nodes
    const phaseIdSet = new Set(wf.phases.filter(p => p && typeof p.id === 'string').map(p => p.id));

    if (!Array.isArray(wf.nodes) || wf.nodes.length === 0) {
      errors.push('workflow.nodes must be a non-empty array');
    } else {
      const nodeIds = new Set();
      let synthesisCount = 0;

      wf.nodes.forEach((node, i) => {
        if (!node || typeof node !== 'object') {
          errors.push(`workflow.nodes[${i}] must be an object`);
          return;
        }
        // id
        if (typeof node.id !== 'string' || node.id.trim() === '') {
          errors.push(`workflow.nodes[${i}].id must be a non-empty string`);
        } else if (nodeIds.has(node.id)) {
          errors.push(`workflow.nodes[${i}].id "${node.id}" is not unique`);
        } else {
          nodeIds.add(node.id);
        }
        // role
        if (typeof node.role !== 'string' || node.role.trim() === '') {
          errors.push(`workflow.nodes[${i}].role must be a non-empty string`);
        }
        // phase
        if (typeof node.phase !== 'string' || node.phase.trim() === '') {
          errors.push(`workflow.nodes[${i}].phase must be a non-empty string`);
        } else if (!phaseIdSet.has(node.phase)) {
          errors.push(`workflow.nodes[${i}].phase "${node.phase}" does not match any phase id`);
        }
        // first_occurrence_position
        if (!Number.isInteger(node.first_occurrence_position) || node.first_occurrence_position < 1) {
          errors.push(`workflow.nodes[${i}].first_occurrence_position must be a positive integer`);
        }
        // is_synthesis_role
        if (typeof node.is_synthesis_role !== 'boolean') {
          errors.push(`workflow.nodes[${i}].is_synthesis_role must be a boolean`);
        } else if (node.is_synthesis_role) {
          synthesisCount++;
        }
      });

      if (synthesisCount === 0) {
        errors.push('Exactly one node must have is_synthesis_role: true (found 0)');
      } else if (synthesisCount > 1) {
        errors.push(`Exactly one node must have is_synthesis_role: true (found ${synthesisCount})`);
      }

      // workflow.edges
      if (!Array.isArray(wf.edges)) {
        errors.push('workflow.edges must be an array');
      } else {
        wf.edges.forEach((edge, i) => {
          if (!edge || typeof edge !== 'object') {
            errors.push(`workflow.edges[${i}] must be an object`);
            return;
          }
          if (typeof edge.from !== 'string' || edge.from.trim() === '') {
            errors.push(`workflow.edges[${i}].from must be a non-empty string`);
          } else if (!nodeIds.has(edge.from)) {
            errors.push(`workflow.edges[${i}].from "${edge.from}" does not match any node id`);
          }
          if (typeof edge.to !== 'string' || edge.to.trim() === '') {
            errors.push(`workflow.edges[${i}].to must be a non-empty string`);
          } else if (!nodeIds.has(edge.to)) {
            errors.push(`workflow.edges[${i}].to "${edge.to}" does not match any node id`);
          }
          if ('artifact' in edge && typeof edge.artifact !== 'string') {
            errors.push(`workflow.edges[${i}].artifact must be a string if present`);
          }
        });
      }
    }
  }

  return errors;
}

/**
 * Validates a workflow document file against the approved workflow graph schema.
 *
 * Parses the YAML frontmatter from the file and runs all schema checks.
 *
 * @param {string} filePath - Path to the workflow document (must contain YAML frontmatter)
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateWorkflowFile(filePath) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    return { valid: false, errors: [`Cannot read file: ${filePath} — ${err.message}`] };
  }

  const yamlStr = extractFrontmatter(content);
  if (yamlStr === null) {
    return { valid: false, errors: ['No YAML frontmatter found (expected content between --- delimiters at start of file)'] };
  }

  let doc;
  try {
    doc = yaml.load(yamlStr);
  } catch (err) {
    return { valid: false, errors: [`YAML parse error: ${err.message}`] };
  }

  const errors = validateGraph(doc);
  return { valid: errors.length === 0, errors };
}

module.exports = { validateWorkflowFile, validateGraph, extractFrontmatter };

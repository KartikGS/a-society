import { SessionStore } from './store.js';
import type { FlowRun, TriggerRecord } from './types.js';
import { validateWorkflowFile } from '../../tooling/src/workflow-graph-validator.js';
import { validatePlanArtifact } from '../../tooling/src/plan-artifact-validator.js';
import { orderWithPromptsFromFile } from '../../tooling/src/backward-pass-orderer.js';
import { scaffoldFromManifestFile } from '../../tooling/src/scaffolding-system.js';
import path from 'node:path';

/**
 * Component 7: Tool Trigger Engine
 * Coordinates direct in-process invocations of the framework's deterministic tooling
 * utilities when the flow orchestration hits defined boundary rules.
 */
export class ToolTriggerEngine {
  static async evaluateAndTrigger(flowRun: FlowRun, event: 'START' | 'ACTIVE_ARTIFACT' | 'TERMINAL_FORWARD_PASS' | 'INITIALIZATION', payload: any): Promise<void> {
    const triggerRecord: TriggerRecord = {
      toolComponent: 'Unknown',
      inputSummary: JSON.stringify(payload),
      resultSummary: '',
      success: false,
      retryStatus: 'none'
    };

    try {
      if (event === 'START') {
        triggerRecord.toolComponent = 'Workflow Graph Schema Validator';
        const res = validateWorkflowFile(payload.workflowDocumentPath);
        if (!res.valid) {
          throw new Error('Component 3 Error: ' + res.errors.join(', '));
        }
        triggerRecord.resultSummary = `Component 3 execution success: Validated format at ${payload.workflowDocumentPath}`;
        triggerRecord.success = true;

      } else if (event === 'ACTIVE_ARTIFACT' && payload.artifactPath?.endsWith('01-owner-workflow-plan.md')) {
        triggerRecord.toolComponent = 'Plan Artifact Validator';
        // Payload has artifactPath, we need recordFolderPath
        const recordFolder = path.dirname(payload.artifactPath);
        const res = validatePlanArtifact(recordFolder);
        if (!res.valid) {
          throw new Error('Component 7 Error: ' + res.errors.map((e: any) => `${e.field}: ${e.issue}`).join(', '));
        }
        triggerRecord.resultSummary = `Component 7 execution success: Validated plan syntax in ${recordFolder}`;
        triggerRecord.success = true;

      } else if (event === 'TERMINAL_FORWARD_PASS') {
        triggerRecord.toolComponent = 'Backward Pass Orderer';
        const synthesisRole = process.env.SYNTHESIS_ROLE ?? 'Curator';
        orderWithPromptsFromFile(flowRun.recordFolderPath, synthesisRole);
        triggerRecord.resultSummary = `Component 4 execution success: Computed backward traversal order (synthesisRole=${synthesisRole})`;
        triggerRecord.success = true;

      } else if (event === 'INITIALIZATION') {
        triggerRecord.toolComponent = 'Scaffolding System';
        const aSocietyRoot = path.resolve(flowRun.projectRoot, '..', '..');
        const res = scaffoldFromManifestFile(
            flowRun.projectRoot, 
            'Active Project', 
            aSocietyRoot, 
            path.join(aSocietyRoot, 'general', 'manifest.yaml'), 
            {}
        );
        triggerRecord.resultSummary = `Component 1 execution success: Scaffolded target directory (${res.created.length} created, ${res.failed.length} failed)`;
        triggerRecord.success = true;
      } else {
        return; // No trigger condition met
      }

      SessionStore.saveTriggerRecord(flowRun.flowId, triggerRecord);

    } catch (err: any) {
      triggerRecord.success = false;
      triggerRecord.resultSummary = `Tool trigger exception: ${err.message}`;
      SessionStore.saveTriggerRecord(flowRun.flowId, triggerRecord);
      throw new Error(`ToolTriggerEngine failed to execute binding rule for ${event}: ${err.message}`);
    }
  }
}

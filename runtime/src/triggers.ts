import { SessionStore } from './store.js';
import type { FlowRun, TriggerRecord } from './types.js';
import { validateWorkflowFile } from '../../tooling/src/workflow-graph-validator.js';
import { computeBackwardPassPlan } from '../../tooling/src/backward-pass-orderer.js';
import { scaffoldFromManifestFile } from '../../tooling/src/scaffolding-system.js';
import path from 'node:path';
import { TelemetryManager } from './observability.js';
import { SpanStatusCode, SpanKind } from '@opentelemetry/api';

/**
 * Component 7: Tool Trigger Engine
 * Coordinates direct in-process invocations of the framework's deterministic tooling
 * utilities when the flow orchestration hits defined boundary rules.
 */
export class ToolTriggerEngine {
  static async evaluateAndTrigger(flowRun: FlowRun, event: 'START' | 'TERMINAL_FORWARD_PASS' | 'INITIALIZATION', payload: any): Promise<void> {
    const tracer = TelemetryManager.getTracer();
    return tracer.startActiveSpan('tool_trigger.execute', {
      kind: SpanKind.INTERNAL,
      attributes: {
        'flow.id': flowRun.flowId,
        'trigger.event': event
      }
    }, async (span) => {
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
          span.setAttribute('trigger.component', triggerRecord.toolComponent);
          const res = validateWorkflowFile(payload.workflowDocumentPath, true);
          if (!res.valid) {
            throw new Error('Component 3 Error: ' + res.errors.join(', '));
          }
          triggerRecord.resultSummary = `Component 3 execution success: Validated format at ${payload.workflowDocumentPath}`;
          triggerRecord.success = true;

        } else if (event === 'TERMINAL_FORWARD_PASS') {
          triggerRecord.toolComponent = 'Backward Pass Orderer';
          span.setAttribute('trigger.component', triggerRecord.toolComponent);
          const synthesisRole = 'Curator';
          // Component 4: computeBackwardPassPlan replaces the deprecated orderWithPromptsFromFile
          computeBackwardPassPlan(flowRun.recordFolderPath, synthesisRole, 'graph-based');
          triggerRecord.resultSummary = `Component 4 execution success: Computed backward traversal order (synthesisRole=${synthesisRole})`;
          triggerRecord.success = true;

        } else if (event === 'INITIALIZATION') {
          triggerRecord.toolComponent = 'Scaffolding System';
          span.setAttribute('trigger.component', triggerRecord.toolComponent);
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
          span.addEvent('trigger.noop');
          return; // No trigger condition met
        }

        SessionStore.saveTriggerRecord(flowRun.flowId, triggerRecord);

      } catch (err: any) {
        triggerRecord.success = false;
        triggerRecord.resultSummary = `Tool trigger exception: ${err.message}`;
        SessionStore.saveTriggerRecord(flowRun.flowId, triggerRecord);
        span.recordException(err);
        span.setStatus({ code: SpanStatusCode.ERROR });
        throw new Error(`ToolTriggerEngine failed to execute binding rule for ${event}: ${err.message}`);
      } finally {
        span.setAttribute('trigger.success', triggerRecord.success);
        if (triggerRecord.toolComponent !== 'Unknown') {
          span.setAttribute('trigger.component', triggerRecord.toolComponent);
        }
        if (triggerRecord.resultSummary) {
          span.setAttribute('trigger.result_summary', triggerRecord.resultSummary);
        }
        span.end();
      }
    });
  }
}

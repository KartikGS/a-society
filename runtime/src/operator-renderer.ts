import type { OperatorEvent, OperatorRenderSink } from './types.js';

export class OperatorEventRenderer implements OperatorRenderSink {
  private stream: NodeJS.WritableStream;

  constructor(stream: NodeJS.WritableStream = process.stderr) {
    this.stream = stream;
  }

  startWait(provider: string, model: string): void {
    const label = `[runtime/wait] Waiting for ${model} response`;
    this.stream.write(label + '\n');
  }

  stopWait(): void {
    // Plain stderr fallback: wait notices are emitted as static lines.
  }

  emit(event: OperatorEvent): void {
    const line = this.renderLine(event);
    if (line !== null) {
      this.stream.write(line + '\n');
    }
  }

  private renderLine(event: OperatorEvent): string | null {
    switch (event.kind) {
      case 'flow.resumed':
        return `[runtime/flow] Resuming flow ${event.flowId} with ${event.activeNodeCount} active node(s)`;

      case 'role.active': {
        let line = `[runtime/role] Active: ${event.nodeId} (${event.role})`;
        if (event.artifactCount === 1 && event.artifactBasename) {
          line += ` - artifact: ${event.artifactBasename}`;
        } else if (event.artifactCount > 1) {
          line += ` - inputs: ${event.artifactCount} artifacts`;
        }
        return line;
      }

      case 'activity.tool_call': {
        let line = `[runtime/tool] ${event.toolName}`;
        if (event.command) line += `: ${event.command}`;
        else if (event.path) line += ` ${event.path}`;
        return line;
      }

      case 'handoff.applied': {
        if (event.targets.length === 1) {
          const t = event.targets[0];
          let line = `[runtime/handoff] ${event.fromNodeId} (${event.fromRole}) -> ${t.nodeId} (${t.role})`;
          if (t.artifactBasename) line += ` - artifact: ${t.artifactBasename}`;
          return line;
        } else {
          const tStr = event.targets.map(t => `${t.nodeId} (${t.role})`).join(', ');
          return `[runtime/handoff] ${event.fromNodeId} (${event.fromRole}) forked to ${tStr}`;
        }
      }

      case 'repair.requested': {
        const suffix = event.scope === 'improvement'
          ? 'retrying backward pass step'
          : 'retrying current node';
        return `[runtime/repair] ${event.summary}; ${suffix}`;
      }

      case 'human.awaiting_input': {
        if (event.reason === 'prompt-human') {
          return `[runtime/human] Waiting for operator input for ${event.nodeId} (${event.role})`;
        } else {
          return `[runtime/human] ${event.nodeId} (${event.role}) suspended; waiting for later operator input`;
        }
      }

      case 'human.resumed':
        return `[runtime/human] Operator input received; resuming ${event.nodeId} (${event.role})`;

      case 'parallel.active_set': {
        const nodeStr = event.activeNodes.map(n => `${n.nodeId} (${n.role})`).join(', ');
        return `[runtime/parallel] Active nodes: ${nodeStr}`;
      }

      case 'parallel.join_waiting': {
        const waitStr = event.waitingFor.join(', ');
        return `[runtime/parallel] Join pending: ${event.nodeId} (${event.role}) waiting for ${waitStr}`;
      }

      case 'usage.turn_summary': {
        switch (event.availability) {
          case 'full':
            return `Tokens: ${event.inputTokens} in, ${event.outputTokens} out`;
          case 'input-unavailable':
            return `Tokens: input unavailable, ${event.outputTokens} out`;
          case 'output-unavailable':
            return `Tokens: ${event.inputTokens} in, output unavailable`;
          case 'both-unavailable':
            return `Tokens unavailable (provider did not report usage)`;
          default:
            return null;
        }
      }

      case 'flow.forward_pass_closed':
        return `[runtime/flow] Forward pass closed via ${event.artifactBasename}; starting improvement phase`;

      case 'flow.improvement_prompt':
        return `[runtime/improvement] Awaiting improvement mode selection`;

      case 'flow.completed':
        return `[runtime/flow] Orchestration complete`;

      default:
        return null;
    }
  }
}

export function createDefaultRenderer(): OperatorEventRenderer {
  return new OperatorEventRenderer(process.stderr);
}

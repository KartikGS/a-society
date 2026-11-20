import { LLMGatewayError } from '../../../common/types.js';
import type { HostModelOption } from '../../../../shared/settings.js';
import { HostAgentError } from '../types.js';
import type {
  HostAgentAdapter,
  HostCapabilities,
  HostLiveEvent,
  HostProbe,
  HostTurnRequest,
  HostTurnResult,
  SupportedVersionRange,
} from '../types.js';
import { resolveExecutable, runHostProcess } from '../process-runner.js';
import { buildClaudeCommand } from './command.js';
import { CLAUDE_EXECUTABLE_NAME, probeClaudeCode } from './probe.js';
import { ClaudeStreamParser } from './stream-parser.js';

/** Versions verified against this adapter's command builder and parser. */
export const CLAUDE_CODE_SUPPORTED_VERSIONS: SupportedVersionRange = { min: '2.1.304', maxExclusive: '2.2.0' };

export const CLAUDE_CODE_CAPABILITIES: HostCapabilities = {
  systemPromptMode: 'append-file',
  assignsConversationId: true,
  modelFlag: true,
  listModels: false,
  permissionDenialReport: true,
  extraDirs: true,
  liveEvents: true,
  rateLimitReport: true,
  textDeltas: true,
  effortFlag: true,
};

/** Model aliases `--model` accepts; the CLI has no model-listing command. */
export const CLAUDE_CODE_MODELS: readonly HostModelOption[] = [
  { id: 'opus', displayName: 'Opus' },
  { id: 'sonnet', displayName: 'Sonnet' },
  { id: 'haiku', displayName: 'Haiku' },
  { id: 'fable', displayName: 'Fable' },
];

/** Levels `--effort` accepts, per the Claude Code CLI reference (live `claude --help` check pending the real-CLI pass). */
export const CLAUDE_CODE_EFFORT_LEVELS: readonly string[] = ['low', 'medium', 'high', 'xhigh', 'max'];

function formatReset(resetsAt: number | undefined): string {
  return resetsAt ? ` Resets at ${new Date(resetsAt * 1000).toISOString()}.` : '';
}

export class ClaudeCodeAdapter implements HostAgentAdapter {
  readonly id = 'claude-code' as const;
  readonly displayName = 'Claude Code';
  readonly executableName = CLAUDE_EXECUTABLE_NAME;
  readonly supportedVersions = CLAUDE_CODE_SUPPORTED_VERSIONS;
  readonly capabilities = CLAUDE_CODE_CAPABILITIES;
  readonly models = CLAUDE_CODE_MODELS;
  readonly effortLevels = CLAUDE_CODE_EFFORT_LEVELS;

  probe(executablePath: string | null): Promise<HostProbe> {
    return probeClaudeCode(executablePath, this.supportedVersions);
  }

  async runTurn(
    req: HostTurnRequest,
    onEvent: (event: HostLiveEvent) => void,
    signal: AbortSignal,
    executablePath: string | null
  ): Promise<HostTurnResult> {
    const executable = resolveExecutable(this.executableName, executablePath);
    if (!executable) {
      throw new HostAgentError('NOT_INSTALLED', `${this.displayName} is not installed at ${executablePath ?? 'any directory on PATH'}.`);
    }

    const command = buildClaudeCommand(req);
    const parser = new ClaudeStreamParser(onEvent);
    const run = await runHostProcess({
      executable,
      args: command.args,
      stdin: command.stdin,
      cwd: req.cwd,
      signal,
      onLine: (line) => parser.pushLine(line),
    });

    if (run.aborted) {
      throw new LLMGatewayError('ABORTED', 'Turn aborted by operator', parser.partialText || undefined);
    }

    const outcome = parser.finish(run.stderrTail);
    switch (outcome.kind) {
      case 'auth-error':
        throw new LLMGatewayError('AUTH_ERROR', `${this.displayName}: ${outcome.message}`);
      case 'rate-limited':
        throw new LLMGatewayError('RATE_LIMIT', `${this.displayName}: ${outcome.message}${formatReset(outcome.resetsAt)}`);
      case 'host-error':
        throw new LLMGatewayError('UNKNOWN', `${this.displayName}: ${outcome.message}`);
      default:
        return outcome;
    }
  }
}

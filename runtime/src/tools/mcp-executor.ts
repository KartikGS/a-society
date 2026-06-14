import type { ToolCall } from '../common/types.js';
import type { McpManager, McpToolResult } from '../providers/mcp/manager.js';

export class McpToolExecutor {
  constructor(private readonly manager: McpManager) {}

  canHandle(name: string): boolean {
    return name.startsWith('mcp__');
  }

  async execute(call: ToolCall, signal?: AbortSignal): Promise<McpToolResult> {
    return this.manager.callTool(call.name, call.input, signal);
  }
}

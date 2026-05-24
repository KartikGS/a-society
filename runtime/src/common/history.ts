import type { RoleSession, RuntimeMessageParam } from './types.js';

export function upsertAssistantDelta(history: RuntimeMessageParam[], text: string): void {
  if (!text) return;
  const previous = history[history.length - 1];
  if (previous?.role === 'assistant') {
    previous.content += text;
    return;
  }
  history.push({ role: 'assistant', content: text });
}

export function removeAssistantDraftBeforeToolCalls(
  history: RuntimeMessageParam[],
  newMessages: RuntimeMessageParam[]
): void {
  if (newMessages[0]?.role !== 'assistant_tool_calls') return;
  const firstNewMessageIndex = history.length - newMessages.length;
  const previousIndex = firstNewMessageIndex - 1;
  if (previousIndex < 0) return;
  if (history[previousIndex]?.role === 'assistant') {
    history.splice(previousIndex, 1);
  }
}

export function upsertCurrentNodeAssistantDelta(session: RoleSession, nodeId: string, text: string): void {
  if (!text) return;
  if (!session.currentNodeContext || session.currentNodeContext.nodeId !== nodeId) {
    session.currentNodeContext = { nodeId, exchanges: [] };
  }
  const previous = session.currentNodeContext.exchanges[session.currentNodeContext.exchanges.length - 1];
  if (previous?.role === 'assistant') {
    previous.content += text;
    return;
  }
  session.currentNodeContext.exchanges.push({ role: 'assistant', content: text });
}

export function appendConversationMessagesToCurrentNode(
  session: RoleSession,
  nodeId: string,
  messages: RuntimeMessageParam[]
): void {
  if (!session.currentNodeContext || session.currentNodeContext.nodeId !== nodeId) {
    session.currentNodeContext = { nodeId, exchanges: [] };
  }
  if (messages[0]?.role === 'assistant_tool_calls') {
    const exchanges = session.currentNodeContext.exchanges;
    if (exchanges[exchanges.length - 1]?.role === 'assistant') {
      exchanges.splice(exchanges.length - 1, 1);
    }
  }
  session.currentNodeContext.exchanges.push(...messages);
}

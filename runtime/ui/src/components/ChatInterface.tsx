import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  CONSENT_MODE,
  CONSENT_RESPONSE_DECISION,
  HANDOFF_APPROVAL_DECISION,
} from '../../../shared/protocol-constants.js';
import type { ProtocolHandoffApprovalDecision } from '../../../shared/protocol-constants.js';
import type { ConsentMode, ConsentRequest, ConsentResponseDecision, FeedItem, HandoffTarget } from '../../../shared/types.js';
import type { McpServerSummary, ModelConfig } from '../../../shared/settings.js';
import type { SkillSummary } from '../../../shared/skills.js';

export type { FeedItem };

export interface RoleConfigurationPrompt {
  nodeId: string;
  models: ModelConfig[];
  skills: SkillSummary[];
  mcpServers: McpServerSummary[];
  /** Dimensions the operator must still pick; auto-resolved dimensions are not shown. */
  pendingModel: boolean;
  pendingSkills: boolean;
  pendingMcp: boolean;
}

export interface HandoffApprovalPrompt {
  nodeId: string;
  targets: HandoffTarget[];
}

interface ChatInterfaceProps {
  subtitle: string;
  messages: FeedItem[];
  waitingLabel: string | null;
  inputValue: string;
  inputDisabled: boolean;
  placeholder: string;
  showComposer?: boolean;
  canStop?: boolean;
  stopRequested?: boolean;
  roles?: string[];
  selectedRole?: string;
  activeRoles?: string[];
  consentRequest?: ConsentRequest | null;
  consentMode?: ConsentMode;
  roleConfiguration?: RoleConfigurationPrompt | null;
  handoffApproval?: HandoffApprovalPrompt | null;
  contextWindow?: number | null;
  latestContextUsage?: number | null;
  onRoleSelect?: (role: string) => void;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  onConsentResponse?: (decision: ConsentResponseDecision) => void;
  onRoleConfigure?: (nodeId: string, payload: { modelConfigId?: string; skills: string[]; mcpServers: string[] }) => void;
  onHandoffApproval?: (nodeId: string, decision: ProtocolHandoffApprovalDecision) => void;
  onConsentModeChange?: (mode: ConsentMode) => void;
  onCompactContext?: () => void;
  isCompactingContext?: boolean;
}

function normalizeAssistantMarkdown(text: string): string {
  return text.replace(/\$?\\(?:rightarrow|to)\$?/g, '→');
}

function consentPromptTitle(request: ConsentRequest): string {
  if (request.kind === 'file-write') {
    return `Allow write ${request.path}?`;
  }
  if (request.kind === 'mcp-tool') {
    return `Arguments: ${request.argsPreview}`;
  }
  return `Allow ${request.command}?`;
}

function consentToolLabel(request: ConsentRequest): string {
  if (request.kind === 'mcp-tool') {
    return `${request.serverName} · ${request.toolDisplayName}`;
  }
  return request.toolName;
}

function consentAllowFlowLabel(request: ConsentRequest): string {
  if (request.kind === 'file-write') {
    return 'Allow all edits this flow';
  }
  if (request.kind === 'mcp-tool') {
    return 'Allow this tool for this flow';
  }
  return 'Allow this command for this flow';
}

type MarkdownSegment =
  | { kind: 'markdown'; text: string }
  | { kind: 'table'; headers: string[]; rows: string[][] };

function splitTableRow(line: string): string[] | null {
  const trimmed = line.trim();
  if (!trimmed.includes('|')) return null;

  const withoutLeading = trimmed.startsWith('|') ? trimmed.slice(1) : trimmed;
  const withoutTrailing = withoutLeading.endsWith('|') ? withoutLeading.slice(0, -1) : withoutLeading;
  const cells = withoutTrailing.split('|').map((cell) => cell.trim());
  return cells.length >= 2 ? cells : null;
}

function isTableSeparator(cells: string[]): boolean {
  return cells.length >= 2 && cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s+/g, '')));
}

function splitMarkdownTables(text: string): MarkdownSegment[] {
  const normalized = normalizeAssistantMarkdown(text);
  const lines = normalized.split(/\r?\n/);
  const segments: MarkdownSegment[] = [];
  const pending: string[] = [];

  const flushPending = () => {
    if (pending.length === 0) return;
    segments.push({ kind: 'markdown', text: pending.join('\n') });
    pending.length = 0;
  };

  for (let i = 0; i < lines.length; i++) {
    const headerCells = splitTableRow(lines[i]);
    const separatorCells = i + 1 < lines.length ? splitTableRow(lines[i + 1]) : null;

    if (headerCells && separatorCells && isTableSeparator(separatorCells)) {
      flushPending();
      const rows: string[][] = [];
      i += 2;

      while (i < lines.length) {
        const rowCells = splitTableRow(lines[i]);
        if (!rowCells) break;
        rows.push(rowCells);
        i++;
      }

      i--;
      segments.push({ kind: 'table', headers: headerCells, rows });
    } else {
      pending.push(lines[i]);
    }
  }

  flushPending();
  return segments;
}

function renderAssistantMarkdown(text: string) {
  return splitMarkdownTables(text).map((segment, index) => {
    if (segment.kind === 'markdown') {
      return <ReactMarkdown key={index}>{segment.text}</ReactMarkdown>;
    }

    return (
      <div className="feed-table-wrap" key={index}>
        <table>
          <thead>
            <tr>
              {segment.headers.map((header, headerIndex) => (
                <th key={headerIndex}>
                  <ReactMarkdown>{header}</ReactMarkdown>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {segment.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {segment.headers.map((_, cellIndex) => (
                  <td key={cellIndex}>
                    <ReactMarkdown>{row[cellIndex] ?? ''}</ReactMarkdown>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  });
}

function renderReasoningFeedItem(message: FeedItem) {
  return (
    <details
      className="feed-reasoning"
      open={message.reasoningDisplay === 'expanded'}
    >
      <summary>{message.label}</summary>
      <pre>{message.text}</pre>
    </details>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M3.4 16.6 17 10 3.4 3.4l.2 5.1 8.2 1.5-8.2 1.5-.2 5.1Z"
        fill="currentColor"
      />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <rect x="5" y="5" width="10" height="10" rx="2.5" fill="currentColor" />
    </svg>
  );
}

function RoleConfigurationBanner({
  roleConfiguration,
  onRoleConfigure,
}: {
  roleConfiguration: RoleConfigurationPrompt;
  onRoleConfigure?: (nodeId: string, payload: { modelConfigId?: string; skills: string[]; mcpServers: string[] }) => void;
}) {
  const showModelSection = roleConfiguration.pendingModel && roleConfiguration.models.length > 1;
  const showSkillsSection = roleConfiguration.pendingSkills && roleConfiguration.skills.length > 0;
  const showMcpSection = roleConfiguration.pendingMcp && roleConfiguration.mcpServers.length > 0;
  const [modelConfigId, setModelConfigId] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedMcpServers, setSelectedMcpServers] = useState<string[]>([]);

  function toggleSkill(name: string, checked: boolean): void {
    setSelectedSkills((current) => checked
      ? [...current, name].sort((a, b) => a.localeCompare(b))
      : current.filter((entry) => entry !== name));
  }

  function toggleMcpServer(id: string, checked: boolean): void {
    setSelectedMcpServers((current) => checked
      ? [...current, id].sort((a, b) => a.localeCompare(b))
      : current.filter((entry) => entry !== id));
  }

  const submitDisabled = showModelSection && !modelConfigId;
  const hasCapabilitySections = showSkillsSection || showMcpSection;

  return (
    <div className="model-select-banner">
      <div className="model-select-banner-body">
        <span className="model-select-banner-title">Configure this role</span>
        <span className="model-select-banner-desc">
          The selection is used for this role&apos;s turns in this flow.
        </span>
      </div>

      {showModelSection ? (
        <section className="role-config-section" aria-label="Model">
          <h3 className="role-config-section-title">Model</h3>
          <ul className="model-select-options role-config-options">
            {roleConfiguration.models.map((model) => (
              <li key={model.id}>
                <button
                  type="button"
                  className={`model-select-option${modelConfigId === model.id ? ' model-select-option-selected' : ''}`}
                  onClick={() => setModelConfigId(model.id)}
                >
                  <span className="model-select-option-name">{model.displayName}</span>
                  <span className="model-select-option-meta">
                    {model.providerType} · {model.modelId}{model.active ? ' · active' : ''}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {showSkillsSection ? (
        <section className="role-config-section" aria-label="Skills">
          <h3 className="role-config-section-title">Skills</h3>
          <div className="skill-select-list role-config-options">
            {roleConfiguration.skills.map((skill) => {
              const selected = selectedSkills.includes(skill.name);
              return (
                <label
                  key={skill.name}
                  className={`skill-select-option model-select-option${selected ? ' model-select-option-selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={(event) => toggleSkill(skill.name, event.target.checked)}
                  />
                  <span>
                    <span className="skill-select-name model-select-option-name">{skill.name}</span>
                    <span className="skill-select-desc model-select-option-meta">{skill.description}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </section>
      ) : null}

      {showMcpSection ? (
        <section className="role-config-section" aria-label="MCP">
          <h3 className="role-config-section-title">MCP</h3>
          <div className="skill-select-list role-config-options">
            {roleConfiguration.mcpServers.map((server) => {
              const selected = selectedMcpServers.includes(server.id);
              return (
                <label
                  key={server.id}
                  className={`skill-select-option model-select-option${selected ? ' model-select-option-selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={(event) => toggleMcpServer(server.id, event.target.checked)}
                  />
                  <span>
                    <span className="skill-select-name model-select-option-name">{server.name}</span>
                    <span className="skill-select-desc model-select-option-meta">
                      {server.transport} · {server.toolNames.length} tools
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </section>
      ) : null}

      <div className="role-config-actions">
        <button
          type="button"
          className="form-btn-submit role-config-submit"
          disabled={submitDisabled}
          onClick={() => onRoleConfigure?.(roleConfiguration.nodeId, {
            modelConfigId: modelConfigId || undefined,
            skills: selectedSkills,
            mcpServers: selectedMcpServers,
          })}
        >
          Continue
        </button>
      </div>

      {!showModelSection && !hasCapabilitySections ? (
        <p className="model-select-empty">No role configuration options are available.</p>
      ) : null}
    </div>
  );
}

function HandoffApprovalBanner({
  handoffApproval,
  onHandoffApproval,
}: {
  handoffApproval: HandoffApprovalPrompt;
  onHandoffApproval?: (nodeId: string, decision: ProtocolHandoffApprovalDecision) => void;
}) {
  const targetLabel = handoffApproval.targets.map((target) => target.target_node_id).join(', ');
  return (
    <div className="consent-banner">
      <div className="consent-banner-body">
        <span className="consent-banner-tool">Proceed with handoff{targetLabel ? ` to ${targetLabel}` : ''}?</span>
        <span className="consent-banner-desc">
          This is a human-collaborative node. Approve to commit the handoff, or decline to keep working with the role.
        </span>
      </div>
      <div className="consent-banner-actions">
        <button
          type="button"
          className="consent-btn consent-btn-allow"
          onClick={() => onHandoffApproval?.(handoffApproval.nodeId, HANDOFF_APPROVAL_DECISION.APPROVE)}
        >
          Approve handoff
        </button>
        <button
          type="button"
          className="consent-btn consent-btn-deny"
          onClick={() => onHandoffApproval?.(handoffApproval.nodeId, HANDOFF_APPROVAL_DECISION.DECLINE)}
        >
          Decline
        </button>
      </div>
    </div>
  );
}

function ContextRing({
  contextWindow,
  contextUsage,
  onCompactContext,
  isCompactingContext = false,
}: {
  contextWindow: number;
  contextUsage: number | null;
  onCompactContext?: () => void;
  isCompactingContext?: boolean;
}) {
  const RADIUS = 16;
  const STROKE = 3;
  const normalizedRadius = RADIUS - STROKE / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const pct = contextUsage != null ? Math.min(contextUsage / contextWindow, 1) : 0;
  const strokeDashoffset = circumference * (1 - pct);
  const pctDisplay = Math.round(pct * 100);

  return (
    <button
      type="button"
      className="context-ring"
      onClick={onCompactContext}
      disabled={!onCompactContext || isCompactingContext}
      aria-label={isCompactingContext ? 'Context compaction in progress' : 'Compact context'}
    >
      <svg width={RADIUS * 2} height={RADIUS * 2} aria-hidden="true">
        <circle cx={RADIUS} cy={RADIUS} r={normalizedRadius} fill="none" stroke="var(--border)" strokeWidth={STROKE} />
        <circle
          cx={RADIUS} cy={RADIUS} r={normalizedRadius}
          fill="none" stroke="var(--accent)" strokeWidth={STROKE}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${RADIUS} ${RADIUS})`}
        />
      </svg>
      <span className="context-ring-pct">{pctDisplay}%</span>
      <div className="context-ring-tooltip">
        <span>{contextUsage != null ? contextUsage.toLocaleString() : '0'} / {contextWindow.toLocaleString()} tokens</span>
        <span className="context-ring-tooltip-action">{isCompactingContext ? 'Compacting context' : 'Click to compact'}</span>
        <span className="context-ring-tooltip-hint">Usage updated at end of LLM turn</span>
      </div>
    </button>
  );
}

export function ChatInterface(props: ChatInterfaceProps) {
  const feedRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const shouldAutoScrollRef = useRef(true);

  const handleFeedScroll = useCallback(() => {
    const element = feedRef.current;
    if (!element) return;

    const distanceFromBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight;
    shouldAutoScrollRef.current = distanceFromBottom < 48;
  }, []);

  useLayoutEffect(() => {
    const element = feedRef.current;
    if (!element || !shouldAutoScrollRef.current) return;
    element.scrollTop = element.scrollHeight;
  }, [props.messages, props.waitingLabel]);

  useLayoutEffect(() => {
    const element = textareaRef.current;
    if (!element) return;

    if (!props.inputValue) {
      element.style.height = '52px';
      element.style.overflowY = 'hidden';
      return;
    }

    const currentScrollTop = element.scrollTop;
    element.style.height = '0px';
    const nextHeight = Math.min(Math.max(element.scrollHeight, 52), 220);
    element.style.height = `${nextHeight}px`;
    element.style.overflowY = element.scrollHeight > 220 ? 'auto' : 'hidden';
    
    if (element.selectionStart === props.inputValue.length) {
      element.scrollTop = element.scrollHeight;
    } else {
      element.scrollTop = currentScrollTop;
    }
  }, [props.inputValue, props.showComposer]);

  const showActionButton = props.canStop || !props.inputDisabled;

  return (
    <section className="panel chat-panel">
      <div className="chat-subtitle-row">
        <p className="panel-copy chat-subtitle">{props.subtitle}</p>
        {props.waitingLabel ? (
          <span className="status-pill status-pill-wait chat-wait-pill">{props.waitingLabel}</span>
        ) : null}
      </div>

      {props.roles && props.roles.length > 0 ? (
        <div className="role-tabs">
          {props.roles.map((role) => (
            <button
              key={role}
              className={`role-tab${props.selectedRole === role ? ' role-tab-active' : ''}${props.activeRoles?.includes(role) ? ' role-tab-live' : ''}`}
              onClick={() => props.onRoleSelect?.(role)}
              type="button"
            >
              {role}
              {props.activeRoles?.includes(role) ? <span className="role-tab-dot" /> : null}
            </button>
          ))}
        </div>
      ) : null}

      <div
        className={`feed${props.messages.length > 0 ? ' feed-has-messages' : ''}`}
        ref={feedRef}
        onScroll={handleFeedScroll}
      >
        {props.messages.length === 0 ? (
          <div className="feed-empty">
            Waiting for runtime output.
          </div>
        ) : (
          props.messages.map((message) => (
            <article key={message.id} className={`feed-item feed-item-${message.type}`}>
              {message.type === 'reasoning' ? (
                renderReasoningFeedItem(message)
              ) : message.type === 'repair' || message.type === 'activation' || message.type === 'handoff' || message.type === 'resume' || message.type === 'tool' || message.type === 'tool-success' || message.type === 'tool-error' ? (
                <div className={`feed-compact-line feed-compact-${message.type}`}>
                  <span className="feed-compact-label">{message.label}</span>
                  <span className="feed-compact-text">{message.text}</span>
                </div>
              ) : (
                <>
                  <p className="feed-label">{message.label}</p>
                  {message.type === 'assistant' ? (
                    <div className="feed-markdown">
                      {renderAssistantMarkdown(message.text)}
                    </div>
                  ) : message.type === 'user' ? (
                    <div className="feed-user-text">
                      {message.text}
                    </div>
                  ) : (
                    <pre className="feed-text">{message.text}</pre>
                  )}
                </>
              )}
            </article>
          ))
        )}
      </div>

      {props.showComposer ? (
        <div className="composer-area">
          {props.roleConfiguration ? (
            <RoleConfigurationBanner
              key={props.roleConfiguration.nodeId}
              roleConfiguration={props.roleConfiguration}
              onRoleConfigure={props.onRoleConfigure}
            />
          ) : null}

          {props.handoffApproval ? (
            <HandoffApprovalBanner
              key={props.handoffApproval.nodeId}
              handoffApproval={props.handoffApproval}
              onHandoffApproval={props.onHandoffApproval}
            />
          ) : null}

          {props.consentRequest ? (
            <div className="consent-banner">
              <div className="consent-banner-body">
                <span className="consent-banner-tool">{consentToolLabel(props.consentRequest)}</span>
                <span className="consent-banner-desc">{consentPromptTitle(props.consentRequest)}</span>
              </div>
              <div className="consent-banner-actions">
                <button
                  type="button"
                  className="consent-btn consent-btn-allow"
                  onClick={() => props.onConsentResponse?.(CONSENT_RESPONSE_DECISION.ALLOW_ONCE)}
                >
                  {props.consentRequest.kind === 'bash-command'
                    ? 'Allow this command'
                    : props.consentRequest.kind === 'mcp-tool'
                      ? 'Allow this tool'
                      : 'Allow'}
                </button>
                <button
                  type="button"
                  className="consent-btn consent-btn-allow-flow"
                  onClick={() => props.onConsentResponse?.(CONSENT_RESPONSE_DECISION.ALLOW_FLOW)}
                >
                  {consentAllowFlowLabel(props.consentRequest)}
                </button>
                <button
                  type="button"
                  className="consent-btn consent-btn-deny"
                  onClick={() => props.onConsentResponse?.(CONSENT_RESPONSE_DECISION.DENY)}
                >
                  Deny
                </button>
              </div>
            </div>
          ) : null}

          <form
            className="composer"
            onSubmit={(event) => {
              event.preventDefault();
              if (props.canStop) return;
              props.onSubmit();
            }}
          >
            <div className="composer-shell">
              <textarea
                ref={textareaRef}
                value={props.inputValue}
                onChange={(event) => props.onInputChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    if (props.canStop) return;
                    if (!props.inputDisabled && props.inputValue.trim().length > 0) {
                      props.onSubmit();
                    }
                  }
                }}
                disabled={props.inputDisabled}
                placeholder={props.placeholder}
                rows={1}
              />
              {showActionButton ? (
                <button
                  type={props.canStop ? 'button' : 'submit'}
                  className={`composer-action${props.canStop ? ' composer-action-stop' : ''}`}
                  onClick={props.canStop ? props.onStop : undefined}
                  disabled={props.canStop ? props.stopRequested : props.inputDisabled || props.inputValue.trim().length === 0}
                  aria-label={props.canStop ? (props.stopRequested ? 'Stopping response' : 'Stop response') : 'Send reply'}
                  title={props.canStop ? (props.stopRequested ? 'Stopping response' : 'Stop response') : 'Send reply'}
                >
                  {props.canStop ? <StopIcon /> : <SendIcon />}
                </button>
              ) : null}
            </div>
          </form>

          <div className="composer-footer">
            {props.contextWindow ? (
              <ContextRing
                contextWindow={props.contextWindow}
                contextUsage={props.latestContextUsage ?? null}
                onCompactContext={props.onCompactContext}
                isCompactingContext={props.isCompactingContext}
              />
            ) : null}
            <select
              className="consent-mode-select"
              value={props.consentMode ?? CONSENT_MODE.NO_ACCESS}
              onChange={(e) => props.onConsentModeChange?.(e.target.value as ConsentMode)}
              title="Tool permission mode for this flow"
            >
              <option value={CONSENT_MODE.NO_ACCESS}>No Access</option>
              <option value={CONSENT_MODE.PARTIAL_ACCESS}>Partial Access</option>
              <option value={CONSENT_MODE.FULL_ACCESS}>Full Access</option>
            </select>
          </div>
        </div>
      ) : null}
    </section>
  );
}

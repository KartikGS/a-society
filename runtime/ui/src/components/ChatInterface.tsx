import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

export interface FeedItem {
  id: string;
  type: 'assistant' | 'event' | 'error' | 'user';
  label: string;
  text: string;
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
  activeRole?: string;
  onRoleSelect?: (role: string) => void;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
}

function normalizeAssistantMarkdown(text: string): string {
  return text.replace(/\$?\\(?:rightarrow|to)\$?/g, '→');
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

export function ChatInterface(props: ChatInterfaceProps) {
  const feedRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const shouldAutoScrollRef = useRef(true);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [props.inputValue]);

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

    element.style.height = '0px';
    const nextHeight = Math.min(Math.max(element.scrollHeight, 72), 220);
    element.style.height = `${nextHeight}px`;
    element.style.overflowY = element.scrollHeight > 220 ? 'auto' : 'hidden';
  }, [props.inputValue, props.showComposer]);

  const showActionButton = props.canStop || !props.inputDisabled;

  return (
    <section className="panel chat-panel">
      <p className="panel-copy chat-subtitle">{props.subtitle}</p>

      {props.roles && props.roles.length > 0 ? (
        <div className="role-tabs">
          {props.roles.map((role) => (
            <button
              key={role}
              className={`role-tab${props.selectedRole === role ? ' role-tab-active' : ''}${props.activeRole === role ? ' role-tab-live' : ''}`}
              onClick={() => props.onRoleSelect?.(role)}
              type="button"
            >
              {role}
              {props.activeRole === role ? <span className="role-tab-dot" /> : null}
            </button>
          ))}
        </div>
      ) : null}

      {props.waitingLabel ? (
        <div className="status-row chat-status-row">
          <span className="status-pill status-pill-wait">{props.waitingLabel}</span>
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
              <p className="feed-label">{message.label}</p>
              {message.type === 'assistant' ? (
                <div className="feed-markdown">
                  <ReactMarkdown>{normalizeAssistantMarkdown(message.text)}</ReactMarkdown>
                </div>
              ) : message.type === 'user' ? (
                <div className="feed-user-text">
                  {message.text}
                </div>
              ) : (
                <pre className="feed-text">{message.text}</pre>
              )}
            </article>
          ))
        )}
      </div>

      {props.showComposer ? (
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
      ) : null}
    </section>
  );
}

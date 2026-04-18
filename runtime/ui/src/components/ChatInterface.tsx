import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

export interface FeedItem {
  id: string;
  type: 'assistant' | 'event' | 'error';
  label: string;
  text: string;
}

interface ChatInterfaceProps {
  title: string;
  subtitle: string;
  messages: FeedItem[];
  waitingLabel: string | null;
  inputValue: string;
  inputDisabled: boolean;
  placeholder: string;
  statusLine?: string;
  roles?: string[];
  selectedRole?: string;
  activeRole?: string;
  onRoleSelect?: (role: string) => void;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
}

export function ChatInterface(props: ChatInterfaceProps) {
  const feedEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [props.messages, props.waitingLabel]);

  return (
    <section className="panel chat-panel">
      <div className="panel-header">
        <p className="eyebrow">Conversation</p>
        <h2>{props.title}</h2>
        <p className="panel-copy">{props.subtitle}</p>
      </div>

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

      <div className="status-row">
        {props.statusLine ? <span className="status-pill">{props.statusLine}</span> : null}
        {props.waitingLabel ? <span className="status-pill status-pill-wait">{props.waitingLabel}</span> : null}
      </div>

      <div className="feed">
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
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                </div>
              ) : (
                <pre className="feed-text">{message.text}</pre>
              )}
            </article>
          ))
        )}
        <div ref={feedEndRef} />
      </div>

      <form
        className="composer"
        onSubmit={(event) => {
          event.preventDefault();
          props.onSubmit();
        }}
      >
        <textarea
          value={props.inputValue}
          onChange={(event) => props.onInputChange(event.target.value)}
          disabled={props.inputDisabled}
          placeholder={props.placeholder}
          rows={3}
        />
        <button type="submit" disabled={props.inputDisabled || props.inputValue.trim().length === 0}>
          Send reply
        </button>
      </form>
    </section>
  );
}

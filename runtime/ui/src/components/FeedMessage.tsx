import { memo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import type { FeedItem } from '../../../shared/types.js';

const REMARK_PLUGINS = [remarkGfm];
const REHYPE_PLUGINS = [rehypeHighlight];

/**
 * Links open in a new tab so agent output can never navigate the console away;
 * tables get a horizontal-scroll wrapper so wide agent tables cannot break the
 * chat pane layout.
 */
const MARKDOWN_COMPONENTS: Components = {
  a: ({ node: _node, children, ...props }) => (
    <a {...props} target="_blank" rel="noopener noreferrer">{children}</a>
  ),
  table: ({ node: _node, children, ...props }) => (
    <div className="feed-table-wrap">
      <table {...props}>{children}</table>
    </div>
  ),
};

function normalizeAssistantMarkdown(text: string): string {
  return text.replace(/\$?\\(?:rightarrow|to)\$?/g, '→');
}

function renderReasoning(message: FeedItem) {
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

const COMPACT_TYPES: ReadonlySet<FeedItem['type']> = new Set([
  'repair', 'activation', 'handoff', 'resume', 'tool', 'tool-success', 'tool-error',
]);

function FeedMessageComponent({ message }: { message: FeedItem }) {
  return (
    <article className={`feed-item feed-item-${message.type}`}>
      {message.type === 'reasoning' ? (
        renderReasoning(message)
      ) : COMPACT_TYPES.has(message.type) ? (
        <div className={`feed-compact-line feed-compact-${message.type}`}>
          <span className="feed-compact-label">{message.label}</span>
          <span className="feed-compact-text">{message.text}</span>
        </div>
      ) : (
        <>
          <p className="feed-label">{message.label}</p>
          {message.type === 'assistant' ? (
            <div className="feed-markdown">
              <ReactMarkdown
                remarkPlugins={REMARK_PLUGINS}
                rehypePlugins={REHYPE_PLUGINS}
                components={MARKDOWN_COMPONENTS}
              >
                {normalizeAssistantMarkdown(message.text)}
              </ReactMarkdown>
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
  );
}

/**
 * Memoized so streaming appends only re-render the item whose object identity
 * changed, instead of re-parsing markdown for the entire feed on every token.
 */
export const FeedMessage = memo(FeedMessageComponent);

import ReactMarkdown, { type Components, type Options as MarkdownOptions } from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { CHAT_SANITIZE_SCHEMA, rehypeFilterStyle } from './sanitize';

const REMARK_PLUGINS = [remarkGfm];
/**
 * Agent-written markdown is untrusted: raw HTML is parsed, then sanitized against the chat
 * allowlist, then `style` is narrowed to plain colors. Highlighting runs last so its
 * `hljs-*` classes survive and raw HTML never reaches the DOM unsanitized.
 */
const REHYPE_PLUGINS: MarkdownOptions['rehypePlugins'] = [
  rehypeRaw,
  [rehypeSanitize, CHAT_SANITIZE_SCHEMA],
  rehypeFilterStyle,
  rehypeHighlight,
];

/**
 * Links open in a new tab so agent output can never navigate the console away;
 * tables get a horizontal-scroll wrapper so wide agent tables cannot break the
 * pane layout.
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

interface MarkdownContentProps {
  text: string;
}

/** The one sanitized markdown pipeline, shared by chat messages and the document view. */
export function MarkdownContent({ text }: MarkdownContentProps) {
  return (
    <div className="feed-markdown">
      <ReactMarkdown
        remarkPlugins={REMARK_PLUGINS}
        rehypePlugins={REHYPE_PLUGINS}
        components={MARKDOWN_COMPONENTS}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

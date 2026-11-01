import type { Element, Root, RootContent } from 'hast';
import { defaultSchema, type Options as SanitizeSchema } from 'rehype-sanitize';

/**
 * Chat HTML sanitization helpers. Assistant, model and host text is untrusted input
 * to the operator's browser; raw HTML in it is parsed by `rehype-raw`, reduced to an
 * allowlist by `rehype-sanitize`, and then passed through `rehypeFilterStyle`, which
 * narrows the `style` attribute (allowed only on a few inline tags) to plain colors.
 */

/** Inline tags that may carry a (subsequently filtered) `style` attribute. */
const STYLED_TAGS = ['span', 'mark', 'kbd', 'sub', 'sup', 'details', 'summary'] as const;

function buildChatSanitizeSchema(): SanitizeSchema {
  // Deep copy: the shared defaultSchema must never be mutated.
  const schema = structuredClone(defaultSchema);
  const tagNames = new Set(schema.tagNames ?? []);
  tagNames.add('span');
  tagNames.add('mark');
  schema.tagNames = [...tagNames];
  const attributes = { ...(schema.attributes ?? {}) };
  for (const tag of STYLED_TAGS) {
    attributes[tag] = [...(attributes[tag] ?? []), 'style'];
  }
  schema.attributes = attributes;
  return schema;
}

/**
 * GitHub-style default schema (scripts stripped, `on*` handlers and unsafe URL
 * protocols dropped, ids clobber-prefixed) plus `span`/`mark` and `style` on a few
 * inline tags. `style` values are narrowed further by `rehypeFilterStyle`.
 */
export const CHAT_SANITIZE_SCHEMA: SanitizeSchema = buildChatSanitizeSchema();

const ALLOWED_STYLE_PROPERTIES: ReadonlySet<string> = new Set(['color', 'background', 'background-color']);
const SAFE_STYLE_VALUE = /^[#a-zA-Z0-9(),.%\s-]+$/;
const FORBIDDEN_STYLE_FRAGMENTS = ['url', 'expression', 'var(', 'image', '\\', '/*'];

/**
 * Keeps only `color` / `background` / `background-color` declarations whose value is a
 * plain color expression. Returns `null` when nothing survives.
 */
export function filterStyleDeclarations(style: string): string | null {
  const kept: string[] = [];
  for (const declaration of style.split(';')) {
    const colon = declaration.indexOf(':');
    if (colon < 0) continue;
    const property = declaration.slice(0, colon).trim().toLowerCase();
    const value = declaration.slice(colon + 1).trim();
    if (!ALLOWED_STYLE_PROPERTIES.has(property) || value === '') continue;
    if (!SAFE_STYLE_VALUE.test(value)) continue;
    const lowered = value.toLowerCase();
    if (FORBIDDEN_STYLE_FRAGMENTS.some((fragment) => lowered.includes(fragment))) continue;
    kept.push(`${property}: ${value}`);
  }
  return kept.length > 0 ? kept.join('; ') : null;
}

function filterNode(node: Root | RootContent): void {
  if (node.type === 'element') filterElementStyle(node);
  if ('children' in node) {
    for (const child of node.children) filterNode(child);
  }
}

function filterElementStyle(element: Element): void {
  const style = element.properties.style;
  if (style === undefined || style === null) return;
  const filtered = typeof style === 'string' ? filterStyleDeclarations(style) : null;
  if (filtered === null) delete element.properties.style;
  else element.properties.style = filtered;
}

/** Rehype plugin: applies `filterStyleDeclarations` to every element's `style`. */
export function rehypeFilterStyle() {
  return (tree: Root): void => {
    filterNode(tree);
  };
}

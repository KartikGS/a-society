// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render } from '@testing-library/react';
import { defaultSchema } from 'rehype-sanitize';
import { afterEach, describe, expect, it } from 'vitest';
import { FeedMessage } from '../../../ui/src/components/FeedMessage';
import { CHAT_SANITIZE_SCHEMA } from '../../../ui/src/components/sanitize';

afterEach(cleanup);

/** Renders assistant markdown and returns the `.feed-markdown` container. */
function renderAssistant(text: string): HTMLElement {
  const { container } = render(
    <FeedMessage message={{ id: 'a', type: 'assistant', label: 'Owner', text }} />,
  );
  const markdown = container.querySelector<HTMLElement>('.feed-markdown');
  if (!markdown) throw new Error('missing .feed-markdown');
  return markdown;
}

describe('chat sanitize schema', () => {
  it('extends the GitHub default without mutating it', () => {
    for (const tag of ['kbd', 'sub', 'sup', 'details', 'summary', 'br']) {
      expect(defaultSchema.tagNames).toContain(tag);
    }
    expect(defaultSchema.tagNames).not.toContain('mark');
    expect(defaultSchema.attributes?.span ?? []).not.toContain('style');
    expect(CHAT_SANITIZE_SCHEMA.tagNames).toEqual(expect.arrayContaining(['span', 'mark']));
    expect(CHAT_SANITIZE_SCHEMA.attributes?.span).toContain('style');
    expect(CHAT_SANITIZE_SCHEMA.attributes?.a ?? []).not.toContain('style');
    expect(CHAT_SANITIZE_SCHEMA.strip).toEqual(defaultSchema.strip);
    expect(CHAT_SANITIZE_SCHEMA.protocols).toEqual(defaultSchema.protocols);
  });
});

describe('assistant inline HTML (sanitized)', () => {
  it('1. renders a colored span', () => {
    const span = renderAssistant('Status: <span style="color: red;">x</span>').querySelector('span');
    expect(span).not.toBeNull();
    expect(span).toHaveTextContent('x');
    expect(span!.getAttribute('style')).toBe('color: red;');
  });

  it('2. renders kbd, sub, sup, mark, details/summary and br', () => {
    const root = renderAssistant(
      'Press <kbd>Ctrl</kbd> H<sub>2</sub>O x<sup>2</sup> <mark>hit</mark><br>next\n\n'
      + '<details><summary>More</summary>Hidden</details>',
    );
    for (const selector of ['kbd', 'sub', 'sup', 'mark', 'br', 'details', 'details > summary']) {
      expect(root.querySelector(selector), selector).not.toBeNull();
    }
  });

  it('3. strips script elements and their contents', () => {
    const root = renderAssistant('before <script>alert(1)</script> after');
    expect(root.querySelector('script')).toBeNull();
    expect(root.textContent).not.toContain('alert(1)');
  });

  it('4. drops iframes', () => {
    const root = renderAssistant('<iframe src="https://example.com"></iframe> text');
    expect(root.querySelector('iframe')).toBeNull();
  });

  it('5. removes event-handler attributes', () => {
    const span = renderAssistant('<span onclick="x()" onmouseover="x()">hover</span>').querySelector('span');
    expect(span).not.toBeNull();
    for (const attr of Array.from(span!.attributes)) {
      expect(attr.name.startsWith('on')).toBe(false);
    }
  });

  it('6. removes javascript: hrefs from raw and markdown links', () => {
    const root = renderAssistant('<a href="javascript:alert(1)">raw</a> and [md](javascript:alert(2))');
    for (const link of Array.from(root.querySelectorAll('a'))) {
      expect(link.getAttribute('href') ?? '').not.toMatch(/javascript:/i);
    }
  });

  it('7. narrows style to color declarations', () => {
    const span = renderAssistant('<span style="color:red; position:fixed; background:url(x)">x</span>').querySelector('span');
    expect(span!.getAttribute('style')).toBe('color: red;');
  });

  it('7b. drops style on tags outside the styled allowlist', () => {
    const root = renderAssistant('<p style="color: red">para</p>');
    expect(root.querySelector('[style]')).toBeNull();
  });

  it('8. strips onerror from images', () => {
    const img = renderAssistant('<img src="x" onerror="alert(1)" alt="pic">').querySelector('img');
    expect(img).not.toBeNull();
    expect(img!.hasAttribute('onerror')).toBe(false);
  });

  it('9. keeps syntax highlighting on fenced code', () => {
    const root = renderAssistant('```js\nconst a = "b";\n```');
    const code = root.querySelector('pre code');
    expect(code).not.toBeNull();
    expect(code!.className).toContain('hljs');
    expect(code!.querySelector('[class^="hljs-"]')).not.toBeNull();
  });

  it('leaves user text as plain text', () => {
    const { container } = render(
      <FeedMessage message={{ id: 'u', type: 'user', label: 'You', text: '<b>bold</b>' }} />,
    );
    expect(container.querySelector('b')).toBeNull();
    expect(container).toHaveTextContent('<b>bold</b>');
  });
});

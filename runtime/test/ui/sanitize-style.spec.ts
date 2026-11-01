import { describe, expect, it } from 'vitest';
import type { Root } from 'hast';
import { filterStyleDeclarations, rehypeFilterStyle } from '../../ui/src/components/sanitize.js';

describe('filterStyleDeclarations', () => {
  it('keeps plain color and background declarations', () => {
    expect(filterStyleDeclarations('color: red;')).toBe('color: red');
    expect(filterStyleDeclarations('background-color: #ffeeaa; color: rgb(10, 20, 30)'))
      .toBe('background-color: #ffeeaa; color: rgb(10, 20, 30)');
    expect(filterStyleDeclarations('BACKGROUND: hsl(120, 50%, 50%)')).toBe('background: hsl(120, 50%, 50%)');
  });

  it('drops layout properties and unsafe values', () => {
    expect(filterStyleDeclarations('color:red; position:fixed; background:url(x)')).toBe('color: red');
    expect(filterStyleDeclarations('background: image-set("x.png" 1x)')).toBeNull();
    expect(filterStyleDeclarations('color: expression(alert(1))')).toBeNull();
    expect(filterStyleDeclarations('color: var(--danger)')).toBeNull();
    expect(filterStyleDeclarations('color: red /* x */')).toBeNull();
    expect(filterStyleDeclarations('color: \\72 ed')).toBeNull();
    expect(filterStyleDeclarations('color: "red"')).toBeNull();
    expect(filterStyleDeclarations('top: 0; z-index: 9999')).toBeNull();
    expect(filterStyleDeclarations('color')).toBeNull();
  });
});

describe('rehypeFilterStyle', () => {
  it('rewrites or removes style on nested elements', () => {
    const tree: Root = {
      type: 'root',
      children: [{
        type: 'element',
        tagName: 'p',
        properties: {},
        children: [
          { type: 'element', tagName: 'span', properties: { style: 'color: red; position: fixed' }, children: [] },
          { type: 'element', tagName: 'mark', properties: { style: 'position: absolute' }, children: [] },
        ],
      }],
    };
    rehypeFilterStyle()(tree);
    const paragraph = tree.children[0];
    if (paragraph.type !== 'element') throw new Error('expected element');
    const [span, mark] = paragraph.children;
    expect(span.type === 'element' && span.properties.style).toBe('color: red');
    expect(mark.type === 'element' && 'style' in mark.properties).toBe(false);
  });
});

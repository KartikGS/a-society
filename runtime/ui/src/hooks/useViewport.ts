import { useEffect, useState } from 'react';

export type Viewport = 'wide' | 'medium' | 'narrow';

const MEDIUM_QUERY = '(max-width: 1100px)';
const NARROW_QUERY = '(max-width: 720px)';

function readViewport(): Viewport {
  if (window.matchMedia(NARROW_QUERY).matches) return 'narrow';
  if (window.matchMedia(MEDIUM_QUERY).matches) return 'medium';
  return 'wide';
}

/**
 * Breakpoint state for the workspace layout: 'wide' keeps the side-by-side
 * panes, 'medium' stacks graph/chat vertically, 'narrow' additionally moves
 * the project sidebar into an overlay drawer.
 */
export function useViewport(): Viewport {
  const [viewport, setViewport] = useState<Viewport>(readViewport);

  useEffect(() => {
    const medium = window.matchMedia(MEDIUM_QUERY);
    const narrow = window.matchMedia(NARROW_QUERY);
    const update = () => setViewport(readViewport());
    medium.addEventListener('change', update);
    narrow.addEventListener('change', update);
    return () => {
      medium.removeEventListener('change', update);
      narrow.removeEventListener('change', update);
    };
  }, []);

  return viewport;
}

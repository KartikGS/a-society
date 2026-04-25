# UI Developer Style Guide

This document is the style authority for `runtime/ui/`. It is loaded at the start of every UI implementation session alongside `$A_SOCIETY_UI_DEV_IMPL_DISCIPLINE`. All UI work must comply with these conventions unless a TA-approved deviation is explicitly recorded in the active completion report.

---

## TypeScript

**Named exports only.** Components, hooks, and utility functions use named exports. No default exports anywhere in `runtime/ui/`.

**`type` imports for type-only usage.** Prefix type-only imports with `type`:
```ts
import type { FlowRun, WorkflowGraph } from '../types';
```

**Interfaces over type aliases for object shapes.** Use `interface` for prop types and data model shapes. Use `type` for discriminated unions, mapped types, and primitives.

**Prop interfaces live in the same file as the component.** Name them `ComponentNameProps`. Export the interface only when the parent needs the type (e.g., `FeedItem` exported from `ChatInterface.tsx` because `App.tsx` consumes it).

**Data model types live in `types.ts`.** `OperatorEvent`, `FlowRun`, `ServerMessage`, `ClientMessage`, `WorkflowGraph` — all server-contract and domain types belong here, not scattered across component files.

**Non-null assertion only when the value is structurally guaranteed.** Use `!` sparingly — only where the preceding code guarantees non-null (e.g., inside a while loop with a shift from a non-empty array). Do not use `!` as a shortcut around missing null checks.

---

## Component Structure

**Function declarations for components.** Not arrow functions:
```ts
// ✓
export function ChatInterface(props: ChatInterfaceProps) { ... }

// ✗
export const ChatInterface = (props: ChatInterfaceProps) => { ... }
```

**Pure computation helpers before the component.** Functions that compute derived values (e.g., `computeDepths`, `buildReactFlowState`, `formatOperatorEvent`) are defined as plain functions above the component in the same file. They do not use hooks and have no side effects.

**One component per file.** Do not colocate sibling components in the same file. Each file exports one primary component (the component matching the filename) plus any interfaces or helpers it needs.

**Components in `src/components/`.** Hooks in `src/hooks/`. Do not create additional subdirectory levels unless the folder would exceed five files.

**3-Pane IDE Layout.** The main workspace uses a persistent 3-pane layout:
- **Left Pane (Sidebar):** Project explorer and creation (`ProjectSelector` acting as a sidebar).
- **Center Pane (Main Editor):** Workflow graph (`GraphView`) or extra project information.
- **Right Pane (Secondary Sidebar):** Role chat interface (`ChatInterface`).

This layout is managed by the `.workspace-grid` class (`280px minmax(0, 1fr) 360px`). Do not implement full-screen toggle views that obscure this persistent layout.

---

## State Model

**State lives in `App.tsx`.** `App` is the single state owner for all cross-component data. Components below `App` are controlled — they receive data and callbacks via props and do not hold local copies of shared state.

**Local state is allowed for two cases only:**
1. UI-only state with no effect on other components (e.g., `feedEndRef` in `ChatInterface` for scroll behavior).
2. Data fetched independently by a component that `App` does not own (e.g., `workflow` state in `GraphView`, which fetches `/api/workflow` on its own polling interval).

When in doubt, lift state to `App`.

**No state management library.** React's built-in `useState`, `useRef`, and `useEffect` are sufficient. Do not introduce Redux, Zustand, Jotai, or any equivalent.

**Functional state updates when the new value depends on the previous value.** Use the callback form of `setState`:
```ts
setRoleFeeds((current) => ({ ...current, [role]: [...existing, item] }));
```

---

## Event Handler Naming

**Handlers defined in `App` use `handleX`.** `handleIncomingMessage`, `handleProjectSelect`, `handleSubmit`, `handleImprovementChoice`.

**Props that accept callbacks use `onX`.** `onMessage`, `onSelect`, `onSubmit`, `onInputChange`, `onRoleSelect`, `onNodeClick`, `onWorkflowLoaded`.

This distinction is structural: `handleX` is an implementation; `onX` is a contract surface. Do not name prop callbacks `handleX`.

---

## Async Patterns

**`void expr` for fire-and-forget async in effects.** Do not make `useEffect` callbacks async directly:
```ts
// ✓
useEffect(() => { void loadWorkflow(); }, [dep]);

// ✗
useEffect(async () => { await loadWorkflow(); }, [dep]);
```

**Cancellable async effects use the `let cancelled` pattern.** Every `useEffect` that starts an async operation must guard against setting state after unmount:
```ts
let cancelled = false;
const run = async () => {
  const result = await fetch(...);
  if (cancelled) return;
  setState(result);
};
void run();
return () => { cancelled = true; };
```

**`window.setInterval` / `window.clearInterval`, not bare globals.** Same for `setTimeout` / `clearTimeout`. This makes the browser API explicit and avoids confusion with Node.js globals.

**Fetch error handling.** On non-`ok` responses, throw with `await response.text()` as the message:
```ts
if (!response.ok) throw new Error(await response.text());
```
Type-assert JSON responses at the call site: `await response.json() as MyType`.

**Silence non-critical async errors with a comment.** Empty catch blocks are permitted only for errors that do not affect the user's ability to continue (e.g., poll failures that will be retried, malformed WebSocket payloads). Always include a comment:
```ts
} catch {
  // Ignore poll errors and keep the last known state.
}
```

---

## WebSocket

**All WebSocket logic belongs in `useWebSocket`.** `App` calls `socket.send(message)` and provides `onMessage`. It does not manage the socket directly.

**Reconnection is the hook's responsibility.** The hook reconnects automatically on close with a 1 s delay. Components do not implement reconnection logic.

**Messages are typed.** The hook accepts `ClientMessage` for sends and delivers `ServerMessage` to the `onMessage` callback. Do not send or receive raw strings.

---

## Styling

**Single flat stylesheet.** All styles live in `src/styles.css`. Do not create CSS Modules, styled-components, Tailwind, or per-component CSS files. The flat model keeps specificity predictable and makes the full token set visible at a glance.

**Custom properties for all design tokens.** Every color, shadow, and font stack that is reused more than once is a CSS custom property on `:root`. Do not hardcode token values inline — consume the variable:
```css
/* ✓ */
color: var(--ink-soft);

/* ✗ */
color: rgba(34, 49, 63, 0.72);
```

**Palette — do not introduce new hues.** The palette is intentional and supports a dual-theme (light/dark) model via `@media (prefers-color-scheme: dark)`. Extend the existing token set before adding new values, and always ensure both light and dark mode variables are defined.

| Token | Light Value | Dark Value | Use |
|---|---|---|---|
| `--bg` | `#f4efe6` | `#0f1115` | Page background base |
| `--surface` | `rgba(255,251,245,0.88)` | `rgba(22,27,34,0.65)` | Panel fill (frosted glassmorphism) |
| `--surface-strong` | `#fffdf9` | `#1c2128` | Modal/input fill |
| `--border` | `rgba(42,54,68,0.12)` | `rgba(205,217,229,0.1)` | Default border |
| `--ink` | `#22313f` | `#cdd9e5` | Primary text |
| `--ink-soft` | `rgba(34,49,63,0.72)` | `rgba(205,217,229,0.65)` | Secondary text, labels |
| `--accent` | `#0f766e` | `#2dd4bf` | Primary interactive |
| `--accent-deep` | `#0b5f58` | `#14b8a6` | Gradient end for buttons |
| `--warning` | `#bb3e03` | `#fb923c` | Error/warning text |
| `--node-active` | `#3b82f6` | `#3b82f6` | Active workflow node |
| `--node-backward` | `#d9485f` | `#f43f5e` | Backward-pass node |
| `--node-complete` | `#2f855a` | `#22c55e` | Completed node |

**Typography — do not introduce new font families.** Three families are in use:

| Family | Use |
|---|---|
| `"IBM Plex Sans"` | Body, UI chrome |
| `"Iowan Old Style", "Palatino Linotype", serif` | Headings (`h1`, `h2`) |
| `"IBM Plex Mono"` | Code, monospaced event text |

Set fonts via the existing `font-family` declarations. Do not add `@font-face` or load new web fonts.

**Class naming — kebab-case BEM-ish.** Follow the established pattern:
- Block: `.feed`, `.panel`, `.composer`, `.graph-node`, `.modal`
- Element suffix: `-header`, `-copy`, `-label`, `-empty`, `-canvas`, `-text`
- Modifier suffix: `-active`, `-live`, `-visible`, `-neutral`, `-wait`

Avoid deep nesting of selectors. Two levels maximum (`.feed-item .feed-label` is acceptable; deeper is not).

**Border radius.**

| Context | Radius |
|---|---|
| Major panels | `28px` |
| Cards, feed items | `18px` |
| Pills, full-round buttons | `999px` |
| Graph canvas, large inner surfaces | `24px` |
| Code/mono blocks | `10px` |
| Inline code | `4px` |

Do not introduce intermediate values without a clear reason.

**Transitions.** Duration range: 120ms–280ms, `ease` easing. Use the shortest duration that feels intentional. Do not use `linear` for UI transitions.

**Animations.** Define `@keyframes` at the top level of `styles.css`. The standing animations are `pulse` (live-role indicator), `fadeIn` (modal overlay), and `slideUp` (modal panel). Add a new `@keyframes` only when the motion serves a clear user signal.

**Responsive breakpoints.** Two breakpoints in use:
- `max-width: 1100px` — stack `.workspace-grid` from two columns to one.
- `max-width: 720px` — mobile: reduce padding, flatten header layouts, shorten graph canvas height.

Do not add intermediate breakpoints without a layout justification.

---

## ReactFlow

**Nodes use JSX labels, not custom node types.** Node appearance is controlled by a `div` with a CSS class modifier (`node-active`, `node-backward`, `node-completed`, `node-neutral`, `node-backward-source`) inside the `data.label` JSX. Do not register custom node types unless the label pattern becomes insufficient.

**Node style resets are applied inline.** The inline `style` on each node clears ReactFlow's default borders and backgrounds so the inner `div` controls all visual state:
```ts
style: { border: 'none', background: 'transparent', boxShadow: 'none', padding: 0, width: 220 }
```
Do not remove these resets.

**Edges use `type: 'straight'`, not animated.** Edge color is `rgba(35, 48, 63, 0.35)` at 2px. Do not use animated edges for the default workflow graph.

**Suppress the attribution badge.** Always include `proOptions={{ hideAttribution: true }}`.

**`nodesDraggable={false}`.** The graph is a read-only display surface. Nodes are not interactive beyond click events.

---

## ID Generation

**`Date.now() + random hex` for ephemeral UI IDs.** This is the `nextFeedId()` pattern. Do not add a UUID library for this purpose.

---

## What Does Not Belong Here

- No server-side code. No modifications to `runtime/src/`.
- No new API endpoints. If additional server data is needed, surface the requirement as a server-contract gap to the TA.
- No global state library, no data-fetching library (React Query, SWR, etc.).
- No component library (MUI, Radix, shadcn/ui, etc.). The UI is custom and intentionally minimal.
- No new font families or icon libraries without Owner direction.
- No inline styles beyond the ReactFlow node style resets described above.

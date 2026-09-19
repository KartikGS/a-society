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

**Prop interfaces live in the same file as the component.** Name them `ComponentNameProps`. Export the interface only when the parent needs the type (e.g., `ConfirmOptions` exported from `ConfirmDialog.tsx` because `use-app-commands.ts` consumes it).

**Data model types live in `runtime/shared/`.** `OperatorEvent`, `FlowRun`, `ServerMessage`, `ClientMessage`, `WorkflowDefinition` — all server-contract and domain types belong to the shared contract layer, not component files. UI-only normalizers live in `src/model-config.ts`.

**Non-null assertion only when the value is structurally guaranteed.** Use `!` sparingly — only where the preceding code guarantees non-null. Do not use `!` as a shortcut around missing null checks.

---

## Component Structure

**Function declarations for components.** Not arrow functions:
```ts
// ✓
export function ChatInterface(props: ChatInterfaceProps) { ... }

// ✗
export const ChatInterface = (props: ChatInterfaceProps) => { ... }
```

**One exception:** `ErrorBoundary` is a class component because React only exposes `getDerivedStateFromError` on classes. No other class components are permitted.

**Pure computation helpers stay close to their ownership boundary.** Component-specific helpers such as `buildReactFlowState` stay above the component in the same file. Cross-component view models, protocol reducers, routing/feed helpers, runtime API wrappers, and command hooks belong under `src/app/`.

**One component per file.** Each file exports one primary component (matching the filename) plus any interfaces or non-exported subcomponents it needs. Extract a subcomponent into its own file when it gains independent consumers or memoization concerns (e.g., `FeedMessage`).

**Components in `src/components/`.** Browser/runtime primitives that are not tied to one component live in `src/app/`. Generic reusable hooks live in `src/hooks/` (`useWebSocket`, `useTheme`, `useViewport`, `useConfirm`). Do not create additional subdirectory levels unless the folder would exceed five files.

**3-Pane IDE Layout.** The main workspace uses a persistent, resizable 3-pane layout:
- **Left Pane (Sidebar):** Project explorer, creation, and record selection (`ProjectSelector`).
- **Center Pane (Main Editor):** Workflow graph (`GraphView`) or `EmptyGraphPanel`.
- **Right Pane (Secondary Sidebar):** Role chat interface (`ChatInterface`).

The layout is managed by `react-resizable-panels` v4 (`Group`/`Panel`/`Separator`). Requirements:
- Pane sizes use **string percentages** (`defaultSize="60%"`); bare numbers mean pixels in v4.
- Every `Panel` has a stable `id` and a `minSize` so panes cannot collapse to slivers.
- Layouts persist via `useDefaultLayout({ id, storage: window.localStorage, panelIds })` wired to `defaultLayout`/`onLayoutChanged` on the `Group`.
- Each pane is wrapped in an `ErrorBoundary` so one pane crashing cannot blank the console.
- Pane wrappers use the `workspace-pane` CSS class — no inline layout styles.

Do not implement full-screen toggle views that obscure this persistent layout.

---

## State Model

**`App.tsx` owns cross-component state; `src/app/` owns orchestration helpers.** `App` remains the shell that holds shared React state, lifecycle effects, and layout composition. Cross-component derivation and command logic live in `src/app/` modules.

Standing `src/app/` responsibilities include:
- Active-flow view-model derivation (`active-flow-view.ts`)
- User command wiring (`use-app-commands.ts`)
- Server-message application (`server-messages.ts`)
- Runtime REST wrappers (`runtime-api.ts`)
- Feed, routing, role, and modal-copy helpers

**Local state is allowed for two cases only:**
1. UI-only state with no effect on other components (e.g., scroll anchoring refs in `ChatInterface`).
2. Data fetched independently by a component that `App` does not own (e.g., `workflow` state in `GraphView`) — the fetch itself still goes through `runtime-api.ts`.

**No state management library.** React's built-ins are sufficient. Do not introduce Redux, Zustand, Jotai, or any equivalent.

**Functional state updates when the new value depends on the previous value.** Use the callback form of `setState`.

**Derived resets happen during render, not in effects.** When state must reset because a prop/derived value changed (e.g., closing the drawer when the viewport widens), use the adjust-during-render pattern, not `useEffect` + `setState` — `react-hooks/set-state-in-effect` enforces this.

---

## Event Handler Naming

**Handlers defined by the app shell or command hooks use `handleX`.** `handleIncomingMessage`, `handleProjectSelect`, `handleSubmit`.

**Props that accept callbacks use `onX`.** `onMessage`, `onSelect`, `onSubmit`, `onRoleSelect`, `onWorkflowLoaded`.

This distinction is structural: `handleX` is an implementation; `onX` is a contract surface. Do not name prop callbacks `handleX`.

---

## Async & Data Access

**All HTTP goes through `src/app/runtime-api.ts`.** Components and hooks never call `fetch` directly — they call a named wrapper that centralizes error extraction (`responseText`) and response normalization. If an endpoint has no wrapper yet, add one.

**`void expr` for fire-and-forget async in effects.** Do not make `useEffect` callbacks async directly.

**Cancellable async effects use the `let cancelled` pattern.** Every `useEffect` that starts an async operation must guard against setting state after unmount.

**`window.setInterval` / `window.clearInterval`, not bare globals.** Same for `setTimeout` / `clearTimeout`.

**Silence non-critical async errors with a comment.** Empty catch blocks are permitted only for errors that do not affect the operator's ability to continue, and always carry a comment.

---

## WebSocket

**All WebSocket logic belongs in `useWebSocket`.** `App` calls `socket.send(message)` and provides `onMessage`. Reconnection (1 s delay) is the hook's responsibility. Messages are typed (`ClientMessage`/`ServerMessage`). Server-message application belongs in `src/app/server-messages.ts`; the hook stays transport-only.

**Connection state is visible.** When the socket is not open, `App` renders the `connection-pill` status indicator in addition to disabling controls — never silently disable.

---

## Styling & Theming

**Area-split stylesheet with one import cascade.** Styles live under `src/styles/` as area files; `src/styles.css` is the single import entry. `base.css` holds design tokens plus shared chrome; area files (`chat.css`, `feed.css`, `graph.css`, `settings.css`, `toast.css`, …) hold feature-specific selectors. No CSS Modules, styled-components, Tailwind, or per-component CSS files.

**Raw color values exist only in `base.css`.** This is a hard rule enforced by stylelint (`npm run lint:css`, part of `npm run check`): outside `base.css`, hex values, named colors, and color functions (`rgb()`, `hsl()`, `color-mix()`, …) are lint errors. Every color, shadow, and gradient endpoint is consumed as `var(--token)`.

**The theme is a token swap.** Light values are defined on `:root`; the dark theme is a single `:root[data-theme="dark"]` block in `base.css` that redefines tokens only. **Never add per-selector dark overrides in area files** — if a component looks wrong in dark mode, the fix is a better token, not an override.

**Theme resolution is JS-owned.** A pre-paint script in `index.html` stamps `data-theme` on `<html>` from `localStorage` (`a-society-theme`) falling back to `prefers-color-scheme`; `useTheme` keeps it in sync afterward and powers the `ThemeToggle` (Light / Dark / System) in the sidebar dock. CSS never branches on `prefers-color-scheme` directly.

**Token vocabulary.** Prefer semantic tokens over primitives at call sites:

| Group | Tokens |
|---|---|
| Surfaces | `--bg`, `--page-bg`, `--surface`, `--surface-strong`, `--surface-raised`, `--surface-muted`, `--surface-hover`, `--surface-active`, `--surface-selected`, `--surface-inset`, `--backdrop` |
| Lines & text | `--border`, `--border-soft`, `--border-strong`, `--edge`, `--ink`, `--ink-soft` |
| Accent | `--accent`, `--accent-deep`, `--on-accent`, `--accent-faint`, `--accent-soft`, `--accent-soft-strong`, `--accent-border`, `--accent-border-soft`, `--accent-focus`, `--accent-surface` |
| Status | `--success(-soft/-ink)`, `--danger(-soft/-ink/-border)`, `--on-danger`, `--warning(-soft/-faint/-ink/-border)`, `--info`, `--info-deep`, `--on-info(-soft)`, `--info-border` |
| Code | `--code-bg`, `--syn-keyword`, `--syn-title`, `--syn-string`, `--syn-comment`, `--syn-constant`, `--syn-attr` |
| Nodes & canvas | `--node-active`, `--node-awaiting-human`, `--node-backward`, `--node-backward-source`, `--node-complete`, `--node-neutral`, `--canvas-glow`, `--canvas-base` |
| Chrome | `--control-track`, `--control-thumb`, `--select-chevron`, `--shadow`, `--shadow-panel`, `--shadow-sm`, `--shadow-pop`, `--shadow-modal`, `--shadow-node`, `--shadow-selected` |
| Layering | `--z-panel` (1), `--z-handle` (10), `--z-tooltip` (60), `--z-drawer` (80), `--z-toast` (1000). Dialogs use the native top layer, not z-index. |

Extend the token set before adding new values; a new hue requires TA sign-off.

**Class naming — kebab-case BEM-ish.** Block (`.feed`, `.panel`, `.composer`, `.graph-node`, `.toast`), element suffix (`-header`, `-copy`, `-label`), modifier suffix (`-active`, `-live`, `-wait`). Two levels of selector nesting maximum.

**Border radius scale.**

| Context | Radius |
|---|---|
| Major panels | `0` (flat, edge-to-edge IDE look) |
| Compact accents (feed compact lines, selects) | `6px` |
| Small controls (mini buttons, mode tabs, reasoning blocks, tooltips) | `8px` |
| Inputs, code blocks, nav items, toasts | `10px` |
| Rows and banners (sidebar rows, consent/role-config banners) | `12px` |
| Cards, feed items, modal choices | `14px`–`18px` |
| Graph canvas, dialogs | `24px` |
| Pills, circular buttons | `999px` |
| Inline code | `4px` |

Do not introduce intermediate values without a clear reason.

**Spacing.** Use multiples of 2px with a strong preference for 4/8/12/16/20/24/32. Do not introduce odd one-off values.

**Transitions.** Duration range: 120–280 ms, `ease` easing. Do not use `linear` for UI transitions.

**Motion & reduced motion.** Standing animations: `pulse` (live indicator), `fadeIn` (backdrops), `slideUp` (dialogs/toasts), `drawerIn` (sidebar drawer). `base.css` globally collapses animations/transitions under `prefers-reduced-motion: reduce`; new motion must survive that collapse gracefully. Add a new `@keyframes` only when the motion serves a clear user signal.

**Focus.** A global `:focus-visible` outline (2px accent) is defined in `base.css`. Never remove focus indicators; component styles may restyle but not hide them.

---

## Typography

Fonts are **self-hosted via `@fontsource` packages** and imported in `main.tsx`; they are bundled by Vite, so the UI renders identically offline and across platforms. No font CDNs, no `@font-face` written by hand.

| Family | Weights | Use |
|---|---|---|
| `"IBM Plex Sans"` | 400/500/600/700 | Body, UI chrome |
| `"Iowan Old Style", "Source Serif 4", "Palatino Linotype", serif` | 600/700 (Source Serif 4) | Headings — Iowan renders where installed (macOS); Source Serif 4 is the bundled guarantee |
| `"IBM Plex Mono"` | 400/600 | Code, monospaced event text |

Minimum text size is 10px (context-ring percentage); metadata floors at 11px; body text is 14px.

---

## Iconography

**`lucide-react` is the approved icon set** (Owner-approved). Rules:
- Import icons individually (`import { X, Send } from 'lucide-react'`) — the package tree-shakes.
- Never use text glyphs (`×`, `x`, `⋮`, `←`, `&larr;`) as icons.
- Icon-only buttons always carry `aria-label` (and usually `title`); decorative icons carry `aria-hidden="true"`.
- Size via the button's CSS (`.some-btn svg { width/height }`); standard sizes are 14–22px.

---

## Dialogs & Destructive Actions

**All modals are native `<dialog>` elements via the shared `Modal` component** (`src/components/Modal.tsx`). The top layer provides focus trapping, Esc handling, and `::backdrop`; `Modal` adds backdrop-click dismissal, focus restoration on unmount, and a `required` mode that blocks dismissal for decisions the operator must make (initial settings, improvement choice, feedback consent). Never build an overlay-div modal.

**`window.confirm` / `window.alert` / `window.prompt` are forbidden.** Confirmations use `useConfirm()` + `ConfirmDialog`:
```ts
const confirmed = await confirm({ title, body, confirmLabel });
```
Destructive actions phrase the consequence in the body and use a specific `confirmLabel` ("Delete flow", not "OK"). **Project deletion uses `typeToConfirm`** (the folder name) because it removes a folder and all runtime state.

---

## Toasts

Notifications render in the `toast-stack` (top-right), newest last, capped at 4. Tones: `error` (12 s, `role="alert"`) and `success` (4 s, `role="status"`). Mutating settings operations surface a success toast; errors always surface a toast rather than failing silently. Use `notify(message, tone)` from `App`; `SettingsModal` receives `onError`/`onSuccess`.

---

## Feed & Markdown

- Agent markdown renders through `FeedMessage` (memoized) with `remark-gfm` and `rehype-highlight`. Do not hand-parse markdown constructs.
- Links in agent output always get `target="_blank" rel="noopener noreferrer"` via the `components` override; tables are wrapped in `.feed-table-wrap` for horizontal scroll.
- Syntax colors come from `--syn-*` tokens, not a highlight.js theme import.
- The feed container is `role="log"` with `aria-live="polite"`; auto-scroll anchors to the bottom with a 48px threshold and a "Jump to latest" pill when scrolled up.
- The composer submits on Enter (Shift+Enter for newline) and **must check `event.nativeEvent.isComposing`** so IME users can confirm characters safely.

---

## Responsive Breakpoints

Two breakpoints, driven by `useViewport()` (`wide` > 1100px ≥ `medium` > 720px ≥ `narrow`):

- **medium:** the graph/chat `Group` switches to `orientation="vertical"` (graph above chat). The sidebar pane persists.
- **narrow:** the sidebar leaves the panel row and becomes an overlay drawer (`sidebar-drawer` + `drawer-backdrop`), toggled from the workspace toolbar.

CSS media queries handle only cosmetic adjustments (padding, stacking headers); structural layout changes are JS-driven through `useViewport`. Do not add breakpoints without a layout justification.

---

## ReactFlow

**Nodes use JSX labels, not custom node types.** Node appearance is a `div` with a class modifier (`node-active`, `node-backward`, `node-completed`, `node-neutral`, `node-awaiting-human`, `node-backward-source`) inside `data.label`.

**Node style resets are applied inline.** The inline `style` on each node clears ReactFlow's default chrome so the inner `div` controls all visual state. This is the **only** permitted inline-style site in `runtime/ui/`.

**Theming goes through ReactFlow's CSS variables.** Controls, minimap, and edges are themed by setting `--xy-*` variables on `.graph-canvas .react-flow` (see `graph.css`) — never `!important` overrides of `.react-flow__*` internals. Edges: `--xy-edge-stroke: var(--edge)` at width 2, `type: 'straight'`, not animated.

**Suppress the attribution badge** (`proOptions={{ hideAttribution: true }}`) and keep `nodesDraggable={false}`.

---

## ID Generation

**`Date.now() + random hex` for ephemeral UI IDs** (`nextFeedId()`). Do not add a UUID library for this purpose.

---

## Testing

- **Logic specs** (reducers, view models, equality helpers) live in `test/ui/*.spec.ts` and run in the node environment.
- **Component specs** live in `test/ui/components/*.spec.tsx` with a `// @vitest-environment jsdom` docblock, using Testing Library (`render`/`screen`/`fireEvent`/`user-event`) and `@testing-library/jest-dom/vitest` matchers. They are typechecked by the `tsconfig.test-ui.json` project.
- **Axe smoke tests** (`vitest-axe`) cover key surfaces with `color-contrast` and `region` rules disabled (jsdom limits); new interactive surfaces should be added to `axe-smoke.spec.tsx`.
- Shared DOM shims (dialog, matchMedia) live in `test/ui/components/setup-dom.ts`.
- Query by **role and accessible name**, not by class, wherever practical.

---

## What Does Not Belong Here

- No server-side code. No modifications to `runtime/src/`.
- No new API endpoints. If additional server data is needed, surface the requirement as a server-contract gap to the TA.
- No global state library, no data-fetching library (React Query, SWR, etc.).
- No component library (MUI, Radix, shadcn/ui, etc.). The UI is custom and intentionally minimal; headless layout utilities (`react-resizable-panels`) and `lucide-react` icons are the approved exceptions.
- No new font families beyond the three bundled ones, and no font/asset CDNs.
- No raw `fetch` outside `src/app/runtime-api.ts`.
- No `window.confirm`/`alert`/`prompt`; no overlay-div modals.
- No raw color values outside `base.css`; no per-selector dark-mode overrides.
- No inline styles beyond the ReactFlow node style resets.

# A-Society documentation site

The public documentation site at **https://a-society.dev**, built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build). The Technical Writer role owns this folder. The one exception is `public/install.sh`, whose content belongs to the Orchestration Developer.

`site/` is its own npm package. It is not part of the runtime package and the repository is not an npm workspace.

---

## Layout

| Path | Contents |
|---|---|
| `src/pages/index.astro` | Landing page (standalone, no Starlight layout) |
| `src/pages/docs/index.astro` | Redirects `/docs` to `/docs/getting-started` |
| `src/content/docs/docs/` | Guide pages: Getting Started, Runtime Guide, Model Configuration, MCP & Skills, Concepts, Flow Types |
| `src/content/docs/internals/` | Internals pages: Architecture, Flow State, Role Sessions |
| `astro.config.mjs` | Site configuration and sidebar |
| `public/install.sh` | The install script served at `https://a-society.dev/install.sh`. Copied to the build output unchanged. Do not move or rename it |
| `vercel.json` | Vercel build settings kept in the repo (the skip-build rule) |
| `.nvmrc` | Node.js major version for local builds and CI |

## Where each page's facts come from

Each page records its sources in a `sources` list in its frontmatter (the landing page in its frontmatter comment). Overlap decisions:

| Page | Overlaps with | Authoritative copy |
|---|---|---|
| Runtime Guide, Getting Started, Flow Types, Model Configuration, MCP & Skills | `runtime/INVOCATION.md` | `INVOCATION.md`. The pages summarize for newcomers and link to it. If they disagree, fix the page, or route the reference change to the Orchestration Developer |
| Internals pages | `a-docs/executable/architecture.md` | The executable architecture and the code. The internals pages are a non-authoritative walkthrough and say so at the top |
| Landing page | `README.md` | `README.md` for the project's public framing and promise; the landing page derives from it |

The feedback-report banner in the runtime UI links to the `#submitting-a-feedback-report` heading of `runtime/INVOCATION.md` on GitHub, not to this site. The site links to that heading too.

---

## Build locally

Requires Node.js 22.12 or later (Astro 6). With nvm: `nvm use` in this folder.

```bash
cd site
npm ci
npm run dev       # local dev server at http://localhost:4321
npm run build     # production build into site/dist/
npm run preview   # serve the built site
```

`node_modules/`, `dist/`, and `.astro/` are ignored by `site/.gitignore`.

## Build check in CI

`.github/workflows/site-ci.yml` runs `npm ci` and `npm run build` in `site/` on pull requests and pushes to `main` that change `site/**` or the workflow itself. It also checks that `dist/install.sh` is byte-identical to `public/install.sh`.

---

## Deployment

### Today (before cutover)

Vercel builds the separate repository `KartikGS/a-society-site` on every merge to its `main` and serves it at a-society.dev. That repository is frozen from the copy into `site/` onward (copied from its `main` at `b5dd60e`); make site changes here, not there.

### After cutover

The same Vercel project builds this repository:

| Vercel setting | Value |
|---|---|
| Git repository | `KartikGS/a-society` |
| Root Directory | `site` |
| Production branch | `main` |
| Framework preset | Astro (auto-detected) |
| Build command / output | defaults (`npm run build`, `dist`) |
| Node.js version | 22.x or later (from `engines.node` in `package.json`; set it in the dashboard if Vercel does not pick it up) |
| Domain | `a-society.dev` stays on this project, so there is no DNS change |

**Skipping builds.** `vercel.json` sets `ignoreCommand` to `git diff --quiet HEAD^ HEAD -- .`. Vercel runs it from the Root Directory, so a commit that changes nothing under `site/` exits 0 and the build is skipped. If the project's dashboard has its own **Ignored Build Step** command set, clear it (Settings → Git → Ignored Build Step → Automatic) so the repo setting applies.

### Cutover steps (the human, after this folder is merged to `main`)

1. **Switch the Git repository and the Root Directory.** In the Vercel project for a-society.dev: Settings → Git → disconnect `KartikGS/a-society-site` and connect `KartikGS/a-society`. Then Settings → Build and Deployment → Root Directory: `site`. Check that the production branch is `main` and the Node.js version is 22.x or later.
2. **Redeploy.** Deployments → redeploy the latest `main` commit (or push a commit under `site/`). If the build fails, the current deployment keeps serving.
3. **Verify a-society.dev and the install URL.** See [Verify a deployment](#verify-a-deployment).
4. **Archive `a-society-site`.** On GitHub, Settings → Archive this repository. Its history stays readable there. Delete the local folder when ready.

### Verify a deployment

```bash
# Landing page and docs respond
curl -fsSI https://a-society.dev/ | head -1
curl -fsSI https://a-society.dev/docs/getting-started/ | head -1

# The install script is served and matches the repo copy
curl -fsSL https://a-society.dev/install.sh | cmp - site/public/install.sh && echo "install.sh matches"
```

Then open https://a-society.dev in a browser: the landing page loads, the sidebar pages open, and search returns results. Check that the Vercel deployment's commit is the expected `main` commit.

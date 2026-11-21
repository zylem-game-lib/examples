# Zylem Examples

Example applications and playground for the [Zylem](https://github.com/zylem-game-lib/zylem) game framework.

Live demos: [https://zylem-examples.onrender.com/](https://zylem-examples.onrender.com/)

This repository replaces the older showcase that was pinned to `@zylem/game-lib@0.3.16`. It now ships the current demos suite plus the SpacetimeDB multiplayer server used by the multiplayer lobby example.

## Requirements

- Node >= 22.12.0
- pnpm >= 10.32.1
- A WebGPU-capable browser
- [SpacetimeDB CLI](https://spacetimedb.com/install) for multiplayer demos

## Quick start

```bash
pnpm install
pnpm dev
```

Vite serves the app on [http://localhost:9001](http://localhost:9001) by default.

Run `pnpm build` followed by `pnpm preview` to try the production bundle locally. On localhost, Vite proxies demo assets through `/cdn`. The deployed gallery loads them directly from the CDN.

### Multiplayer (optional)

```bash
pnpm server:start          # terminal A — SpacetimeDB on 127.0.0.1:2001
pnpm server:dev            # terminal B — build + publish local DBs
pnpm dev                   # terminal C — Vite client
```

Regenerate client bindings after schema changes:

```bash
pnpm server:generate:bindings
```

## Dependencies

Published `@zylem/*` packages:

- `@zylem/game-lib`
- `@zylem/behaviors` (used by the destructible geometry worker)
- `@zylem/editor`
- `@zylem/ui`
- `@zylem/shaders`
- `@zylem/assets`
- `@zylem/bridge` (direct for Vite/pnpm resolution; also used transitively by game-lib/editor)

The lockfile resolves one copy of `@zylem/game-lib@0.11.0` for the gallery and editor. The published `@zylem/editor@0.9.14` still declares a `^0.9.15` game-lib peer, so pnpm reports a warning. The version-specific patches in `patches/` make the legacy collider field optional in the behaviors types and guard empty slider values in the UI package.

Local engine iteration uses the polyrepo manager (`zw link`) against sibling checkouts under `zylem-projects/`.

## Scripts

| Script                               | Description                    |
| ------------------------------------ | ------------------------------ |
| `pnpm dev`                           | Vite playground                |
| `pnpm build`                         | Production SPA → `dist/`       |
| `pnpm test:e2e`                      | Playwright e2e                 |
| `pnpm screenshot:local`              | Capture every demo screenshot  |
| `pnpm screenshot:local -- --missing` | Capture demos that have no PNG |
| `pnpm screenshot:local -- <id>`      | Capture one demo               |
| `pnpm server:start`                  | Start SpacetimeDB              |
| `pnpm server:dev`                    | Build + publish local modules  |
| `pnpm render:build`                  | Render static-site build       |

## Screenshots

`pnpm screenshot:local` starts the Vite app when it is not already running and writes `screenshots/<id>.png`. Pass `--missing` to skip demos that already have a file, or a demo id to capture just that one.

Pushing to `main` runs `.github/workflows/screenshots.yml`, which captures every demo and uploads the PNGs to the R2 bucket behind `assets.zylem.cloud` at `examples/previews/<id>.png`. The job does not commit the files. It needs these Actions secrets:

- `CLOUDFLARE_API_TOKEN` — account token with R2 edit on the bucket
- `CLOUDFLARE_ACCOUNT_ID`
- `R2_BUCKET` — the bucket name behind `assets.zylem.cloud`

The Render static site reads them from `https://assets.zylem.cloud/examples/previews` (`VITE_EXAMPLES_PREVIEW_CDN_BASE_URL` in `render.yaml`). A local `pnpm dev` keeps using the PNGs in `screenshots/`.

## Deploy (Render)

`render.yaml` defines a split deploy:

1. **zylem-spacetimedb-api** — Docker SpacetimeDB API (`server/render/Dockerfile.api`)
2. **zylem-examples** — static site from `dist/` with `VITE_STDB_URI` pointing at the API

Build command: `sh ./scripts/render-build.sh`

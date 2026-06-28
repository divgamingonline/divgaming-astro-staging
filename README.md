# DivGaming Astro Production Port Release

This package uses the uploaded production site as the source of truth.

It is not a UI rewrite. It is a production-parity Astro staging build.

## What this package does

- Serves the current production DivGaming site through the Astro/GitHub Pages build pipeline.
- Preserves the production homepage, Mission Control, SHD terminal, Agent Backpack, vendor countdown, server status card, production CSS, production JS, data files, and mobile app behavior.
- Uses Node 24 in GitHub Actions.
- Adds a build-time QA script before Astro build.
- Patches staging URLs for `/divgaming-astro-staging`.
- Marks staging as `noindex, nofollow`.

## Critical install instruction

This is a clean replacement, not a merge patch.

In GitHub Desktop:

1. Open `divgaming-astro-staging`.
2. Choose **Repository → Show in Explorer**.
3. Delete the current repo contents except the hidden `.git` folder.
4. Copy the contents of this package into the repo root.
5. Commit: `Replace staging with production-parity Astro port`
6. Push origin.

Do not merge this over the old Astro files. Old `src/pages` files will override production parity if they are left behind.

## QA gate included

`npm run build` runs:

```bash
node scripts/qa-parity-check.mjs
astro build
```

The QA script checks for production homepage markers:

- global search
- SHD terminal
- Mission Control
- Agent Backpack
- vendor countdown
- network status card
- production resources/build grids
- required CSS, JS, data, and route files
- noindex staging behavior
- Node 24

## What to check after deployment

Open:

- `https://divgamingonline.github.io/divgaming-astro-staging/`
- `https://divgamingonline.github.io/divgaming-astro-staging/division-2/`
- `https://divgamingonline.github.io/divgaming-astro-staging/division-2/builds/`
- `https://divgamingonline.github.io/divgaming-astro-staging/division-2/tools/`
- `https://divgamingonline.github.io/divgaming-astro-staging/division-2/tools/vendor-reset/`
- `https://divgamingonline.github.io/divgaming-astro-staging/division-2/tools/expertise-cost-tracker/`
- `https://divgamingonline.github.io/divgaming-astro-staging/division-2/tools/exotic-source-tracker/`
- `https://divgamingonline.github.io/divgaming-astro-staging/division-2/tools/gearset-matrix/`

The homepage should visually match production first. Any future Astro component/data improvements should happen only after this parity baseline is confirmed.

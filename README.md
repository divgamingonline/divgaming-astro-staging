# DivGaming Astro Staging

This is the Phase 1 Astro staging scaffold for DivGaming.com.

## Purpose

This repository is a safe playground for migrating DivGaming from vanilla static HTML/JS to Astro without touching the live `divgaming.com` GitHub Pages deployment.

## Important

Do not add `CNAME` to this staging repo.

The live custom domain should stay attached only to the current live repo until the Astro migration is ready for cutover.

## Local setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## GitHub Pages

Set repository Pages source to:

```text
GitHub Actions
```

The included workflow builds Astro and deploys `dist/` to GitHub Pages.

## Expected staging URL

```text
https://divgamingonline.github.io/divgaming-astro-staging/
```

If the repo name is different, update these files before commit:

- `astro.config.mjs`
- `.github/workflows/deploy.yml`
- `public/manifest.json`

# Production Port QA Report

Source uploaded file: `divgaming-main.zip`

## Package contents

- Served production files copied into `public/`: 2290
- HTML pages copied/patched: 2115
- Production CSS copied: `assets/css/styles.min.css`, `assets/css/mobile.min.css`
- Production JS copied: `assets/js/app.min.js`, `assets/js/mobile-app.min.js`
- Production data copied: `data/`
- Production routes copied: `division-2/`, `share/`, `admin/`

## Production parity markers checked

The build QA checks that the homepage includes:

- `global-search`
- `shd-terminal`
- `Mission Control`
- `Agent Backpack`
- `vendor-countdown-mini`
- `server-status-card`
- `resources-grid`
- `builds-grid`
- `submit`

## Staging adjustments

- Internal root paths are prefixed with `/divgaming-astro-staging`.
- Production domain references are patched to `https://divgamingonline.github.io/divgaming-astro-staging` for staging.
- HTML pages are marked `noindex, nofollow`.
- Service worker registration is patched to `/divgaming-astro-staging/sw.js`.
- Manifest `start_url` and `scope` are patched to `/divgaming-astro-staging/`.

## Important

This package intentionally does not continue the previous partial Astro rewrite. It restores production parity first.

# DivGaming Astro Production-Parity Reset

This is a controlled reset of the Astro staging build.

## Goal

Match the stable production DivGaming direction first, then improve functionality after the pages are stable.

This reset intentionally avoids:
- experimental footer concepts
- stacked mobile hotfix files
- dynamic video detail routes that can break builds
- overlapping SHD/lore-heavy labels
- complicated layouts that collapse on mobile

## What is included

- Clean Astro project files
- One consolidated stylesheet: `src/styles/global.css`
- Production-style homepage and mobile experience
- Stable Division 2 hub
- Stable tools hub and searchable tool databases
- Brand set / gearset / exotic / named-high-end color treatments
- Division 2 icon assets restored
- Build/video cards that open YouTube directly
- Save-for-later build buttons using browser localStorage
- Saved Builds page
- Creator directory
- Guide routes
- Mobile bottom app-style navigation
- Mobile "Buy me a coffee" sheet
- Footer socials above Support the Project
- Launch status band

## Important reset instruction

Before copying this package into the staging repo, delete the existing folders:

- `src`
- `public`
- `data`

Then copy this package in.

That removes old broken routes and old hotfix files.

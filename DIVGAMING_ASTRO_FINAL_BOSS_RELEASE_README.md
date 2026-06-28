# DivGaming Astro Final Boss Release

This is a complete Astro staging replacement package, not a small patch.

## Install method

Use GitHub Desktop. Copy the contents of this package into the root of `divgaming-astro-staging`, let it merge/replace files, commit, and push.

## Commit message

`Release DivGaming Astro final boss build`

## What this release is built to do

- Preserve the production DivGaming mission-control aesthetic.
- Keep the Astro architecture clean and data-driven.
- Use the same components/data for desktop and mobile.
- Remove public-facing debug/source/filler text.
- Keep internal source references in JSON metadata only.
- Add Node 24 workflow support.
- Include production route coverage for Vendor Reset and Expertise planning.

## Public UX rules enforced

- No public `Source:` lines on item cards.
- No `Delta` wording.
- No `Needs source` wording.
- Exotics use `Exotic Talent`.
- Exotics do not show the Prototype System.
- Named items use `Perfect Talent` or `Named Attribute`.
- Brand sets use `Brand Set Bonuses`.
- Gear sets use `Gear Set Bonuses`.
- Prototype System appears only on eligible non-exotic gear/weapons.
- PvE/PvP tabs appear only when mode-specific values differ.
- Filters are structural, not keyword-derived.

## Pages included

- `/`
- `/division-2/`
- `/division-2/builds/`
- `/division-2/builds/striker/`
- `/division-2/builds/pve/`
- `/division-2/builds/solo/`
- `/division-2/builds/pvp/`
- `/division-2/videos/`
- `/division-2/saved/`
- `/division-2/creators/`
- `/division-2/guides/`
- `/division-2/tools/`
- `/division-2/tools/vendor-reset/`
- `/division-2/tools/expertise-cost-tracker/`
- `/division-2/tools/exotic-source-tracker/`
- `/division-2/tools/named-items-database/`
- `/division-2/tools/brand-set-database/`
- `/division-2/tools/gearset-matrix/`
- `/division-2/tools/gear-talents/`
- `/division-2/tools/weapon-talents/`
- `/404/`

## QA checklist after GitHub Actions deploys

1. Homepage loads with DivGaming/Division 2 branding and no broken logo/images.
2. Desktop nav works.
3. Mobile bottom nav works.
4. Search works in header and database pages.
5. Named Items Database does not show whole-page fake filters like Exotic 60, Damage 60, Skill 60, Armor 60.
6. Lefty shows a Perfect Talent card without source/debug text.
7. The Hollow Man shows Named Attribute language, not Perfect Talent.
8. Exotics show Exotic Talent and no Prototype System.
9. Brand sets show Brand Set Bonuses.
10. Gear sets show Gear Set Bonuses.
11. Prototype System appears collapsed on eligible non-exotic gear/weapons only.
12. Vendor Reset route works.
13. Expertise route works.
14. Saved Builds page works with localStorage.
15. No public card displays `Source:`, `Delta`, or `Needs source`.

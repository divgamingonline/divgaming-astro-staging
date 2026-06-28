import iconManifest from '../../data/division-2/icon-manifest.json';
import { asArray, assetSlug } from './shared';

export type ToolItem = Record<string, any>;

const manifest: any = iconManifest;

type TalentInfo = {
  perfectName: string;
  regularName: string;
  perfectDescription: string;
  regularDescription: string;
  difference: string;
};

const TALENT_INFO: Record<string, TalentInfo> = {
  'Perfectly Wicked': {
    perfectName: 'Perfectly Wicked',
    regularName: 'Wicked',
    perfectDescription: 'Applying a status effect activates a stronger weapon-damage window.',
    regularDescription: 'Wicked grants weapon damage after applying a status effect.',
    difference: 'The perfect version is the named-item upgrade with a stronger bonus window than the regular talent.'
  },
  'Perfectly Measured': {
    perfectName: 'Perfectly Measured',
    regularName: 'Measured',
    perfectDescription: 'Splits the magazine into two firing phases, changing rate of fire and damage as the magazine empties.',
    regularDescription: 'Measured uses the same magazine-split behavior with standard tuning.',
    difference: 'The perfect version improves the magazine-split tradeoff compared with regular Measured.'
  },
  'Perfect Rifleman': {
    perfectName: 'Perfect Rifleman',
    regularName: 'Rifleman',
    perfectDescription: 'Headshots build rifle damage stacks, rewarding accurate repeated precision hits.',
    regularDescription: 'Rifleman also stacks rifle damage from headshots, but at the regular talent strength.',
    difference: 'The perfect version gives the named-item strengthened version of the Rifleman stacking behavior.'
  },
  'Perfectly Pumped Up': {
    perfectName: 'Perfectly Pumped Up',
    regularName: 'Pumped Up',
    perfectDescription: 'Reloading builds a stronger temporary weapon-damage bonus for close-range shotgun play.',
    regularDescription: 'Pumped Up grants weapon damage after reloading, using the regular talent value.',
    difference: 'The perfect version strengthens the reload-to-damage payoff.'
  },
  'Perfect Lucky Shot': {
    perfectName: 'Perfect Lucky Shot',
    regularName: 'Lucky Shot',
    perfectDescription: 'Improves magazine sustain from cover by returning missed shots and supporting longer firing windows.',
    regularDescription: 'Lucky Shot has the same cover-focused missed-shot return concept with standard tuning.',
    difference: 'The perfect version gives a stronger named-item version of Lucky Shot’s sustain behavior.'
  },
  'Perfect Sadist': {
    perfectName: 'Perfect Sadist',
    regularName: 'Sadist',
    perfectDescription: 'Deals increased weapon damage to bleeding enemies.',
    regularDescription: 'Sadist also increases weapon damage against bleeding enemies at the regular talent value.',
    difference: 'The perfect version improves the bleed-target damage bonus.'
  },
  'Perfect Headhunter': {
    perfectName: 'Perfect Headhunter',
    regularName: 'Headhunter',
    perfectDescription: 'Headshot kills amplify the next headshot, allowing precision builds to chain very high headshot damage.',
    regularDescription: 'Headhunter uses the same headshot-kill chaining concept at regular strength.',
    difference: 'The perfect version gives a stronger headshot-chain payoff than regular Headhunter.'
  },
  'Perfect Spotter': {
    perfectName: 'Perfect Spotter',
    regularName: 'Spotter',
    perfectDescription: 'Amplifies damage against pulsed enemies.',
    regularDescription: 'Spotter also amplifies damage to pulsed enemies, using the standard talent value.',
    difference: 'The perfect version increases the pulsed-target damage payoff.'
  },
  'Perfect Strained': {
    perfectName: 'Perfect Strained',
    regularName: 'Strained',
    perfectDescription: 'Builds critical hit damage the longer you keep firing.',
    regularDescription: 'Strained also builds critical hit damage during sustained fire at regular strength.',
    difference: 'The perfect version improves the sustained-fire critical damage reward.'
  },
  'Perfect Killer': {
    perfectName: 'Perfect Killer',
    regularName: 'Killer',
    perfectDescription: 'A critical-hit kill grants a stronger temporary critical hit damage bonus.',
    regularDescription: 'Killer grants critical hit damage after a critical-hit kill at the regular talent value.',
    difference: 'The perfect version strengthens the post-kill critical damage window.'
  },
  'Perfect Clutch': {
    perfectName: 'Perfect Clutch',
    regularName: 'Clutch',
    perfectDescription: 'Critical hits help recover armor while under pressure, supporting aggressive crit-based survivability.',
    regularDescription: 'Clutch provides the same crit-to-armor recovery concept at regular strength.',
    difference: 'The perfect version improves the survivability value compared with regular Clutch.'
  },
  'Perfect Spark': {
    perfectName: 'Perfect Spark',
    regularName: 'Spark',
    perfectDescription: 'Damaging enemies with a skill or explosive activates a stronger weapon-damage bonus.',
    regularDescription: 'Spark grants weapon damage after skill or explosive damage at standard strength.',
    difference: 'The perfect version improves the weapon-damage bonus window.'
  },
  'Perfect Overwatch': {
    perfectName: 'Perfect Overwatch',
    regularName: 'Overwatch',
    perfectDescription: 'Staying in cover grants a stronger team-friendly weapon and skill damage bonus.',
    regularDescription: 'Overwatch grants a team damage bonus from cover at the regular talent value.',
    difference: 'The perfect version improves the cover-based team damage support value.'
  },
  'Perfect Combined Arms': {
    perfectName: 'Perfect Combined Arms',
    regularName: 'Combined Arms',
    perfectDescription: 'Shooting an enemy increases skill damage, making it strong for skill DPS builds.',
    regularDescription: 'Combined Arms also boosts skill damage after shooting an enemy at regular strength.',
    difference: 'The perfect version gives a stronger skill-damage boost than regular Combined Arms.'
  },
  'Perfect Vigilance': {
    perfectName: 'Perfect Vigilance',
    regularName: 'Vigilance',
    perfectDescription: 'Increases weapon damage until you take damage, with the named-item improved recovery behavior.',
    regularDescription: 'Vigilance grants weapon damage but is disabled after taking damage.',
    difference: 'The perfect version improves the downtime/recovery behavior compared with regular Vigilance.'
  },
  'Perfect Fast Hands': {
    perfectName: 'Perfect Fast Hands',
    regularName: 'Fast Hands',
    perfectDescription: 'Critical hits build reload-speed stacks, reducing weapon downtime.',
    regularDescription: 'Fast Hands builds reload speed from critical hits at the regular talent value.',
    difference: 'The perfect version improves the reload-speed payoff from critical hits.'
  },
  'Perfect Finisher': {
    perfectName: 'Perfect Finisher',
    regularName: 'Finisher',
    perfectDescription: 'After a kill, swapping from this weapon grants a stronger temporary critical chance and critical damage bonus.',
    regularDescription: 'Finisher grants critical chance and critical damage after a kill and weapon swap at regular strength.',
    difference: 'The perfect version improves the post-kill swap bonus.'
  },
  'Perfect Flatline': {
    perfectName: 'Perfect Flatline',
    regularName: 'Flatline',
    perfectDescription: 'Amplifies weapon damage against pulsed enemies.',
    regularDescription: 'Flatline also amplifies weapon damage against pulsed enemies at regular strength.',
    difference: 'The perfect version increases the pulsed-target damage payoff.'
  },
  'Perfect Focus': {
    perfectName: 'Perfect Focus',
    regularName: 'Focus',
    perfectDescription: 'Aiming through a high-magnification scope ramps weapon damage over time.',
    regularDescription: 'Focus ramps weapon damage while scoped at the regular talent value.',
    difference: 'The perfect version improves the scoped damage ramp/reward.'
  },
  'Perfect Glass Cannon': {
    perfectName: 'Perfect Glass Cannon',
    regularName: 'Glass Cannon',
    perfectDescription: 'Greatly increases damage dealt, but also increases damage taken.',
    regularDescription: 'Glass Cannon uses the same high-risk, high-reward damage tradeoff at regular strength.',
    difference: 'The perfect version increases the damage-focused payoff while keeping the risky playstyle.'
  },
  'Perfect Ignited': {
    perfectName: 'Perfect Ignited',
    regularName: 'Ignited',
    perfectDescription: 'Deals increased weapon damage to burning enemies.',
    regularDescription: 'Ignited also increases weapon damage against burning enemies at regular strength.',
    difference: 'The perfect version improves the burn-target damage bonus.'
  },
  'Perfect In Sync': {
    perfectName: 'Perfect In Sync',
    regularName: 'In Sync',
    perfectDescription: 'Weapon hits and skill hits boost each other, with a stronger payoff when both sides are active.',
    regularDescription: 'In Sync also rewards alternating weapon and skill damage at regular strength.',
    difference: 'The perfect version improves the weapon/skill hybrid damage payoff.'
  },
  'Perfect Intimidate': {
    perfectName: 'Perfect Intimidate',
    regularName: 'Intimidate',
    perfectDescription: 'While you have bonus armor, close enemies take amplified damage.',
    regularDescription: 'Intimidate also boosts close-range damage while you have bonus armor at regular strength.',
    difference: 'The perfect version improves the aggressive bonus-armor damage window.'
  },
  'Perfect Sledgehammer': {
    perfectName: 'Perfect Sledgehammer',
    regularName: 'Sledgehammer',
    perfectDescription: 'Grenades mark enemies and create a stronger armor-damage window against marked targets.',
    regularDescription: 'Sledgehammer also marks enemies damaged by grenades and increases armor damage against them at regular strength.',
    difference: 'The perfect version improves the grenade-mark armor-damage payoff for you and your team.'
  },
  'Perfect Tech Support': {
    perfectName: 'Perfect Tech Support',
    regularName: 'Tech Support',
    perfectDescription: 'Skill kills increase skill damage, making it useful for turret, drone, and skill-damage builds.',
    regularDescription: 'Tech Support also increases skill damage after skill kills at regular strength.',
    difference: 'The perfect version improves the skill-kill damage bonus.'
  },
  'Perfect Vanguard': {
    perfectName: 'Perfect Vanguard',
    regularName: 'Vanguard',
    perfectDescription: 'Deploying a shield grants bonus armor to you and nearby teammates.',
    regularDescription: 'Vanguard provides team bonus armor from shield deployment at regular strength.',
    difference: 'The perfect version improves the team-protection value from shield deployment.'
  },
  'Perfect Allegro': {
    perfectName: 'Perfect Allegro',
    regularName: 'Allegro',
    perfectDescription: 'Provides a stronger rate-of-fire benefit for faster weapon output.',
    regularDescription: 'Allegro increases rate of fire at the regular talent value.',
    difference: 'The perfect version improves the rate-of-fire benefit.'
  },
  'Perfect Outsider': {
    perfectName: 'Perfect Outsider',
    regularName: 'Outsider',
    perfectDescription: 'Kills improve weapon accuracy and optimal range, helping close-range weapons perform better at distance.',
    regularDescription: 'Outsider improves accuracy and optimal range after kills at regular strength.',
    difference: 'The perfect version improves the post-kill handling/range benefit.'
  },
  'Perfect Optimist': {
    perfectName: 'Perfect Optimist',
    regularName: 'Optimist',
    perfectDescription: 'Weapon damage increases as the magazine empties.',
    regularDescription: 'Optimist uses the same lower-magazine damage ramp at regular strength.',
    difference: 'The perfect version improves the damage ramp as the magazine gets lower.'
  },
  'Perfect Spike': {
    perfectName: 'Perfect Spike',
    regularName: 'Spike',
    perfectDescription: 'Headshots increase skill damage, supporting accurate skill-damage builds.',
    regularDescription: 'Spike increases skill damage after headshots at regular strength.',
    difference: 'The perfect version improves the headshot-to-skill-damage bonus.'
  },
  'Perfect Breadbasket': {
    perfectName: 'Perfect Breadbasket',
    regularName: 'Breadbasket',
    perfectDescription: 'Body shots build bonus headshot damage for follow-up precision hits.',
    regularDescription: 'Breadbasket also builds headshot damage from body shots at regular strength.',
    difference: 'The perfect version improves the body-shot-to-headshot reward.'
  },
  'Perfect Boomerang': {
    perfectName: 'Perfect Boomerang',
    regularName: 'Boomerang',
    perfectDescription: 'Critical hits can return bullets and amplify follow-up shots.',
    regularDescription: 'Boomerang has the same critical-hit bullet return and damage concept at regular strength.',
    difference: 'The perfect version improves the rifle sustain and burst payoff.'
  },
  'Perfect Shock and Awe': {
    perfectName: 'Perfect Shock and Awe',
    regularName: 'Shock and Awe',
    perfectDescription: 'Applying status effects or explosive damage increases skill damage and repair.',
    regularDescription: 'Shock and Awe also boosts skill damage and repair after status or explosive damage at regular strength.',
    difference: 'The perfect version improves the status/explosive skill-support bonus.'
  },
  'Perfectly Opportunistic': {
    perfectName: 'Perfectly Opportunistic',
    regularName: 'Opportunistic',
    perfectDescription: 'Enemies hit by shotguns or marksman rifles take amplified damage from all sources.',
    regularDescription: 'Opportunistic also marks enemies hit by shotguns or marksman rifles for increased incoming damage at regular strength.',
    difference: 'The perfect version improves the team damage-support effect.'
  },
  'Perfectly Rooted': {
    perfectName: 'Perfectly Rooted',
    regularName: 'Rooted',
    perfectDescription: 'Staying in cover activates a stronger skill damage and repair bonus after the condition is met.',
    regularDescription: 'Rooted grants skill damage and repair from cover at regular strength.',
    difference: 'The perfect version improves the cover-based skill support bonus.'
  },
  'Perfectly Unbreakable': {
    perfectName: 'Perfectly Unbreakable',
    regularName: 'Unbreakable',
    perfectDescription: 'When your armor breaks, a stronger armor repair effect triggers.',
    regularDescription: 'Unbreakable repairs armor when your armor breaks at regular strength.',
    difference: 'The perfect version improves the emergency armor-repair value.'
  },
  'Perfectly Pumped Up': {
    perfectName: 'Perfectly Pumped Up',
    regularName: 'Pumped Up',
    perfectDescription: 'Reloading builds a stronger temporary shotgun damage bonus.',
    regularDescription: 'Pumped Up grants weapon damage after reloads at regular strength.',
    difference: 'The perfect version improves the reload-based damage payoff.'
  },
  'Perfectly Measured': {
    perfectName: 'Perfectly Measured',
    regularName: 'Measured',
    perfectDescription: 'Splits the magazine into two firing phases with an improved named-item tradeoff.',
    regularDescription: 'Measured changes rate of fire and damage across the magazine at regular strength.',
    difference: 'The perfect version improves the magazine-split behavior.'
  },
  'Perfect Kinetic Momentum': {
    perfectName: 'Perfect Kinetic Momentum',
    regularName: 'Kinetic Momentum',
    perfectDescription: 'Builds stronger skill damage and repair while skills are active and not on cooldown.',
    regularDescription: 'Kinetic Momentum builds skill damage and repair while skills remain active at regular strength.',
    difference: 'The perfect version improves the active-skill stacking benefit.'
  },
  'Perfect Adrenaline Rush': {
    perfectName: 'Perfect Adrenaline Rush',
    regularName: 'Adrenaline Rush',
    perfectDescription: 'Grants bonus armor when close to enemies, supporting aggressive close-range builds.',
    regularDescription: 'Adrenaline Rush also grants bonus armor near enemies at regular strength.',
    difference: 'The perfect version improves the close-range bonus armor value.'
  },
  'Perfect Overwhelm': {
    perfectName: 'Perfect Overwhelm',
    regularName: 'Overwhelm',
    perfectDescription: 'Rewards sustained pressure against enemies with a stronger weapon-performance window.',
    regularDescription: 'Overwhelm uses the same pressure-based weapon benefit at regular strength.',
    difference: 'The perfect version improves the pressure-based payoff.'
  },
  'Future Perfection': {
    perfectName: 'Future Perfection',
    regularName: 'Future Perfect',
    perfectDescription: 'Weapon kills grant skill-tier progression and can help reach overcharge behavior in the right build.',
    regularDescription: 'Future Perfect also grants skill-tier progression from weapon kills at regular strength.',
    difference: 'Future Perfection is the named-item version with improved tuning compared with the regular Future Perfect talent.'
  }
};

function cleanTalentName(name: string): string {
  return name
    .replace(/^Perfectly\s+/i, '')
    .replace(/^Perfect\s+/i, '')
    .replace(/Perfection$/i, 'Perfect')
    .trim();
}

export function getItems(data: any): ToolItem[] {
  return asArray(data);
}

export function itemName(item: ToolItem): string {
  return String(item.displayName || item.name || item.title || 'Unknown item');
}

export function itemType(item: ToolItem): string {
  const text = `${item.rarity || ''} ${item.category || ''} ${item.itemType || ''}`.toLowerCase();
  if (text.includes('exotic')) return 'Exotic';
  if (text.includes('gear set') || text.includes('gearset')) return 'Gear Set';
  if (text.includes('brand set')) return 'Brand Set';
  if (text.includes('named')) return 'Named High-End';
  if (text.includes('weapon talent')) return 'Weapon Talent';
  if (text.includes('gear talent')) return 'Gear Talent';
  return String(item.category || item.rarity || 'Reference');
}

export function isNamedItem(item: ToolItem): boolean {
  return itemType(item).toLowerCase().includes('named');
}

export function rarityClass(item: ToolItem): string {
  const type = itemType(item).toLowerCase();
  if (type.includes('exotic')) return 'rarity-exotic';
  if (type.includes('gear set')) return 'rarity-gearset';
  if (type.includes('brand') || type.includes('named') || type.includes('high-end')) return 'rarity-highend';
  return 'rarity-standard';
}

export function itemSubhead(item: ToolItem): string {
  return [
    item.slot,
    item.weaponType,
    item.brandOrSet,
    item.coreRollLabel || item.coreRollText
  ].filter(Boolean).map(String).slice(0, 2).join(' · ');
}

export function itemDescription(item: ToolItem): string {
  if (item.description) return String(item.description);
  if (item.notes) return String(item.notes);
  if (item.note) return String(item.note);
  if (Array.isArray(item.bonuses) && item.bonuses.length) return item.bonuses.map(String).join(' / ');
  return '';
}

export function itemSource(item: ToolItem): string {
  if (isNamedItem(item)) return '';

  const source = String(item.source || item.sources || '').trim();
  if (!source) return '';

  if (/divgaming curated reference/i.test(source)) return '';
  if (/validate against/i.test(source)) return '';
  if (/source watcher/i.test(source)) return '';

  return source;
}

function getRawTalent(item: ToolItem): { name: string; description: string; type: string } {
  const raw = item.talent;

  if (typeof raw === 'string') {
    return { name: raw, description: '', type: '' };
  }

  if (raw && typeof raw === 'object') {
    return {
      name: String(raw.name || '').trim(),
      description: String(raw.description || '').trim(),
      type: String(raw.type || '').trim()
    };
  }

  return { name: '', description: '', type: '' };
}

export function itemTalent(item: ToolItem): TalentInfo | null {
  const talent = getRawTalent(item);
  const name = talent.name.trim();

  if (!name) return null;
  if (/^(any talent|named attribute)$/i.test(name)) return null;

  const mapped = TALENT_INFO[name];

  if (mapped) {
    return mapped;
  }

  const regularName = cleanTalentName(name);

  return {
    perfectName: name,
    regularName,
    perfectDescription: talent.description || item.note || `${name} is the named-item upgraded version of ${regularName}.`,
    regularDescription: `${regularName} is the standard version of this talent.`,
    difference: `The perfect version improves the standard ${regularName} behavior.`
  };
}

function normalizeProperty(value: any): { label: string; note: string } | null {
  if (!value) return null;

  if (typeof value === 'string') {
    return { label: value, note: '' };
  }

  if (typeof value === 'object') {
    const label = String(value.label || value.name || value.value || '').trim();
    const note = String(value.note || value.description || '').trim();

    if (!label && !note) return null;

    return {
      label,
      note
    };
  }

  return null;
}

export function itemNamedAttributes(item: ToolItem): { label: string; description: string }[] {
  const properties: { label: string; description: string }[] = [];
  const talent = getRawTalent(item);
  const talentName = talent.name.trim();

  if (/^any talent$/i.test(talentName)) {
    properties.push({
      label: 'Open talent slot',
      description: 'This named item is not locked to one perfect talent. Its named value comes from its extra stat or special item property.'
    });
  }

  if (/^named attribute$/i.test(talentName)) {
    properties.push({
      label: 'Named attribute',
      description: item.note || 'This item is valuable because of its named attribute rather than a perfect talent.'
    });
  }

  const fixedAttributes = Array.isArray(item.fixedAttributes) ? item.fixedAttributes : [];
  for (const entry of fixedAttributes) {
    const property = normalizeProperty(entry);
    if (!property) continue;

    properties.push({
      label: property.label,
      description:
        property.note && !/^fixed named item attribute$/i.test(property.note)
          ? property.note
          : 'Fixed named attribute that separates this item from its standard counterpart.'
    });
  }

  const weaponAttributes = Array.isArray(item.weaponAttributes) ? item.weaponAttributes : [];
  for (const entry of weaponAttributes) {
    const property = normalizeProperty(entry);
    if (!property) continue;

    if (/standard weapon core attribute/i.test(property.note)) continue;

    properties.push({
      label: property.label,
      description: property.note || 'Named weapon attribute.'
    });
  }

  if (!properties.length && !itemTalent(item) && item.note) {
    properties.push({
      label: 'Named item note',
      description: String(item.note)
    });
  }

  return properties;
}

// Backwards-compatible alias for older component references.
export const itemSpecialProperties = itemNamedAttributes;

export function itemBonuses(item: ToolItem): string[] {
  return Array.isArray(item.bonuses) ? item.bonuses.map(String) : [];
}

export function itemRoles(item: ToolItem): string[] {
  return Array.isArray(item.roles) ? item.roles.map(String) : [];
}

export function coreLabel(item: ToolItem): string {
  const raw = String(item.defaultCore || item.cores?.[0] || item.availableCores?.[0] || item.coreRollLabel || item.coreRollText || '').toLowerCase();

  if (raw.includes('weapon') || raw.includes('pistol') || raw.includes('damage')) return 'Weapon Damage';
  if (raw.includes('armor')) return 'Armor';
  if (raw.includes('skill')) return 'Skill Tier';

  return '';
}

export function coreClass(item: ToolItem): string {
  const label = coreLabel(item).toLowerCase();

  if (label.includes('weapon')) return 'core-red';
  if (label.includes('armor')) return 'core-blue';
  if (label.includes('skill')) return 'core-yellow';

  return '';
}

export function itemIcon(item: ToolItem): string {
  const type = itemType(item).toLowerCase();
  const brandKey = String(item.assetKey || assetSlug(item.brandOrSet || item.brand || item.set || item.name));

  if ((type.includes('brand') || type.includes('gear set')) && manifest.brands?.[brandKey]) {
    return manifest.brands[brandKey];
  }

  if (type.includes('named') && item.brandOrSet) {
    const namedBrandKey = assetSlug(item.brandOrSet);
    if (manifest.brands?.[namedBrandKey]) return manifest.brands[namedBrandKey];
  }

  const slot = String(item.slot || '').toLowerCase();
  const slotKey =
    slot.includes('backpack') ? 'backpack' :
    slot.includes('chest') || slot.includes('vest') ? 'chest' :
    slot.includes('glove') ? 'gloves' :
    slot.includes('holster') ? 'holster' :
    slot.includes('knee') ? 'kneepads' :
    slot.includes('mask') ? 'mask' : '';

  if (slotKey && manifest.gears?.[slotKey]) return manifest.gears[slotKey];

  const weapon = String(item.weaponType || '').toLowerCase();
  const weaponKey =
    weapon.includes('smg') ? 'smg' :
    weapon.includes('lmg') ? 'lmg' :
    weapon.includes('mmr') || weapon.includes('marksman') ? 'mmr' :
    weapon.includes('shotgun') ? 'shotgun' :
    weapon.includes('pistol') || weapon.includes('sidearm') ? 'pistol' :
    weapon.includes('rifle') && !weapon.includes('assault') ? 'rifle' :
    weapon.includes('ar') || weapon.includes('assault') ? 'ar' : '';

  if (weaponKey && manifest.weapons?.[weaponKey]) return manifest.weapons[weaponKey];

  return '';
}

export function itemSearch(item: ToolItem): string {
  const talent = itemTalent(item);
  const namedAttributes = itemNamedAttributes(item);

  return [
    itemName(item),
    itemType(item),
    itemSubhead(item),
    itemDescription(item),
    itemSource(item),
    talent?.perfectName,
    talent?.regularName,
    talent?.perfectDescription,
    talent?.regularDescription,
    talent?.difference,
    ...namedAttributes.flatMap((property) => [property.label, property.description]),
    ...itemBonuses(item),
    ...itemRoles(item)
  ].filter(Boolean).join(' ').toLowerCase();
}

export function itemFilters(item: ToolItem): string {
  const tokens = new Set<string>(['all']);
  const text = itemSearch(item);

  for (const token of ['exotic', 'named', 'brand', 'gear', 'weapon', 'talent', 'backpack', 'chest', 'mask', 'gloves', 'holster', 'kneepads', 'skill', 'armor', 'damage']) {
    if (text.includes(token)) tokens.add(token);
  }

  if (itemType(item).toLowerCase().includes('gear set')) tokens.add('gearset');
  if (itemType(item).toLowerCase().includes('brand set')) tokens.add('brandset');
  if (coreLabel(item).toLowerCase().includes('weapon')) tokens.add('weapon_damage');
  if (coreLabel(item).toLowerCase().includes('armor')) tokens.add('armor');
  if (coreLabel(item).toLowerCase().includes('skill')) tokens.add('skill_tier');

  return [...tokens].join(' ');
}

import iconManifest from '../../data/division-2/icon-manifest.json';
import { asArray, assetSlug } from './shared';

export type ToolItem = Record<string, any>;

const manifest: any = iconManifest;

const TALENT_DETAILS: Record<string, string> = {
  'Perfectly Wicked': 'Applying a status effect grants a stronger temporary weapon damage bonus. Best used on status-focused or bleed/burn builds.',
  'Perfectly Measured': 'Changes damage and rate of fire across the magazine, creating a stronger version of the Measured magazine split.',
  'Perfect Rifleman': 'Headshots build rifle damage stacks. Useful for accurate rifle builds that can keep landing precision hits.',
  'Perfectly Pumped Up': 'Reloading builds a temporary shotgun damage bonus, rewarding close-range play and frequent reload timing.',
  'Perfect Lucky Shot': 'Improves rifle sustain from cover by returning missed shots and supporting longer firing windows.',
  'Perfect Sadist': 'Deals increased weapon damage to bleeding enemies. Works best with builds that can reliably apply bleed.',
  'Perfect Headhunter': 'Headshot kills amplify your next headshot, allowing precision builds to chain very high headshot damage.',
  'Perfect Spotter': 'Amplifies damage against pulsed enemies. Strong with Pulse, linked laser pointer, Flatline-style setups, and team marking.',
  'Perfect Strained': 'Critical hit damage builds the longer you keep firing. Best on weapons and builds that can maintain sustained fire.',
  'Perfect Killer': 'A critical-hit kill grants a stronger temporary critical hit damage bonus.',
  'Perfect Clutch': 'Critical hits help recover armor while under pressure, making it a survivability-focused crit backpack option.',
  'Perfect Spark': 'Damaging enemies with a skill or explosive grants weapon damage, supporting hybrid weapon/skill play.',
  'Perfect Overwatch': 'Staying in cover grants a stronger team-friendly weapon and skill damage bonus.',
  'Perfect Combined Arms': 'Shooting an enemy increases skill damage, making it a strong backpack talent for skill DPS builds.',
  'Perfect Vigilance': 'Increases weapon damage until you take damage, with a faster recovery window than the standard version.',
  'Perfect Fast Hands': 'Critical hits build reload-speed stacks, reducing downtime on weapons that crit often.',
  'Perfect In Sync': 'Weapon hits and skill hits boost each other, with stronger damage when both bonuses are active together.',
  'Perfect Intimidate': 'While you have bonus armor, close enemies take amplified damage. Best with bonus armor sources and aggressive play.',
  'Perfect Allegro': 'Provides a stronger rate-of-fire benefit, improving weapon output through faster firing.',
  'Perfect Flatline': 'Amplifies weapon damage against pulsed enemies. Pairs well with linked laser pointer, Pulse, and team marking.',
  'Perfect Sledgehammer': 'Grenades mark enemies and increase armor damage against them, giving the team a stronger burst window.',
  'Future Perfection': 'Weapon kills grant skill tier progression and can lead into overcharge behavior at high skill tier.',
  'Perfect Breadbasket': 'Body shots build bonus headshot damage, rewarding controlled follow-up headshots.',
  'Perfect Finisher': 'After a kill, swapping from this weapon grants a stronger temporary critical chance and critical damage bonus.',
  'Perfect Tech Support': 'Skill kills increase skill damage, making it useful for turret, drone, and other skill-damage builds.',
  'Perfect Vanguard': 'Deploying a shield grants bonus armor to you and nearby teammates, supporting tank and team-protection builds.',
  'Perfect Focus': 'Aiming through a high-magnification scope ramps weapon damage over time.',
  'Perfect Ignited': 'Deals increased weapon damage to burning enemies. Strong with burn/status application.',
  'Perfect Overwhelm': 'Rewards suppressing or pressuring enemies with a stronger weapon-performance window.',
  'Perfect Glass Cannon': 'Greatly increases damage dealt, but also increases damage taken. High-risk, high-reward DPS talent.',
  'Perfect Outsider': 'Kills improve weapon accuracy and optimal range, helping SMGs perform better beyond normal comfort range.',
  'Perfectly Rooted': 'Staying in cover activates a stronger skill damage and repair bonus after the condition is met.',
  'Perfectly Opportunistic': 'Enemies hit by shotguns or marksman rifles take amplified damage from all sources, making it strong for team support.',
  'Perfect Optimist': 'Weapon damage increases as the magazine empties, rewarding sustained fire through the mag.',
  'Perfect Shock and Awe': 'Applying status effects or explosive damage increases skill damage and repair, supporting status/skill hybrid builds.',
  'Perfect Spike': 'Headshots increase skill damage, supporting accurate skill-damage builds.',
  'Perfect Boomerang': 'Critical hits can return bullets and amplify follow-up shots, improving rifle sustain and burst potential.',
  'Perfectly Unbreakable': 'When your armor breaks, a stronger armor repair effect triggers. Defensive chest option for survivability.'
};

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
  if (item.note) return String(item.note);
  if (item.notes) return String(item.notes);
  if (Array.isArray(item.bonuses) && item.bonuses.length) return item.bonuses.map(String).join(' / ');
  return '';
}

export function itemSource(item: ToolItem): string {
  const source = String(item.source || item.sources || '').trim();

  if (!source) return '';

  // Hide internal curation notes from the public cards.
  if (/divgaming curated reference/i.test(source)) return '';
  if (/validate against/i.test(source)) return '';

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

export function itemTalent(item: ToolItem): { name: string; description: string } | null {
  const talent = getRawTalent(item);
  const name = talent.name.trim();

  if (!name) return null;

  // These are not real talent descriptions. They are handled as special properties instead.
  if (/^(any talent|named attribute)$/i.test(name)) return null;

  const description =
    talent.description ||
    TALENT_DETAILS[name] ||
    item.note ||
    '';

  return {
    name,
    description: String(description)
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

export function itemSpecialProperties(item: ToolItem): { label: string; description: string }[] {
  const properties: { label: string; description: string }[] = [];
  const talent = getRawTalent(item);
  const talentName = talent.name.trim();

  if (/^any talent$/i.test(talentName)) {
    properties.push({
      label: 'Open talent slot',
      description: 'This named item is not locked to one talent. Its named value comes from its special stat/property instead.'
    });
  }

  if (/^named attribute$/i.test(talentName)) {
    properties.push({
      label: 'Named attribute',
      description: item.note || 'This item is valuable because of its special named attribute rather than a perfect talent.'
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
          : 'Fixed named item attribute that makes this item different from its standard counterpart.'
    });
  }

  const weaponAttributes = Array.isArray(item.weaponAttributes) ? item.weaponAttributes : [];
  for (const entry of weaponAttributes) {
    const property = normalizeProperty(entry);
    if (!property) continue;

    // Do not show ordinary weapon damage as a "special" property.
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
  const specialProperties = itemSpecialProperties(item);

  return [
    itemName(item),
    itemType(item),
    itemSubhead(item),
    itemDescription(item),
    itemSource(item),
    talent?.name,
    talent?.description,
    ...specialProperties.flatMap((property) => [property.label, property.description]),
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

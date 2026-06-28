import iconManifest from '../../data/division-2/icon-manifest.json';
import { asArray, assetSlug } from './shared';

export type ToolItem = Record<string, any>;

const manifest: any = iconManifest;

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
  return String(item.source || item.sources || '');
}

export function itemTalent(item: ToolItem): { name: string; description: string } | null {
  const talent = item.talent;
  if (talent && (talent.name || talent.description)) {
    return {
      name: String(talent.name || ''),
      description: String(talent.description || '')
    };
  }
  return null;
}

export function itemBonuses(item: ToolItem): string[] {
  return Array.isArray(item.bonuses) ? item.bonuses.map(String) : [];
}

export function itemRoles(item: ToolItem): string[] {
  return Array.isArray(item.roles) ? item.roles.map(String) : [];
}

export function coreLabel(item: ToolItem): string {
  const raw = String(item.defaultCore || item.cores?.[0] || item.availableCores?.[0] || item.coreRollLabel || item.coreRollText || '').toLowerCase();
  if (raw.includes('weapon')) return 'Weapon Damage';
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
  return [
    itemName(item),
    itemType(item),
    itemSubhead(item),
    itemDescription(item),
    itemSource(item),
    itemTalent(item)?.name,
    itemTalent(item)?.description,
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

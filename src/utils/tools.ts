import iconManifest from '../../data/division-2/icon-manifest.json';
import { asArray, assetSlug } from './shared';
import {
  getItemEffectOverride,
  getPerfectTalentComparison,
  type EffectModeValues,
  type PerfectTalentComparison
} from './effectValues';
import { getPrototypePresentation, type PrototypePresentation } from './prototype';

export type ToolItem = Record<string, any>;

export type ItemEffectPresentation = {
  kind: 'perfect-talent' | 'exotic-talent' | 'named-attribute' | 'brand-bonuses' | 'gearset-bonuses' | 'generic';
  label: string;
  title: string;
  regularTitle?: string;
  summary?: string;
  modes?: {
    pve?: EffectModeValues;
    pvp?: EffectModeValues;
  };
  namedAttributes?: { label: string; description: string }[];
};

const manifest: any = iconManifest;

function slug(value: unknown): string {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function cleanTalentName(name: string): string {
  if (/^Future Perfection$/i.test(name)) return 'Future Perfect';
  return name.replace(/^Perfectly\s+/i, '').replace(/^Perfected\s+/i, '').replace(/^Perfect\s+/i, '').trim();
}

function getRawTalent(item: ToolItem): { name: string; description: string; type: string } {
  const raw = item.talent;

  if (typeof raw === 'string') return { name: raw, description: '', type: '' };

  if (raw && typeof raw === 'object') {
    return {
      name: String(raw.name || '').trim(),
      description: String(raw.description || '').trim(),
      type: String(raw.type || '').trim()
    };
  }

  return { name: '', description: '', type: '' };
}

function textRows(rows: string[]): EffectModeValues {
  return {
    rows: rows.filter(Boolean).map((value) => ({ effect: value, value }))
  };
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

export function itemPrototypePresentation(item: ToolItem): PrototypePresentation | null {
  return getPrototypePresentation(item, itemType(item));
}

export function isNamedItem(item: ToolItem): boolean {
  return itemType(item).toLowerCase().includes('named');
}

export function isExoticItem(item: ToolItem): boolean {
  return itemType(item).toLowerCase().includes('exotic');
}

export function isBrandSet(item: ToolItem): boolean {
  return itemType(item).toLowerCase().includes('brand set');
}

export function isGearSet(item: ToolItem): boolean {
  return itemType(item).toLowerCase().includes('gear set');
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

function normalizeProperty(value: any): { label: string; note: string } | null {
  if (!value) return null;

  if (typeof value === 'string') return { label: value, note: '' };

  if (typeof value === 'object') {
    const label = String(value.label || value.name || value.value || '').trim();
    const note = String(value.note || value.description || '').trim();

    if (!label && !note) return null;

    return { label, note };
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
      description: 'This item is not locked to one perfect talent. Its named value comes from its roll, attribute, or special item property.'
    });
  }

  if (/^named attribute$/i.test(talentName)) {
    properties.push({
      label: 'Named attribute',
      description: item.note || 'This item is valuable because of its named attribute rather than a perfect talent.'
    });
  }

  for (const entry of Array.isArray(item.fixedAttributes) ? item.fixedAttributes : []) {
    const property = normalizeProperty(entry);
    if (!property) continue;

    properties.push({
      label: property.label,
      description: property.note && !/^fixed named item attribute$/i.test(property.note)
        ? property.note
        : 'Fixed named attribute that separates this item from the standard version.'
    });
  }

  for (const entry of Array.isArray(item.weaponAttributes) ? item.weaponAttributes : []) {
    const property = normalizeProperty(entry);
    if (!property) continue;
    if (/standard weapon core attribute/i.test(property.note)) continue;

    properties.push({
      label: property.label,
      description: property.note || 'Named weapon attribute.'
    });
  }

  return properties;
}

export const itemSpecialProperties = itemNamedAttributes;

export function itemPerfectTalentComparison(item: ToolItem): PerfectTalentComparison | null {
  const talent = getRawTalent(item);
  const name = talent.name.trim();

  if (!name) return null;
  if (/^(any talent|named attribute)$/i.test(name)) return null;

  const comparison = getPerfectTalentComparison(name);
  if (comparison) return comparison;

  return {
    regularName: cleanTalentName(name),
    perfectName: name,
    summary: talent.description || item.note || '',
    modes: {}
  };
}

export const itemTalent = itemPerfectTalentComparison;
export const itemTalentComparison = itemPerfectTalentComparison;

export function itemEffectPresentation(item: ToolItem): ItemEffectPresentation | null {
  const override = getItemEffectOverride(item.id);

  if (override) {
    return {
      kind: 'generic',
      label: override.label || 'Effect',
      title: override.title || itemName(item),
      summary: override.summary,
      modes: override.modes
    };
  }

  const talent = getRawTalent(item);

  if (isNamedItem(item)) {
    const namedAttributes = itemNamedAttributes(item);
    const perfect = itemPerfectTalentComparison(item);

    if (perfect) {
      return {
        kind: 'perfect-talent',
        label: 'Perfect Talent',
        title: perfect.perfectName,
        regularTitle: perfect.regularName,
        summary: perfect.summary,
        modes: perfect.modes,
        namedAttributes
      };
    }

    if (namedAttributes.length) {
      const rows = namedAttributes.map((property) => `${property.label}: ${property.description}`);
      return {
        kind: 'named-attribute',
        label: 'Named Attribute',
        title: itemName(item),
        summary: itemDescription(item),
        namedAttributes,
        modes: { pve: textRows(rows) }
      };
    }
  }

  if (isExoticItem(item)) {
    const rows = [];

    if (talent.name || talent.description) {
      rows.push(`${talent.name || 'Exotic Talent'}${talent.description ? ` — ${talent.description}` : ''}`);
    } else if (itemDescription(item)) {
      rows.push(itemDescription(item));
    }

    const safeRows = rows.length ? rows : ['Exotic talent details are listed from the current item data.'];

    return {
      kind: 'exotic-talent',
      label: 'Exotic Talent',
      title: talent.name || itemName(item),
      summary: talent.description || itemDescription(item),
      modes: { pve: textRows(safeRows) }
    };
  }

  if (isBrandSet(item)) {
    const bonuses = itemBonuses(item);

    return {
      kind: 'brand-bonuses',
      label: 'Brand Set Bonuses',
      title: itemName(item),
      summary: item.roles?.length ? `Common roles: ${item.roles.join(', ')}` : '',
      modes: { pve: textRows(bonuses) }
    };
  }

  if (isGearSet(item)) {
    const rows = [
      ...itemBonuses(item),
      item.chest ? `Chest Talent: ${item.chest}` : '',
      item.backpack ? `Backpack Talent: ${item.backpack}` : ''
    ].filter(Boolean);

    return {
      kind: 'gearset-bonuses',
      label: 'Gear Set Bonuses',
      title: itemName(item),
      summary: item.roles?.length ? `Common roles: ${item.roles.join(', ')}` : '',
      modes: { pve: textRows(rows) }
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
  const effect = itemEffectPresentation(item);
  const prototype = itemPrototypePresentation(item);

  return [
    itemName(item),
    itemType(item),
    itemSubhead(item),
    itemDescription(item),
    effect?.label,
    effect?.title,
    effect?.regularTitle,
    effect?.summary,
    ...(effect?.modes?.pve?.rows || []).flatMap((row) => [row.effect, row.metric, row.regular, row.perfect, row.value, row.change]),
    ...(effect?.modes?.pvp?.rows || []).flatMap((row) => [row.effect, row.metric, row.regular, row.perfect, row.value, row.change]),
    ...(effect?.namedAttributes || []).flatMap((property) => [property.label, property.description]),
    prototype?.label,
    prototype?.title,
    prototype?.summary,
    prototype?.appliesTo,
    ...(prototype?.rollSections || []).flatMap((section) => [section.title, ...section.rows.flatMap((row) => [row.label, row.standard, row.prototype, row.change])]),
    ...(prototype?.augments || []).flatMap((augment) => [augment.name, augment.value, augment.description]),
    ...itemBonuses(item),
    ...itemRoles(item)
  ].filter(Boolean).join(' ').toLowerCase();
}

export function itemFilters(item: ToolItem): string {
  const tokens = new Set<string>(['all']);
  const type = itemType(item).toLowerCase();
  const itemTypeText = String(item.itemType || item.category || '').toLowerCase();
  const slot = String(item.slot || '').toLowerCase();
  const weaponType = String(item.weaponType || '').toLowerCase();
  const talent = getRawTalent(item);
  const cores = [
    item.defaultCore,
    ...(Array.isArray(item.availableCores) ? item.availableCores : [])
  ].map((value) => String(value || '').toLowerCase());

  if (type.includes('exotic')) tokens.add('exotic');
  if (type.includes('named')) tokens.add('named');
  if (type.includes('brand set')) tokens.add('brandset');
  if (type.includes('gear set')) tokens.add('gearset');

  if (itemTypeText.includes('gear') || slot) tokens.add('gear');
  if (itemTypeText.includes('weapon') || weaponType || item.brandOrSet === 'Weapon') tokens.add('weapon');

  if (talent.name && !/^(any talent|named attribute)$/i.test(talent.name)) tokens.add('talent');

  for (const key of ['backpack', 'chest', 'mask', 'gloves', 'holster', 'kneepads']) {
    if (slot.includes(key) || (key === 'gloves' && slot.includes('glove')) || (key === 'kneepads' && slot.includes('knee'))) {
      tokens.add(key);
    }
  }

  const weaponMap: Record<string, string> = {
    smg: 'smg',
    lmg: 'lmg',
    shotgun: 'shotgun',
    pistol: 'pistol',
    sidearm: 'pistol',
    rifle: 'rifle',
    marksman: 'mmr',
    mmr: 'mmr',
    assault: 'ar',
    ar: 'ar'
  };

  for (const [needle, token] of Object.entries(weaponMap)) {
    if (weaponType.includes(needle)) tokens.add(token);
  }

  if (cores.some((value) => value.includes('weapon'))) tokens.add('weapon_damage');
  if (cores.some((value) => value.includes('armor'))) tokens.add('armor_core');
  if (cores.some((value) => value.includes('skill'))) tokens.add('skill_tier');

  if (itemPrototypePresentation(item)) tokens.add('prototype');

  for (const role of itemRoles(item)) {
    const token = slug(role);
    if (token) tokens.add(`role_${token}`);
  }

  return [...tokens].join(' ');
}

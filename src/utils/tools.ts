import iconManifest from '../../data/division-2/icon-manifest.json';
import { asArray, assetSlug } from './shared';
import {
  getItemEffectOverride,
  getPerfectTalentComparison,
  type EffectModeValues,
  type EffectSource,
  type PerfectTalentComparison
} from './effectValues';

export type ToolItem = Record<string, any>;

export type ItemEffectPresentation = {
  kind: 'perfect-talent' | 'exotic-talent' | 'named-attribute' | 'brand-bonuses' | 'gearset-bonuses' | 'generic';
  label: string;
  title: string;
  regularTitle?: string;
  summary?: string;
  source?: EffectSource;
  modes?: {
    pve?: EffectModeValues;
    pvp?: EffectModeValues;
  };
  namedAttributes?: { label: string; description: string }[];
};

const manifest: any = iconManifest;

function cleanTalentName(name: string): string {
  if (/^Future Perfection$/i.test(name)) return 'Future Perfect';

  return name
    .replace(/^Perfectly\s+/i, '')
    .replace(/^Perfect\s+/i, '')
    .trim();
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

function modeFromRows(rows: string[], status = 'same-as-pve'): EffectModeValues {
  return {
    status,
    rows: rows.map((value) => ({
      metric: value,
      value
    }))
  };
}

function textRows(rows: string[]): EffectModeValues {
  return {
    status: 'needs-final-verification',
    rows: rows.filter(Boolean).map((value) => ({
      metric: value,
      value
    }))
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

export function itemSource(item: ToolItem): string {
  if (isNamedItem(item)) return '';

  const source = String(item.source || item.sources || '').trim();
  if (!source) return '';

  if (/divgaming curated reference/i.test(source)) return '';
  if (/validate against/i.test(source)) return '';
  if (/source watcher/i.test(source)) return '';

  return source;
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

  return properties;
}

export const itemSpecialProperties = itemNamedAttributes;

export function itemPerfectTalentComparison(item: ToolItem): PerfectTalentComparison | null {
  const talent = getRawTalent(item);
  const name = talent.name.trim();

  if (!name) return null;
  if (/^(any talent|named attribute)$/i.test(name)) return null;

  const sourced = getPerfectTalentComparison(name);
  if (sourced) return sourced;

  return {
    perfectName: name,
    regularName: cleanTalentName(name),
    summary: talent.description || item.note || '',
    source: {
      label: 'Value data not yet sourced',
      confidence: 'pending',
      lastVerified: 'Pending'
    },
    modes: {
      pve: {
        status: 'pending',
        rows: [
          {
            metric: 'PvE value comparison',
            regular: 'Needs source',
            perfect: 'Needs source',
            delta: 'Pending'
          }
        ]
      },
      pvp: {
        status: 'pending',
        rows: [
          {
            metric: 'PvP value comparison',
            regular: 'Needs source',
            perfect: 'Needs source',
            delta: 'Pending'
          }
        ]
      }
    }
  };
}

// Backwards-compatible alias.
export const itemTalent = itemPerfectTalentComparison;
export const itemTalentComparison = itemPerfectTalentComparison;

export function itemEffectPresentation(item: ToolItem): ItemEffectPresentation | null {
  const override = getItemEffectOverride(item.id);
  if (override) {
    return {
      kind: 'generic',
      label: override.label || 'Effect Values',
      title: override.title || itemName(item),
      summary: override.summary,
      source: override.source,
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
        source: perfect.source,
        modes: perfect.modes,
        namedAttributes
      };
    }

    if (namedAttributes.length) {
      return {
        kind: 'named-attribute',
        label: 'Named Attribute',
        title: itemName(item),
        summary: itemDescription(item),
        namedAttributes,
        modes: {
          pve: textRows(namedAttributes.map((property) => `${property.label}: ${property.description}`)),
          pvp: {
            status: 'pending',
            rows: [
              {
                metric: 'PvP named attribute value',
                value: 'Needs source'
              }
            ]
          }
        },
        source: {
          label: 'Needs final in-game PvE/PvP verification',
          confidence: 'pending',
          lastVerified: 'Pending'
        }
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

    return {
      kind: 'exotic-talent',
      label: 'Exotic Talent',
      title: talent.name || itemName(item),
      summary: talent.description || itemDescription(item),
      modes: {
        pve: textRows(rows.length ? rows : ['Exotic talent details need verification.']),
        pvp: {
          status: 'pending',
          rows: [
            {
              metric: 'PvP exotic talent tuning',
              value: 'Needs source'
            }
          ]
        }
      },
      source: {
        label: 'Needs final in-game PvE/PvP verification',
        confidence: item.needsVerification ? 'pending' : 'curated',
        lastVerified: item.needsVerification ? 'Pending' : 'Curated reference'
      }
    };
  }

  if (isBrandSet(item)) {
    const bonuses = itemBonuses(item);
    return {
      kind: 'brand-bonuses',
      label: 'Brand Set Bonuses',
      title: itemName(item),
      summary: item.roles?.length ? `Common roles: ${item.roles.join(', ')}` : '',
      modes: {
        pve: textRows(bonuses),
        pvp: {
          status: 'same-as-pve',
          rows: bonuses.map((bonus) => ({
            metric: bonus,
            value: bonus
          }))
        }
      },
      source: {
        label: 'Needs final in-game PvE/PvP verification',
        confidence: 'curated',
        lastVerified: 'Curated reference'
      }
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
      modes: {
        pve: textRows(rows),
        pvp: {
          status: 'pending',
          rows: [
            {
              metric: 'PvP gear set tuning',
              value: 'Needs source'
            }
          ]
        }
      },
      source: {
        label: 'Needs final in-game PvE/PvP verification',
        confidence: 'curated',
        lastVerified: 'Curated reference'
      }
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

  return [
    itemName(item),
    itemType(item),
    itemSubhead(item),
    itemDescription(item),
    itemSource(item),
    effect?.label,
    effect?.title,
    effect?.regularTitle,
    effect?.summary,
    ...(effect?.modes?.pve?.rows || []).flatMap((row) => [row.metric, row.regular, row.perfect, row.value, row.delta]),
    ...(effect?.modes?.pvp?.rows || []).flatMap((row) => [row.metric, row.regular, row.perfect, row.value, row.delta]),
    ...(effect?.namedAttributes || []).flatMap((property) => [property.label, property.description]),
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

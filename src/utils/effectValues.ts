import effectValuesData from '../../data/division-2/effect-values.json';

export type EffectRow = {
  effect?: string;
  metric?: string;
  regular?: string;
  perfect?: string;
  value?: string;
  change?: string;
};

export type EffectModeValues = {
  rows?: EffectRow[];
};

export type PerfectTalentComparison = {
  regularName: string;
  perfectName: string;
  summary?: string;
  modes?: {
    pve?: EffectModeValues;
    pvp?: EffectModeValues;
  };
};

export type ItemEffectOverride = {
  label?: string;
  title?: string;
  summary?: string;
  modes?: {
    pve?: EffectModeValues;
    pvp?: EffectModeValues;
  };
};

const data = effectValuesData as {
  perfectTalents?: Record<string, PerfectTalentComparison>;
  items?: Record<string, ItemEffectOverride>;
};

function normalize(value: unknown): string {
  return String(value || '')
    .replace(/[’']/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

const perfectTalentMap = new Map<string, PerfectTalentComparison>();

for (const [key, value] of Object.entries(data.perfectTalents || {})) {
  perfectTalentMap.set(normalize(key), value);
  perfectTalentMap.set(normalize(value.perfectName), value);
}

const aliases: Record<string, string> = {
  'perfect sledgehammer': 'perfect sledgehammer',
  'perfected sledgehammer': 'perfect sledgehammer',
  'perfect shock and awe': 'perfect shock & awe',
  'perfect breadbasket': 'perfect bread basket',
  'perfect ignited': 'perfectly ignited',
  'perfect in sync': 'perfectly in sync',
  'perfect strained': 'perfectly strained'
};

export function getPerfectTalentComparison(perfectTalentName: unknown): PerfectTalentComparison | null {
  const key = normalize(perfectTalentName);
  const aliasKey = aliases[key] || key;
  return perfectTalentMap.get(key) || perfectTalentMap.get(aliasKey) || null;
}

export function getItemEffectOverride(itemId: unknown): ItemEffectOverride | null {
  return data.items?.[String(itemId || '')] || null;
}

export function hasRows(mode?: EffectModeValues): boolean {
  return Boolean(mode?.rows?.some((row) => row.effect || row.metric || row.value || row.regular || row.perfect || row.change));
}

export function rowLabel(row: EffectRow): string {
  return String(row.effect || row.metric || '');
}

export function rowChange(row: EffectRow): string {
  return String(row.change || '');
}

export function modesDiffer(a?: EffectModeValues, b?: EffectModeValues): boolean {
  if (!hasRows(a) || !hasRows(b)) return false;
  return JSON.stringify(a?.rows || []) !== JSON.stringify(b?.rows || []);
}

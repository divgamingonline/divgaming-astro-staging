import effectValuesData from '../../data/division-2/effect-values.json';

export type EffectRow = {
  metric: string;
  regular?: string;
  perfect?: string;
  value?: string;
  delta?: string;
};

export type EffectModeValues = {
  status?: string;
  rows: EffectRow[];
};

export type EffectSource = {
  label?: string;
  confidence?: string;
  lastVerified?: string;
  url?: string;
  note?: string;
};

export type PerfectTalentComparison = {
  regularName: string;
  perfectName: string;
  summary?: string;
  source?: EffectSource;
  modes: {
    pve?: EffectModeValues;
    pvp?: EffectModeValues;
  };
};

export type ItemEffectOverride = {
  label?: string;
  title?: string;
  summary?: string;
  source?: EffectSource;
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
  'perfect ignited': 'perfectly ignited',
  'perfect shock and awe': 'perfect shock & awe',
  'perfect breadbasket': 'perfect bread basket',
  'perfect pumped up': 'perfectly pumped up',
  'perfect in sync': 'perfectly in sync'
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
  if (!mode?.rows?.length) return false;
  return mode.rows.some((row) => Boolean(row.metric || row.value || row.regular || row.perfect || row.delta));
}

export function modeStatusLabel(status?: string): string {
  if (!status) return '';
  if (status === 'verified') return 'Verified';
  if (status === 'spreadsheet-backed') return 'Spreadsheet-backed';
  if (status === 'source-backed') return 'Source-backed';
  if (status === 'mode-specific') return 'Mode-specific value';
  if (status === 'same-listed-value') return 'Same listed value in source';
  return status.replace(/-/g, ' ');
}

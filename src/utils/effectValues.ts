import effectValuesData from '../../data/division-2/effect-values.json';

export type EffectMode = 'pve' | 'pvp';

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
for (const value of Object.values(data.perfectTalents || {})) {
  perfectTalentMap.set(normalize(value.perfectName), value);
}

export function getPerfectTalentComparison(perfectTalentName: unknown): PerfectTalentComparison | null {
  return perfectTalentMap.get(normalize(perfectTalentName)) || null;
}

export function getItemEffectOverride(itemId: unknown): ItemEffectOverride | null {
  return data.items?.[String(itemId || '')] || null;
}

export function hasRows(mode?: EffectModeValues): boolean {
  return Boolean(mode?.rows?.length);
}

export function modeStatusLabel(status?: string): string {
  if (!status) return '';
  if (status === 'verified') return 'Verified';
  if (status === 'needs-final-verification') return 'Needs final verification';
  if (status === 'pending') return 'Pending verification';
  if (status === 'same-as-pve') return 'Same as PvE unless separately tuned';
  return status.replace(/-/g, ' ');
}

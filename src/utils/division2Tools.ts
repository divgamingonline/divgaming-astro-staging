export type ToolDataItem = Record<string, any>;

export type ToolDataset = {
  metadata?: Record<string, any>;
  items?: ToolDataItem[];
};

export function normalizeItems(data: unknown): ToolDataItem[] {
  if (Array.isArray(data)) return data as ToolDataItem[];

  if (data && typeof data === 'object') {
    const value = data as ToolDataset;
    if (Array.isArray(value.items)) return value.items;
  }

  return [];
}

export function displayName(item: ToolDataItem): string {
  return String(item.displayName || item.name || item.title || 'Unknown Item');
}

export function itemTypeLabel(item: ToolDataItem): string {
  return String(
    item.category ||
    item.rarity ||
    item.itemType ||
    item.slot ||
    item.weaponType ||
    'Reference'
  );
}

export function itemSubhead(item: ToolDataItem): string {
  return [
    item.slot,
    item.weaponType,
    item.brandOrSet,
    item.coreRollLabel || item.coreRollText,
    item.coreBehaviorBadge
  ]
    .filter(Boolean)
    .map((value) => String(value))
    .join(' · ');
}

export function itemTalent(item: ToolDataItem): { name: string; description: string } | null {
  const talent = item.talent;

  if (!talent || typeof talent !== 'object') return null;

  const name = String(talent.name || '').trim();
  const description = String(talent.description || '').trim();

  if (!name && !description) return null;

  return { name, description };
}

export function itemBonuses(item: ToolDataItem): string[] {
  if (Array.isArray(item.bonuses)) return item.bonuses.map((value) => String(value));
  if (Array.isArray(item.fixedAttributes)) {
    return item.fixedAttributes
      .map((entry: any) => String(entry.label || entry.name || ''))
      .filter(Boolean);
  }
  if (Array.isArray(item.weaponAttributes)) {
    return item.weaponAttributes
      .map((entry: any) => String(entry.label || entry.name || ''))
      .filter(Boolean);
  }
  return [];
}

export function itemRoles(item: ToolDataItem): string[] {
  if (Array.isArray(item.roles)) return item.roles.map((value) => String(value));
  if (Array.isArray(item.cores)) return item.cores.map((value) => humanizeCore(String(value)));
  if (Array.isArray(item.availableCores)) return item.availableCores.map((value) => humanizeCore(String(value)));
  return [];
}

export function itemSource(item: ToolDataItem): string {
  return String(item.source || item.notes || item.note || '');
}

export function itemDescription(item: ToolDataItem): string {
  return String(
    item.description ||
    item.note ||
    item.notes ||
    item.source ||
    ''
  );
}

export function confidenceLabel(item: ToolDataItem): string {
  if (item.needsVerification) return 'Needs verification';
  if (item.sourceConfidence) return String(item.sourceConfidence);
  if (item.sourceStatus) return String(item.sourceStatus).replace(/_/g, ' ');
  return '';
}

export function humanizeCore(value: string): string {
  const map: Record<string, string> = {
    weapon_damage: 'Weapon Damage',
    armor: 'Armor',
    skill_tier: 'Skill Tier'
  };

  return map[value] || value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function sortByName(items: ToolDataItem[]): ToolDataItem[] {
  return [...items].sort((a, b) => displayName(a).localeCompare(displayName(b)));
}

export function countNeedsVerification(items: ToolDataItem[]): number {
  return items.filter((item) => Boolean(item.needsVerification)).length;
}

export function datasetUpdatedLabel(data: unknown): string {
  if (!data || typeof data !== 'object') return '';

  const metadata = (data as ToolDataset).metadata;
  if (!metadata || typeof metadata !== 'object') return '';

  return String(
    metadata.updatedAt ||
    metadata.updated ||
    metadata.lastUpdated ||
    metadata.generatedAt ||
    ''
  );
}

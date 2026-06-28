import prototypeData from '../../data/division-2/prototype-system.json';

export type PrototypeRollExample = {
  label: string;
  standard: string;
  prototype: string;
  note?: string;
};

export type PrototypeAugment = {
  name: string;
  value: string;
  description: string;
};

export type PrototypePresentation = {
  label: string;
  title: string;
  summary: string;
  eligible: boolean;
  appliesTo: string;
  rollExamples: PrototypeRollExample[];
  weaponRollNotes: string[];
  augments: PrototypeAugment[];
  source: string;
};

const data = prototypeData as {
  summary: string;
  rollExamples: PrototypeRollExample[];
  weaponRollNotes: string[];
  augments: PrototypeAugment[];
  metadata?: {
    source?: string;
  };
};

function isExotic(type: string): boolean {
  return type.toLowerCase().includes('exotic');
}

function isWeaponLike(item: Record<string, any>, type: string): boolean {
  const text = `${type} ${item.weaponType || ''} ${item.category || ''} ${item.itemType || ''}`.toLowerCase();
  return /(weapon|rifle|assault|smg|lmg|shotgun|marksman|pistol|sidearm)/.test(text);
}

function isGearLike(item: Record<string, any>, type: string): boolean {
  const text = `${type} ${item.slot || ''} ${item.category || ''} ${item.itemType || ''}`.toLowerCase();
  return /(gear|brand|mask|backpack|chest|gloves|holster|kneepads|high-end|named)/.test(text);
}

export function getPrototypePresentation(item: Record<string, any>, type: string): PrototypePresentation | null {
  if (isExotic(type)) return null;

  const weaponLike = isWeaponLike(item, type);
  const gearLike = isGearLike(item, type);

  if (!weaponLike && !gearLike) return null;

  return {
    label: 'Prototype System',
    title: 'Prototype Eligible',
    summary: data.summary,
    eligible: true,
    appliesTo: weaponLike ? 'Eligible non-exotic weapon' : 'Eligible non-exotic gear piece',
    rollExamples: data.rollExamples || [],
    weaponRollNotes: weaponLike ? (data.weaponRollNotes || []) : [],
    augments: data.augments || [],
    source: data.metadata?.source || 'Y8S1 Build Making Tool spreadsheet'
  };
}

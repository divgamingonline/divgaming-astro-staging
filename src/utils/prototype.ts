import prototypeData from '../../data/division-2/prototype-system.json';

export type PrototypeRollExample = {
  label: string;
  standard: string;
  prototype: string;
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
  appliesTo: string;
  rollExamples: PrototypeRollExample[];
  notes: string[];
  augments: PrototypeAugment[];
};

const data = prototypeData as {
  summary: string;
  rollExamples?: PrototypeRollExample[];
  weaponRollNotes?: string[];
  gearRollNotes?: string[];
  augments?: PrototypeAugment[];
};

function textFor(item: Record<string, any>, type: string): string {
  return `${type} ${item.rarity || ''} ${item.category || ''} ${item.itemType || ''} ${item.slot || ''} ${item.weaponType || ''}`.toLowerCase();
}

function isExotic(text: string): boolean {
  return text.includes('exotic');
}

function isWeaponLike(text: string): boolean {
  return /(weapon|rifle|assault|smg|lmg|shotgun|marksman|mmr|pistol|sidearm)/.test(text);
}

function isGearLike(text: string): boolean {
  return /(gear|brand|mask|backpack|chest|glove|holster|knee|high-end|named)/.test(text);
}

export function getPrototypePresentation(item: Record<string, any>, type: string): PrototypePresentation | null {
  const text = textFor(item, type);

  if (isExotic(text)) return null;

  const weaponLike = isWeaponLike(text);
  const gearLike = isGearLike(text);

  if (!weaponLike && !gearLike) return null;

  return {
    label: 'Prototype System',
    title: 'Prototype Eligible',
    summary: data.summary,
    appliesTo: weaponLike ? 'Eligible non-exotic weapon' : 'Eligible non-exotic gear',
    rollExamples: data.rollExamples || [],
    notes: weaponLike ? (data.weaponRollNotes || []) : (data.gearRollNotes || []),
    augments: data.augments || []
  };
}

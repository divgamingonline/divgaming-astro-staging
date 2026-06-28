(() => {
  const page = document.querySelector('[data-dg-database]');
  if (!page) return;

  const kind = page.dataset.dgDatabase;
  const base = (() => {
    const marker = '/divgaming-astro-staging';
    return location.pathname.includes(marker) ? marker : '';
  })();

  const dataPaths = {
    named: '/data/division-2/named-items.json',
    exotics: '/data/division-2/exotics.json',
    brandsets: '/data/division-2/brandsets.json',
    gearsets: '/data/division-2/gearsets.json',
    gearTalents: '/data/division-2/gear-talents.json',
    weaponTalents: '/data/division-2/weapon-talents.json',
    effects: '/data/division-2/effect-values.json',
    prototype: '/data/division-2/prototype-system.json',
    icons: '/data/division-2/icon-manifest.json'
  };

  const $ = (sel) => page.querySelector(sel);
  const escapeHtml = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const normalize = (value = '') => String(value)
    .replace(/[’']/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  const slug = (value = '') => String(value)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  const labelMap = {
    all: 'All',
    gear: 'Gear',
    weapon: 'Weapon',
    backpack: 'Backpack',
    chest: 'Chest',
    mask: 'Mask',
    gloves: 'Gloves',
    holster: 'Holster',
    kneepads: 'Kneepads',
    talent: 'Talent',
    named_attribute: 'Named Attribute',
    prototype: 'Prototype',
    weapon_damage: 'Weapon Damage Core',
    armor_core: 'Armor Core',
    skill_tier: 'Skill Tier',
    exotic_weapon: 'Exotic Weapon',
    exotic_gear: 'Exotic Gear',
    ar: 'Assault Rifle',
    rifle: 'Rifle',
    smg: 'SMG',
    lmg: 'LMG',
    shotgun: 'Shotgun',
    mmr: 'Marksman Rifle',
    pistol: 'Pistol',
    dps: 'DPS',
    tank: 'Tank',
    healer: 'Healer',
    skill: 'Skill Build',
    support: 'Support'
  };

  const preferred = [
    'all','gear','weapon','exotic_weapon','exotic_gear','prototype','talent','named_attribute',
    'backpack','chest','mask','gloves','holster','kneepads',
    'weapon_damage','armor_core','skill_tier',
    'ar','rifle','smg','lmg','shotgun','mmr','pistol',
    'dps','tank','healer','skill','support'
  ];

  function asArray(data) {
    if (Array.isArray(data)) return data;
    if (data?.items && Array.isArray(data.items)) return data.items;
    if (data?.items && typeof data.items === 'object') return Object.values(data.items);
    return [];
  }

  async function loadJson(path) {
    const res = await fetch(`${base}${path}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Could not load ${path}`);
    return res.json();
  }

  function itemName(item) {
    return item.displayName || item.name || item.title || 'Unknown item';
  }

  function rawTalent(item) {
    if (typeof item.talent === 'string') return { name: item.talent, description: '' };
    if (item.talent && typeof item.talent === 'object') {
      return { name: item.talent.name || '', description: item.talent.description || '', type: item.talent.type || '' };
    }
    return { name: '', description: '' };
  }

  function itemType(item) {
    if (kind === 'named') return 'Named High-End';
    if (kind === 'exotics') return item.category || item.rarity || 'Exotic';
    if (kind === 'brandsets') return 'Brand Set';
    if (kind === 'gearsets') return 'Gear Set';
    if (kind === 'gearTalents') return item.slot ? `${item.slot} Talent` : 'Gear Talent';
    if (kind === 'weaponTalents') return 'Weapon Talent';
    return item.category || item.rarity || 'Reference';
  }

  function coreLabel(core) {
    const c = String(core || '').toLowerCase();
    if (c.includes('weapon')) return 'Weapon Damage';
    if (c.includes('armor')) return 'Armor';
    if (c.includes('skill')) return 'Skill Tier';
    return '';
  }

  function slotToken(slot = '') {
    const s = String(slot).toLowerCase();
    if (s.includes('backpack')) return 'backpack';
    if (s.includes('chest') || s.includes('vest')) return 'chest';
    if (s.includes('mask')) return 'mask';
    if (s.includes('glove')) return 'gloves';
    if (s.includes('holster')) return 'holster';
    if (s.includes('knee')) return 'kneepads';
    return '';
  }

  function weaponToken(type = '') {
    const w = String(type).toLowerCase();
    if (w.includes('smg')) return 'smg';
    if (w.includes('lmg')) return 'lmg';
    if (w.includes('shotgun')) return 'shotgun';
    if (w.includes('pistol') || w.includes('sidearm')) return 'pistol';
    if (w.includes('marksman') || w.includes('mmr')) return 'mmr';
    if (w.includes('assault') || w === 'ar') return 'ar';
    if (w.includes('rifle')) return 'rifle';
    return '';
  }

  function isExotic(item) {
    return String(item.rarity || item.category || '').toLowerCase().includes('exotic');
  }

  function isWeapon(item) {
    return Boolean(item.weaponType) || String(item.category || '').toLowerCase().includes('weapon');
  }

  function isGear(item) {
    return Boolean(item.slot) || String(item.category || item.itemType || '').toLowerCase().includes('gear');
  }

  function prototypeEligible(item) {
    if (isExotic(item)) return false;
    if (kind === 'named') return isWeapon(item) || isGear(item);
    if (kind === 'brandsets' || kind === 'gearsets') return true;
    return false;
  }

  function fixedAttributes(item) {
    const out = [];
    for (const entry of item.fixedAttributes || []) {
      if (!entry) continue;
      if (typeof entry === 'string') out.push({ label: entry, description: 'Fixed named attribute.' });
      else out.push({
        label: entry.label || entry.name || entry.value || '',
        description: /fixed named item attribute/i.test(entry.note || '') ? 'Fixed named attribute.' : (entry.note || entry.description || 'Fixed named attribute.')
      });
    }
    for (const entry of item.weaponAttributes || []) {
      if (!entry) continue;
      const note = entry.note || entry.description || '';
      if (/standard weapon core attribute/i.test(note)) continue;
      out.push({ label: entry.label || entry.name || entry.value || '', description: note || 'Named weapon attribute.' });
    }
    const talent = rawTalent(item);
    if (/^any talent$/i.test(talent.name)) out.push({ label: 'Open talent slot', description: 'Can roll with a regular talent instead of being locked to one perfect talent.' });
    if (/^named attribute$/i.test(talent.name)) out.push({ label: 'Named attribute', description: item.note || 'This item is valuable because of its named attribute.' });
    return out.filter((x) => x.label || x.description);
  }

  function perfectComparison(item, effects) {
    const talent = rawTalent(item);
    if (!talent.name || /^(any talent|named attribute)$/i.test(talent.name)) return null;
    const map = effects?.perfectTalents || {};
    const key = Object.keys(map).find((name) => normalize(name) === normalize(talent.name) || normalize(map[name]?.perfectName) === normalize(talent.name));
    if (key) return map[key];
    return { regularName: talent.name.replace(/^Perfectly\s+/i, '').replace(/^Perfected\s+/i, '').replace(/^Perfect\s+/i, ''), perfectName: talent.name, modes: {} };
  }

  function imageFor(item, icons = {}) {
    const manifest = icons || {};
    const brandMap = manifest.brands || {};
    const gearMap = manifest.gears || {};
    const weaponMap = manifest.weapons || {};
    const brandKey = slug(item.assetKey || item.brandOrSet || item.brand || item.set || item.name);
    if ((kind === 'brandsets' || kind === 'gearsets' || kind === 'named') && brandMap[brandKey]) return `${base}${brandMap[brandKey]}`;
    const st = slotToken(item.slot);
    if (st && gearMap[st]) return `${base}${gearMap[st]}`;
    const wt = weaponToken(item.weaponType);
    if (wt && weaponMap[wt]) return `${base}${weaponMap[wt]}`;
    return '';
  }

  function filtersFor(item) {
    const tokens = new Set(['all']);
    const talent = rawTalent(item);
    const slot = slotToken(item.slot);
    const wt = weaponToken(item.weaponType);
    const coreValues = [item.defaultCore, ...(Array.isArray(item.availableCores) ? item.availableCores : [])].map((x) => String(x || '').toLowerCase());

    if (isGear(item)) tokens.add('gear');
    if (isWeapon(item)) tokens.add('weapon');
    if (isExotic(item) && isWeapon(item)) tokens.add('exotic_weapon');
    if (isExotic(item) && isGear(item)) tokens.add('exotic_gear');
    if (slot) tokens.add(slot);
    if (wt) tokens.add(wt);
    if (talent.name && !/^(any talent|named attribute)$/i.test(talent.name)) tokens.add('talent');
    if (fixedAttributes(item).length) tokens.add('named_attribute');
    if (prototypeEligible(item)) tokens.add('prototype');

    if (coreValues.some((v) => v.includes('weapon'))) tokens.add('weapon_damage');
    if (coreValues.some((v) => v.includes('armor'))) tokens.add('armor_core');
    if (coreValues.some((v) => v.includes('skill'))) tokens.add('skill_tier');

    for (const role of item.roles || []) {
      const r = slug(role);
      if (['dps','tank','healer','skill','support'].includes(r)) tokens.add(r);
    }

    return [...tokens];
  }

  function searchText(item, effects) {
    const talent = rawTalent(item);
    const pc = perfectComparison(item, effects);
    return [
      itemName(item), itemType(item), item.slot, item.weaponType, item.brandOrSet, item.note, item.notes, item.description,
      talent.name, talent.description,
      ...(item.bonuses || []), item.backpack, item.chest, ...(item.roles || []),
      ...fixedAttributes(item).flatMap((a) => [a.label, a.description]),
      pc?.regularName, pc?.perfectName
    ].filter(Boolean).join(' ').toLowerCase();
  }

  function renderComparison(compare) {
    const rows = compare?.modes?.pve?.rows || [];
    if (!rows.length) return '';
    return `
      <div class="info-box">
        <span class="info-title">Regular vs Perfect</span>
        <div class="compare-table">
          <div class="compare-head"><span>Effect</span><span>Regular</span><span>Perfect</span><span>Change</span></div>
          ${rows.map((row) => `
            <div class="compare-row">
              <span>${escapeHtml(row.effect || row.metric || '')}</span>
              <strong>${escapeHtml(row.regular || '')}</strong>
              <strong>${escapeHtml(row.perfect || '')}</strong>
              <em>${escapeHtml(row.change || '')}</em>
            </div>`).join('')}
        </div>
      </div>`;
  }

  function renderPrototype(item, prototype) {
    if (!prototypeEligible(item) || !prototype) return '';
    const weaponLike = isWeapon(item);
    const sections = weaponLike ? (prototype.weaponRollSections || []) : (prototype.gearRollSections || []);
    return `
      <details class="prototype-box">
        <summary><span class="info-title">Prototype System</span><strong>Prototype Eligible</strong></summary>
        <p>${weaponLike ? 'Eligible non-exotic weapon.' : 'Eligible non-exotic gear.'}</p>
        ${sections.map((section) => `
          <div class="prototype-section">
            <span class="info-title">${escapeHtml(section.title)}</span>
            <div class="prototype-table">
              ${section.rows.map((row) => `
                <div class="prototype-row">
                  <span>${escapeHtml(row.label)}</span>
                  <strong>${escapeHtml(row.standard)}</strong>
                  <strong>${escapeHtml(row.prototype)}</strong>
                  <em>${escapeHtml(row.change)}</em>
                </div>`).join('')}
            </div>
          </div>`).join('')}
        ${(prototype.augments || []).length ? `
          <div class="prototype-section">
            <span class="info-title">Prototype Augments</span>
            <ul class="bonus-list">
              ${prototype.augments.map((aug) => `<li><strong>${escapeHtml(aug.name)}</strong> — ${escapeHtml(aug.value)}: ${escapeHtml(aug.description)}</li>`).join('')}
            </ul>
          </div>` : ''}
      </details>`;
  }

  function cardHtml(item, context) {
    const { effects, prototype, icons } = context;
    const talent = rawTalent(item);
    const compare = perfectComparison(item, effects);
    const attrs = fixedAttributes(item);
    const img = imageFor(item, icons);
    const bonuses = item.bonuses || [];
    const badges = [
      item.slot, item.weaponType, item.brandOrSet, coreLabel(item.defaultCore), prototypeEligible(item) ? 'Prototype' : ''
    ].filter(Boolean);

    let body = '';

    if (kind === 'named') {
      if (compare) {
        body += `<div class="info-box"><span class="info-title">Perfect Talent</span><strong>${escapeHtml(compare.perfectName)}</strong>${compare.regularName ? `<p>Regular Talent: <strong>${escapeHtml(compare.regularName)}</strong></p>` : ''}</div>`;
        body += renderComparison(compare);
      }
      if (attrs.length) {
        body += `<div class="info-box"><span class="info-title">Named Attribute</span><ul class="bonus-list">${attrs.map((a) => `<li><strong>${escapeHtml(a.label)}</strong>${a.description ? ` — ${escapeHtml(a.description)}` : ''}</li>`).join('')}</ul></div>`;
      }
      if (!compare && !attrs.length && item.note) {
        body += `<div class="info-box"><span class="info-title">Item Note</span><p>${escapeHtml(item.note)}</p></div>`;
      }
      body += renderPrototype(item, prototype);
    } else if (kind === 'exotics') {
      body += `<div class="info-box"><span class="info-title">Exotic Talent</span><strong>${escapeHtml(talent.name || itemName(item))}</strong>${talent.description ? `<p>${escapeHtml(talent.description)}</p>` : ''}</div>`;
      if (item.source || item.notes || item.note) body += `<div class="info-box"><span class="info-title">Where to look</span><p>${escapeHtml(item.source || item.notes || item.note)}</p></div>`;
    } else if (kind === 'brandsets' || kind === 'gearsets') {
      if (bonuses.length) body += `<div class="info-box"><span class="info-title">${kind === 'brandsets' ? 'Brand Set Bonuses' : 'Gear Set Bonuses'}</span><ul class="bonus-list">${bonuses.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul></div>`;
      if (item.chest || item.backpack) body += `<div class="info-box"><span class="info-title">Set Item Talents</span><ul class="bonus-list">${item.chest ? `<li><strong>Chest:</strong> ${escapeHtml(item.chest)}</li>` : ''}${item.backpack ? `<li><strong>Backpack:</strong> ${escapeHtml(item.backpack)}</li>` : ''}</ul></div>`;
      if (item.namedItems?.length) body += `<div class="info-box"><span class="info-title">Named Items</span><p>${item.namedItems.map(escapeHtml).join(', ')}</p></div>`;
      body += renderPrototype(item, prototype);
    } else {
      body += `<div class="info-box"><span class="info-title">Talent</span><p>${escapeHtml(item.description || talent.description || '')}</p></div>`;
    }

    return `
      <article class="database-card" data-card data-filters="${filtersFor(item).join(' ')}" data-search="${escapeHtml(searchText(item, effects))}">
        <div class="card-top">
          ${img ? `<img class="item-icon" src="${img}" alt="">` : ''}
          <div>
            <span class="kicker">${escapeHtml(itemType(item))}</span>
            <h3>${escapeHtml(itemName(item))}</h3>
            <div class="subhead">${escapeHtml([item.slot, item.weaponType, item.brandOrSet].filter(Boolean).join(' · '))}</div>
          </div>
        </div>
        ${badges.length ? `<div class="badge-row">${badges.map((b) => `<span class="badge ${b === 'Prototype' ? 'prototype' : ''}">${escapeHtml(b)}</span>`).join('')}</div>` : ''}
        ${body}
      </article>`;
  }

  async function init() {
    const map = {
      named: dataPaths.named,
      exotics: dataPaths.exotics,
      brandsets: dataPaths.brandsets,
      gearsets: dataPaths.gearsets,
      gearTalents: dataPaths.gearTalents,
      weaponTalents: dataPaths.weaponTalents
    };

    const [mainData, effects, prototype, icons] = await Promise.all([
      loadJson(map[kind]),
      loadJson(dataPaths.effects).catch(() => ({})),
      loadJson(dataPaths.prototype).catch(() => null),
      loadJson(dataPaths.icons).catch(() => ({}))
    ]);

    const items = asArray(mainData);
    const context = { effects, prototype, icons };
    const grid = $('[data-grid]');
    const count = $('[data-count]');
    const filters = $('[data-filters]');
    const search = $('[data-search]');
    const empty = $('[data-empty]');

    grid.innerHTML = items.map((item) => cardHtml(item, context)).join('');
    count.textContent = String(items.length);

    const cards = [...grid.querySelectorAll('[data-card]')];
    const counts = new Map();
    counts.set('all', cards.length);
    for (const card of cards) {
      const toks = new Set((card.dataset.filters || '').split(/\s+/).filter(Boolean));
      for (const t of toks) {
        if (t === 'all') continue;
        counts.set(t, (counts.get(t) || 0) + 1);
      }
    }

    const filterKeys = [...counts.keys()].filter((key) => counts.get(key) > 0 && (key === 'all' || counts.get(key) < cards.length));
    filterKeys.sort((a, b) => {
      const ai = preferred.includes(a) ? preferred.indexOf(a) : 999;
      const bi = preferred.includes(b) ? preferred.indexOf(b) : 999;
      if (ai !== bi) return ai - bi;
      return a.localeCompare(b);
    });

    filters.innerHTML = filterKeys.map((key) => `<button class="${key === 'all' ? 'active' : ''}" data-filter="${key}">${escapeHtml(labelMap[key] || key.replace(/^role_/, '').replace(/_/g, ' '))}<span>${counts.get(key)}</span></button>`).join('');

    let active = 'all';
    const apply = () => {
      const q = (search.value || '').trim().toLowerCase();
      let visible = 0;
      for (const card of cards) {
        const okSearch = !q || (card.dataset.search || '').includes(q);
        const okFilter = active === 'all' || (card.dataset.filters || '').split(/\s+/).includes(active);
        const show = okSearch && okFilter;
        card.hidden = !show;
        if (show) visible++;
      }
      count.textContent = String(visible);
      empty.hidden = visible > 0;
    };

    filters.addEventListener('click', (event) => {
      const button = event.target.closest('[data-filter]');
      if (!button) return;
      active = button.dataset.filter || 'all';
      filters.querySelectorAll('[data-filter]').forEach((btn) => btn.classList.toggle('active', btn === button));
      apply();
    });

    search.addEventListener('input', apply);
    $('[data-reset]')?.addEventListener('click', () => {
      search.value = '';
      active = 'all';
      filters.querySelectorAll('[data-filter]').forEach((btn) => btn.classList.toggle('active', btn.dataset.filter === 'all'));
      apply();
    });
  }

  init().catch((error) => {
    console.error(error);
    const grid = $('[data-grid]');
    if (grid) grid.innerHTML = `<div class="empty-state"><h2>Unable to load this database.</h2><p>${escapeHtml(error.message)}</p></div>`;
  });
})();

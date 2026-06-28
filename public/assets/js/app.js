/* ============================================================
   DivGaming.com — app.js v5
   Features: vendor countdown, season timeline, global search,
   light/dark mode, scroll rail, build modal, share links,
   featured build, PWA install prompt, saved builds
   ============================================================ */

const config = window.DIV2_REPO_CONFIG || {};
const perPage = Number(config.buildsPerPage || 10);

let resources = [];
let builds    = [];
let intel     = [];
let resourceCategory = 'All';
let videoCategory    = 'All';
let buildTag         = 'All';
let page             = 1;
let expandedBuild    = null;
let newsItems = [];
let tickerIndex = 0;
let tickerTimer;
let serverStatus = null;
let featured = null;

document.body.classList.remove('light');
localStorage.removeItem('dg-theme');

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

/* ── Fetch ── */
const readJson = async (path) => {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Could not load ${path}`);
  return res.json();
};

/* ── YouTube ── */
const youtubeThumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const extractVideoId = (url = '') => {
  try {
    const p = new URL(url);
    if (p.hostname.includes('youtu.be')) return p.pathname.slice(1);
    if (p.searchParams.get('v')) return p.searchParams.get('v');
    const s = p.pathname.match(/\/shorts\/([^/]+)/);
    if (s) return s[1];
  } catch {}
  return '';
};

const uniq = (items) => [...new Set(items.filter(Boolean))];
const VIDEO_CATEGORIES = ['All', 'Builds', 'Guides', 'News', 'Tips', 'Tools / Info', 'Entertainment'];
const REFINE_FILTERS = {
  All: {
    label: 'Refine Intel',
    tags: [
      'All',
      'DPS',
      'Tank',
      'Healer',
      'Skill',
      'Hybrid',
      'Solo',
      'PvE',
      'PvP',
      'Dark Zone',
      'Countdown',
      'Descent',
      'Incursion',
      'Raids',
      'Legendary',
      'Exotics',
      'Expertise',
      'Escalation',
      'Vendor Reset'
    ]
  },

  Builds: {
    label: 'Build Role / Activity',
    tags: [
      'All',
      'DPS',
      'Tank',
      'Healer',
      'Skill',
      'Hybrid',
      'Solo',
      'PvE',
      'PvP',
      'Dark Zone',
      'Incursion',
      'Raids',
      'Legendary',
      'Exotics',
      'Escalation'
    ]
  },

  Guides: {
    label: 'Guide Topic',
    tags: [
      'All',
      'New Player',
      'Countdown',
      'Dark Zone',
      'Descent',
      'Exotics',
      'Expertise',
      'Gear/Masks',
      'Incursion',
      'Legendary',
      'PvP (Conflict/DZ)',
      'Raids',
      'Resources/Farming',
      'Talents',
      'Escalation'
    ]
  },

  News: {
    label: 'News Topic',
    tags: [
      'All',
      'Patch Notes',
      'Season Updates',
      'Maintenance',
      'Community News',
      'Vendor Reset',
      'Descent',
      'Resurgence',
      'Escalation'
    ]
  },

  Tips: {
    label: 'Tip Type',
    tags: [
      'All',
      'Quick Tips',
      'Combat Tips',
      'Farming Tips',
      'Build Tips',
      'Dark Zone Tips',
      'Things Players Miss',
      'Escalation'
    ]
  },

  'Tools / Info': {
    label: 'Tool / Resource Type',
    tags: [
      'All',
      'Talents',
      'Brand & Gearsets',
      'Build Tools',
      'Calculators',
      'Division Channels',
      'Service Status',
      'Map',
      'Timers',
      'Vendor Reset'
    ]
  },

  Entertainment: {
    label: 'Entertainment Type',
    tags: [
      'All',
      'Story/Lore',
      'Fan Fiction',
      'Short Films',
      'Community Edits',
      'Shorts'
    ]
  }
};

function getRefineFilterConfig(category = 'All') {
  return REFINE_FILTERS[category] || REFINE_FILTERS.All;
}

function normalizeVideoCategory(value = '') {
  const text = String(value || '').trim().toLowerCase();

  if (!text || text === 'all') return 'All';
  if (text === 'build' || text === 'builds') return 'Builds';
  if (text === 'guide' || text === 'guides') return 'Guides';
  if (text === 'news' || text === 'news hub') return 'News';
  if (text === 'tip' || text === 'tips') return 'Tips';
  if (text.includes('tool') || text.includes('info')) return 'Tools / Info';
  if (text.includes('entertain')) return 'Entertainment';

  return value;
}

function getVideoSection(video = {}) {
  return normalizeVideoCategory(video.section || video.contentType || 'Builds');
}

function getVideoSubcategory(video = {}) {
  return video.subcategory || video.activity || '';
}

function getVideoFilterValues(video = {}) {
  return uniq([
    getVideoSection(video),
    video.contentType,
    video.section,
    video.subcategory,
    video.activity,
    video.format,
    ...(video.tags || []),
    ...(video.sourceTags || [])
  ].map((value) => String(value || '').trim()).filter(Boolean));
}

function videoMatchesCategory(video, category) {
  return category === 'All' || getVideoSection(video) === category;
}

function videoMatchesTag(video, tag) {
  if (tag === 'All') return true;

  return getVideoFilterValues(video).some((value) =>
    value.toLowerCase() === tag.toLowerCase()
  );
}

function videoSearchText(video = {}) {
  return [
    video.title,
    video.creator,
    video.description,
    video.contentType,
    video.section,
    video.subcategory,
    video.activity,
    video.format,
    ...(video.tags || []),
    ...(video.sourceTags || [])
  ].join(' ').toLowerCase();
}

function youtubeStat(video = {}, key) {
  if (key === 'viewCount') return Number(video.youtubeStats?.viewCount ?? video.views ?? 0) || 0;
  if (key === 'likeCount') return Number(video.youtubeStats?.likeCount ?? video.likes ?? 0) || 0;
  if (key === 'commentCount') return Number(video.youtubeStats?.commentCount ?? video.comments ?? 0) || 0;
  return 0;
}

function daysSince(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 999;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000));
}

function videoEngagementScore(video = {}) {
  const views = youtubeStat(video, 'viewCount');
  const likes = youtubeStat(video, 'likeCount');
  const comments = youtubeStat(video, 'commentCount');
  const likeRate = views > 0 ? likes / views : 0;
  const freshness = Math.max(0, 30 - daysSince(video.publishedAt));
  const confidence = Number(video.classificationConfidence || 0) * 20;

  return likes * 1.5 + comments * 4 + likeRate * 500 + freshness + confidence;
}

function videoMetaLabel(video = {}) {
  return uniq([
    getVideoSection(video),
    getVideoSubcategory(video),
    ...(video.tags || [])
  ]).slice(0, 4).join(' · ');
}

const fmtDate = (iso) => {
  try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return iso; }
};

const faviconUrl = (url) => {
  try { return `https://www.google.com/s2/favicons?sz=32&domain=${new URL(url).hostname}`; }
  catch { return ''; }
};

// Helper for escaping HTML
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

/* ── NAV / Mobile ── */
function setupNav() {
  const toggle = $('.nav-toggle');
  const links  = $('#nav-links');
  toggle?.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  $$('#nav-links a').forEach((a) => a.addEventListener('click', () => {
    links.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  }));
  document.addEventListener('click', (e) => {
    if (links.classList.contains('open') && !links.contains(e.target) && e.target !== toggle) {
      links.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ── Scroll Rail ── */
function setupScrollRail() {
  const dots = $$('.rail-dot');
  const sections = dots.map((d) => ({
    dot: d,
    el: document.getElementById(d.dataset.section)
  })).filter((s) => s.el);

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        dots.forEach((d) => d.classList.toggle('active', d.dataset.section === id));
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  sections.forEach((s) => io.observe(s.el));
}

/* ── Active nav on scroll ── */
function setupScrollSpy() {
  const navLinks = $$('#nav-links a');
  const sections = ['tools','builds','submit'];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  sections.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
}

/* ── Scroll Reveal ── */
function setupScrollReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('revealed'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.08 });
  $$('.reveal-section').forEach((el) => io.observe(el));
}

/* ── Stats counter ── */
function animateCount(selector, target) {
  const el = $(selector); if (!el) return;
  const start = performance.now();
  const update = (now) => {
    const t = Math.min((now - start) / 800, 1);
    el.textContent = Math.round(t * target);
    if (t < 1) requestAnimationFrame(update); else el.textContent = target;
  };
  requestAnimationFrame(update);
}

function renderStats() {
  const toolsCount = resources.length;
  const videosCount = builds.length;
  const creatorsCount = uniq(builds.map((b) => b.creator)).length;

  animateCount('#stat-tools', toolsCount);
  animateCount('#stat-builds', videosCount);
  animateCount('#stat-creators', creatorsCount);

  animateCount('#footer-stat-tools', toolsCount);
  animateCount('#footer-stat-videos', videosCount);
  animateCount('#footer-stat-creators', creatorsCount);
}
function renderBackpackModuleCounts() {
  const communityCount = document.getElementById('community-module-count');
  const officialCount = document.getElementById('official-module-count');

  if (communityCount) {
    communityCount.textContent = `${resources.length} resources available`;
  }

  if (officialCount) {
    officialCount.textContent = `${intel.length} official resources`;
  }
}

/* ── Saved Builds (Desktop) ── */
function getLocalSaves() {
  try {
    return JSON.parse(localStorage.getItem('div2-local-saves') || '{}');
  } catch {
    return {};
  }
}

function setLocalSaves(saves) {
  try {
    localStorage.setItem('div2-local-saves', JSON.stringify(saves));
  } catch {}
}

function renderDesktopSavedBuilds() {
  const savedSection = document.getElementById('desktop-saved-builds');
  const savedContainer = document.getElementById('saved-builds-container');
  const savedCountSpan = document.getElementById('saved-builds-count');
  
  if (!savedSection || !savedContainer) return;
  
  const saves = getLocalSaves();
  const savedIds = Object.keys(saves).filter(id => saves[id] === 1);
  
  if (savedIds.length === 0) {
    savedSection.style.display = 'none';
    return;
  }
  
  savedSection.style.display = 'block';
  if (savedCountSpan) savedCountSpan.textContent = savedIds.length;
  
  const savedBuilds = builds.filter(b => savedIds.includes(b.id));
  
  if (savedBuilds.length === 0) {
    savedContainer.innerHTML = '<div class="saved-builds-empty"><i data-lucide="star"></i><p>No saved builds yet. Click the ★ on any build to save it here.</p></div>';
    if (window.lucide) lucide.createIcons({ root: savedContainer });
    return;
  }
  
  savedContainer.innerHTML = savedBuilds.map(build => `
    <div class="saved-build-card" data-build-id="${build.id}">
      <div class="saved-build-thumb">
        <img src="${youtubeThumb(build.videoId || extractVideoId(build.url))}" loading="lazy" />
      </div>
      <div class="saved-build-info">
        <div class="saved-build-title">${escapeHtml(build.title)}</div>
        <div class="saved-build-creator">${escapeHtml(build.creator)}</div>
        <div class="saved-build-meta">
          <span>${fmtDate(build.publishedAt)}</span>
          ${build.tags ? `<span>${build.tags.slice(0,2).join(' • ')}</span>` : ''}
        </div>
      </div>
      <button class="saved-build-remove" data-remove-id="${build.id}" aria-label="Remove saved build">
        <i data-lucide="x"></i>
      </button>
    </div>
  `).join('');
  
  if (window.lucide) lucide.createIcons({ root: savedContainer });
  
  // Add click handlers for saved build cards
  document.querySelectorAll('#saved-builds-container .saved-build-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.saved-build-remove')) return;
      const buildId = card.dataset.buildId;
      const build = builds.find(b => b.id === buildId);
      if (build) openBuildModal(build);
    });
  });
  
  // Add remove handlers
  document.querySelectorAll('#saved-builds-container .saved-build-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.removeId;
      const saves = getLocalSaves();
      saves[id] = 0;
      setLocalSaves(saves);
      renderDesktopSavedBuilds();
      renderBuilds();
    });
  });
}

/* ── Global Search (Enhanced) ── */
function setupGlobalSearch() {
  const input   = $('#global-search');
  const results = $('#global-results');
  const submitBtn = $('#desktop-search-submit');
  if (!input || !results) return;

  let timer;
  
  function performSearch() {
    const q = input.value.trim();
    if (q.length < 2) { results.classList.remove('show'); return; }
    const ql = q.toLowerCase();

    const hits = [];

    builds.filter((b) => videoSearchText(b).includes(ql))
  .slice(0, 5)
  .forEach((b) => hits.push({
    type: getVideoSection(b),
    label: b.title,
    sub: `${b.creator}${getVideoSubcategory(b) ? ` • ${getVideoSubcategory(b)}` : ''}`,
    action: () => openBuildModal(b)
  }));

    resources.filter((r) => `${r.title} ${r.description}`.toLowerCase().includes(ql))
      .slice(0, 3)
      .forEach((r) => hits.push({ type: 'Tool', label: r.title, sub: r.category, action: () => window.open(r.url, '_blank', 'noopener') }));

    intel.filter((i) => `${i.title} ${i.description}`.toLowerCase().includes(ql))
      .slice(0, 2)
      .forEach((i) => hits.push({ type: 'Intel', label: i.title, sub: '', action: () => window.open(i.url, '_blank', 'noopener') }));

    if (hits.length === 0) {
      results.innerHTML = `<div class="desktop-search-result" style="text-align:center; color:var(--muted);">No results for "${escapeHtml(q)}"</div>`;
    } else {
      results.innerHTML = hits.map((h, idx) => `
        <div class="desktop-search-result" data-idx="${idx}">
          <div class="desktop-search-result-title">${escapeHtml(h.label)}</div>
          <div class="desktop-search-result-meta">
            ${h.type} ${h.sub ? `• ${escapeHtml(h.sub)}` : ''}
          </div>
        </div>`).join('');
      $$('.desktop-search-result').forEach((el, idx) => el.addEventListener('click', () => {
        hits[idx].action();
        results.classList.remove('show');
        input.value = '';
      }));
    }
    results.classList.add('show');
  }

  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(performSearch, 120);
  });

  if (submitBtn) {
    submitBtn.addEventListener('click', performSearch);
  }

  input.addEventListener('focus', () => {
    if (input.value.trim().length > 1) results.classList.add('show');
  });

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !results.contains(e.target)) {
      results.classList.remove('show');
    }
  });
}

/* ── Vendor Countdown ── */
function setupVendorCountdown() {
  function nextReset() {
    const now = new Date();
    const currentDay = now.getUTCDay();
    let daysUntil = (2 - currentDay + 7) % 7;
    if (daysUntil === 0 && now.getUTCHours() >= 12) daysUntil = 7;
    const next = new Date(now);
    next.setUTCDate(next.getUTCDate() + daysUntil);
    next.setUTCHours(12, 0, 0, 0);
    return next;
  }

  function pad(n) { return String(Math.max(0, n)).padStart(2, '0'); }

  function tick() {
    const diff = nextReset() - Date.now();
    if (diff <= 0) { setTimeout(tick, 1000); return; }
    const days = Math.floor(diff / 86400000);
    const hrs  = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const setEl = (id, val) => { const el = document.getElementById(id.replace('#','')); if (el) el.textContent = pad(val); };
    setEl('#vc-days', days);
    setEl('#vc-hours', hrs);
    setEl('#vc-mins', mins);
  }

  tick();
  setInterval(tick, 1000);
}

/* ── Season Timeline ── */
function setupSeasonTimeline() {
  const seasonStart = new Date('2025-12-10T12:00:00Z');
  const seasonEnd   = new Date('2026-09-10T12:00:00Z');
  const events = [
    { label: 'Season start',  date: new Date('2025-12-10T12:00:00Z') },
    { label: 'TU 21.1',       date: new Date('2026-01-28T12:00:00Z') },
    { label: 'PTS Phase 1',   date: new Date('2026-04-22T12:00:00Z') },
    { label: 'PTS Phase 2',   date: new Date('2026-05-20T12:00:00Z') },
    { label: 'TU 21.2 Est.',  date: new Date('2026-06-17T12:00:00Z') },
    { label: 'Season end Est.',date: seasonEnd },
  ];

  const now     = new Date();
  const total   = seasonEnd - seasonStart;
  const elapsed = Math.min(Math.max(now - seasonStart, 0), total);
  const pct     = (elapsed / total) * 100;

  const fill = document.getElementById('timeline-fill');
  if (fill) {
    fill.style.width = Math.min(pct, 98).toFixed(1) + '%';
  }

  const container = document.getElementById('timeline-events');
  if (container) {
    container.innerHTML = '';
    events.forEach((ev) => {
      const p = Math.min(Math.max((ev.date - seasonStart) / total * 100, 0), 100);
      const dot = document.createElement('div');
      dot.className = 'tl-event ' + (ev.date <= now ? 'past' : 'future');
      dot.style.left = p.toFixed(1) + '%';
      dot.title = ev.label + ' — ' + fmtDate(ev.date.toISOString());
      const lbl = document.createElement('span');
      lbl.className = 'tl-label';
      lbl.textContent = ev.label;
      dot.appendChild(lbl);
      container.appendChild(dot);
    });
  }

  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const tlStart = document.getElementById('tl-start'); if (tlStart) tlStart.textContent = 'Start: ' + fmt(seasonStart);
  const tlEnd   = document.getElementById('tl-end');   if (tlEnd)   tlEnd.textContent   = 'Est. end: ' + fmt(seasonEnd);
  const tlToday = document.getElementById('tl-today'); if (tlToday) tlToday.textContent = 'Today · ' + Math.round(pct) + '% through season';
}

/* ── Resources ── */
function renderResourceFilters() {
  const cats = ['All', ...uniq(resources.map((r) => r.category))];

  $('#resource-filters').innerHTML = cats
    .map((c) => `
      <button class="chip resource-filter-chip ${c === resourceCategory ? 'active' : ''}" data-resource-category="${c}">
        <i data-lucide="${c === 'All' ? 'layout-grid' : getResourceIcon(c)}"></i>
        <span>${c}</span>
      </button>
    `)
    .join('');

  $$('[data-resource-category]').forEach((btn) => btn.addEventListener('click', () => {
    resourceCategory = btn.dataset.resourceCategory;
    renderResources();
    renderResourceFilters();
  }));

  if (window.lucide) lucide.createIcons();
}

function getResourceIcon(category = '') {
  const text = category.toLowerCase();
  if (text.includes('build')) return 'wrench';
  if (text.includes('spreadsheet')) return 'table';
  if (text.includes('map')) return 'map';
  if (text.includes('guide')) return 'book-open';
  if (text.includes('community')) return 'users';
  if (text.includes('media')) return 'image';
  return 'box';
}

function renderResources() {
  const filtered = resourceCategory === 'All'
    ? resources
    : resources.filter((r) => r.category === resourceCategory);

  $('#resources-grid').innerHTML = filtered.map((r) => `
    <article class="resource-card">
      <div class="resource-card-header">
        <div class="resource-card-icon" aria-hidden="true">
          <i data-lucide="${getResourceIcon(r.category)}"></i>
        </div>
        <span class="tag">${r.category}</span>
      </div>
      <h3>${r.title}</h3>
      <p>${r.description}</p>
      <a class="link" href="${r.url}" target="_blank" rel="noopener">Open resource</a>
    </article>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

/* ── Build Modal ── */
function openBuildModal(b) {
  const videoId = b.videoId || extractVideoId(b.url);
  const saves   = getLocalSaves();
  const tags    = (b.tags || []).join(' · ');

  $('#modal-body').innerHTML = `
    <div class="modal-thumb">
      <img src="${youtubeThumb(videoId)}" alt="${b.title}" loading="lazy" />
      <a class="modal-play-btn" href="${b.url}" target="_blank" rel="noopener" aria-label="Watch on YouTube">▶</a>
    </div>
    <div class="modal-meta">
      <span class="modal-creator">${b.creator}</span>
      <span class="tag">${fmtDate(b.publishedAt)}</span>
      ${tags ? `<span class="tag">${tags}</span>` : ''}
     </div>
    <h2>${b.title}</h2>
    ${b.description ? `<p class="modal-desc">${b.description}</p>` : ''}
    <div class="modal-actions">
      <a class="btn primary" href="${b.url}" target="_blank" rel="noopener">▶ Watch on YouTube</a>
      <button class="btn ghost" id="modal-share-btn">🔗 Copy link</button>
      <button class="btn ghost" id="modal-save-btn" data-id="${b.id}">${saves[b.id] ? '★ Saved' : '★ Save'}</button>
    </div>`;

  $('#modal-share-btn')?.addEventListener('click', () => {
    const url = `${location.origin}/share/${encodeURIComponent(b.id)}/`;
    navigator.clipboard?.writeText(url).then(() => {
      const btn = $('#modal-share-btn');
      if (btn) {
        btn.textContent = '✓ Copied!';
        setTimeout(() => btn.textContent = '🔗 Copy link', 1800);
      }
    });
  });

  $('#modal-save-btn')?.addEventListener('click', () => {
    const currentSaves = getLocalSaves();
    currentSaves[b.id] = currentSaves[b.id] ? 0 : 1;
    setLocalSaves(currentSaves);
    openBuildModal(b);
    renderBuilds();
    renderDesktopSavedBuilds();
  });

  $('#modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  $('#modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function setupModal() {
  $('#modal-close')?.addEventListener('click', closeModal);
  $('#modal-overlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  const hash = location.hash;
  const match = hash.match(/build=([^&]+)/);
  if (match) {
    const id = match[1];
    const b  = builds.find((b) => b.id === id);
    if (b) openBuildModal(b);
  }
}

/* ── Featured Build ── */
function creatorInitials(name = '') {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'DG';
}

function renderCommunitySpotlight() {
  const wrapper = $('#featured-build');
  const inner = $('#featured-inner');

  if (!wrapper || !inner || !featured) {
    if (wrapper) wrapper.style.display = 'none';
    return;
  }

  const featuredVideoId = featured?.buildOfTheWeek?.videoId;
  const featuredId = featured?.buildOfTheWeek?.id;

  const build = builds.find((item) =>
    (featuredVideoId && item.videoId === featuredVideoId) ||
    (featuredId && item.id === featuredId)
  );

  const creator = featured.creatorOfTheWeek || {};
  const hasCreator = creator.name || creator.handle || creator.youtubeUrl;

  if (!build && !hasCreator) {
    wrapper.style.display = 'none';
    return;
  }

  const creatorAvatar = creator.avatar
    ? `<img class="spotlight-creator-avatar" src="${creator.avatar}" alt="${creator.name || creator.handle} avatar" loading="lazy" />`
    : `<div class="spotlight-creator-fallback" aria-hidden="true">${creatorInitials(creator.name || creator.handle)}</div>`;

  inner.innerHTML = `
    <article class="spotlight-card spotlight-build-card">
      <div class="spotlight-card-kicker">Featured Build</div>
      ${build ? `
        <a class="spotlight-thumb" href="${build.url}" target="_blank" rel="noopener" aria-label="Watch ${build.title} on YouTube">
          <img src="${youtubeThumb(build.videoId || extractVideoId(build.url))}" alt="Thumbnail for ${build.title}" loading="lazy" />
          <span>Watch on YouTube</span>
        </a>
        <div class="spotlight-card-body">
          <h3>${build.title}</h3>
          <p class="spotlight-meta">${build.creator || 'Community Creator'} // ${fmtDate(build.publishedAt || '')}</p>
          <p>${build.description || 'Featured community build selected for this week’s agent spotlight.'}</p>
        </div>
      ` : `
        <div class="spotlight-empty">
          <h3>No build selected yet</h3>
          <p>Add a videoId to <code>data/featured.json</code> to feature a Build of the Week.</p>
        </div>
      `}
    </article>
    <article class="spotlight-card spotlight-creator-card">
      <div class="spotlight-creator-banner">
        ${creator.banner ? `
          <img src="${creator.banner}" alt="" loading="lazy" />
        ` : `
          <div class="spotlight-creator-banner-fallback">
            <span>Featured Agent</span>
            <strong>${creator.name || 'Creator Spotlight'}</strong>
          </div>
        `}
      </div>
      <div class="spotlight-card-kicker">Creator of the Week</div>
      <div class="spotlight-creator-top">
        <div class="spotlight-creator-head">
          ${creatorAvatar}
          <div>
            <h3>${creator.name || 'Creator not selected'}</h3>
            ${creator.verified ? `<p class="creator-verification">SHD Verified</p>` : ''}
            ${creator.handle ? `<p class="spotlight-meta">${creator.handle}</p>` : ''}
          </div>
        </div>
        ${Array.isArray(creator.links) && creator.links.length ? `
          <div class="spotlight-social-panel spotlight-social-panel-compact" aria-label="Creator social links">
            <p class="spotlight-social-heading">Support ${creator.name || 'Creator'}</p>
            <div class="spotlight-social-grid">
              ${creator.links.map((link) => `
                <a class="spotlight-social-link" href="${link.url}" target="_blank" rel="noopener">
                  <img src="assets/img/socials/${link.platform}.png" alt="" aria-hidden="true" loading="lazy" />
                  <span>${link.label}</span>
                </a>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
      <p class="spotlight-creator-desc">
        ${creator.description || 'Select a creator in data/featured.json to spotlight their work and contribution to the Division 2 community.'}
      </p>
      ${creator.focus ? `
        <div class="spotlight-focus">
          <span>Featured Focus</span>
          <p>${creator.focus}</p>
        </div>
      ` : ''}
      ${Array.isArray(creator.tags) && creator.tags.length ? `
        <div class="spotlight-creator-tags" aria-label="Creator spotlight tags">
          ${creator.tags.map((tag) => `<span>${tag}</span>`).join('')}
        </div>
      ` : ''}
    </article>
  `;

  wrapper.style.display = 'block';
}

/* ── Builds ── */
function getFilteredBuilds() {
  const search = $('#build-search')?.value?.trim().toLowerCase() || '';
  const sort   = $('#sort-builds')?.value || 'score';

  let filtered = builds.filter((b) => {
    const categoryMatch = videoMatchesCategory(b, videoCategory);
    const tagMatch = videoMatchesTag(b, buildTag);
    const searchMatch = !search || videoSearchText(b).includes(search);

    return categoryMatch && tagMatch && searchMatch;
  });

  return filtered.sort((a, b) => {
    if (sort === 'newest')  return new Date(b.publishedAt) - new Date(a.publishedAt);
    if (sort === 'creator') return String(a.creator).localeCompare(String(b.creator));

    if (videoCategory === 'News') {
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    }

    return videoEngagementScore(b) - videoEngagementScore(a);
  });
}

function renderBuildFilters() {
  const filterRoot = $('#build-filters');
  if (!filterRoot) return;

    const categoryBuilds = videoCategory === 'All'
    ? builds
    : builds.filter((b) => videoMatchesCategory(b, videoCategory));

  const availableValues = new Set(categoryBuilds.flatMap((b) => getVideoFilterValues(b)));

  const hasValue = (tag) =>
    tag === 'All' ||
    [...availableValues].some((value) => value.toLowerCase() === tag.toLowerCase());

    const refineConfig = getRefineFilterConfig(videoCategory);
  const shouldShowRefine = videoCategory !== 'All';
  const tags = shouldShowRefine ? refineConfig.tags.filter(hasValue) : [];

  filterRoot.innerHTML = `
    <div class="video-filter-stack">
      <div class="video-filter-group">
        <span class="video-filter-label">Intel Type</span>
        <div class="video-filter-row">
          ${VIDEO_CATEGORIES.map((category) => {
            const count = category === 'All'
              ? builds.length
              : builds.filter((b) => videoMatchesCategory(b, category)).length;

            if (category !== 'All' && count === 0) return '';

            return `
              <button
                class="chip video-category-chip ${category === videoCategory ? 'active' : ''}"
                data-video-category="${category}"
              >
                ${category}
              </button>
            `;
          }).join('')}
        </div>
      </div>

            ${shouldShowRefine && tags.length ? `
        <div class="video-filter-group video-refine-group">
          <span class="video-filter-label">${refineConfig.label}</span>
          <div class="video-filter-row">
            ${tags.map((tag) => `
              <button class="chip ${tag === buildTag ? 'active' : ''}" data-build-tag="${tag}">
                ${tag}
              </button>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

    $$('[data-video-category]').forEach((btn) => btn.addEventListener('click', () => {
    videoCategory = btn.dataset.videoCategory;
    buildTag = 'All';
    page = 1;
    renderBuildFilters();
    renderBuilds();
  }));

  $$('[data-build-tag]').forEach((btn) => btn.addEventListener('click', () => {
    buildTag = btn.dataset.buildTag;
    page = 1;
    renderBuilds();
    renderBuildFilters();
  }));
}
function renderBuilds() {
  const filtered   = getFilteredBuilds();
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  page = Math.min(page, totalPages);
  const saves   = getLocalSaves();
  const visible = filtered.slice((page - 1) * perPage, page * perPage);

  $('#build-list').innerHTML = visible.length
    ? visible.map((b) => {
        const videoId = b.videoId || extractVideoId(b.url);
        const saved = saves[b.id] ? 'voted' : '';
        const tags = videoMetaLabel(b);
        return `<article class="build-card" data-build-id="${b.id}">
          <div class="thumb">
            <img src="${youtubeThumb(videoId)}" alt="${b.title}" loading="lazy" />
            <span>▶ YouTube</span>
          </div>
          <div class="build-content">
            <h3>${b.title}</h3>
            <div class="build-meta">
              <span class="build-meta-creator">${b.creator}</span>
              <span>${fmtDate(b.publishedAt)}</span>
              ${tags ? `<span>${tags}</span>` : ''}
            </div>
            ${b.description ? `<p>${b.description}</p>` : ''}
          </div>
          <div class="build-actions">
            <button class="vote ${saved}" data-vote="${b.id}" aria-label="Save ${b.title}">★ Save</button>
            <button class="share-btn" data-share="${b.id}" aria-label="Share build">🔗</button>
          </div>
        </article>`;
      }).join('')
    : '<p class="form-note" style="text-align:center;padding:28px 0">No videos match that filter yet.</p>';

  $$('[data-build-id]').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-vote]') || e.target.closest('[data-share]')) return;
      const b = builds.find((b) => b.id === card.dataset.buildId);
      if (b) openBuildModal(b);
    });
  });

  $$('[data-vote]').forEach((btn) => btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const saves = getLocalSaves();
    const id = btn.dataset.vote;
    saves[id] = saves[id] ? 0 : 1;
    setLocalSaves(saves);
    renderBuilds();
    renderDesktopSavedBuilds();
  }));

  $$('[data-share]').forEach((btn) => btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const url = `${location.origin}${location.pathname}#build=${btn.dataset.share}`;
    navigator.clipboard?.writeText(url).then(() => {
      btn.textContent = '✓'; setTimeout(() => btn.textContent = '🔗', 1600);
    });
  }));

  const pagination = $('#build-pagination');

  function getPaginationItems(currentPage, totalPages) {
    const delta = 2;
    const range = [];
    const items = [];
    let last;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (last) {
        if (i - last === 2) {
          items.push(last + 1);
        } else if (i - last > 2) {
          items.push('ellipsis');
        }
      }
      items.push(i);
      last = i;
    }
    return items;
  }

  if (totalPages <= 1) {
    pagination.innerHTML = '';
  } else {
    const paginationItems = getPaginationItems(page, totalPages);
    pagination.innerHTML = `
      <button class="page-btn page-nav" data-page="${Math.max(1, page - 1)}" ${page === 1 ? 'disabled' : ''}>‹ Prev</button>
      ${paginationItems.map((item) => {
        if (item === 'ellipsis') {
          return `<span class="page-ellipsis" aria-hidden="true">…</span>`;
        }
        return `<button class="page-btn ${item === page ? 'active' : ''}" data-page="${item}">${item}</button>`;
      }).join('')}
      <button class="page-btn page-nav" data-page="${Math.min(totalPages, page + 1)}" ${page === totalPages ? 'disabled' : ''}>Next ›</button>
    `;
    $$('[data-page]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        page = Number(btn.dataset.page);
        renderBuilds();
        $('#builds').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }
}

/* ── Intel ── */
function getIntelIcon(title = '') {
  const text = title.toLowerCase();
  if (text.includes('patch') || text.includes('live event') || text.includes('news')) return 'newspaper';
  if (text.includes('seasonal') || text.includes('hub')) return 'satellite-dish';
  if (text.includes('logo') || text.includes('key art') || text.includes('dlc art') || text.includes('media')) return 'image';
  if (text.includes('support')) return 'headphones';
  if (text.includes('known') || text.includes('issue')) return 'triangle-alert';
  if (text.includes('server') || text.includes('status')) return 'activity';
  if (text.includes('trello') || text.includes('tracker')) return 'kanban';
  if (text.includes('twitter') || text.includes('x ')) return 'radio';
  return 'external-link';
}

function renderIntel() {
  $('#intel-grid').innerHTML = intel.map((item) => `
    <article class="intel-row">
      <div class="intel-row-icon" aria-hidden="true">
        <i data-lucide="${getIntelIcon(item.title)}"></i>
      </div>
      <div>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      </div>
      <a class="btn ghost intel-row-btn" href="${item.url}" ${item.url.startsWith('#') ? '' : 'target="_blank" rel="noopener"'}>Open ↗</a>
    </article>
  `).join('');
  if (window.lucide) lucide.createIcons();
}

/* ── Build controls (Enhanced) ── */
function setupBuildControls() {
  const buildSearch = $('#build-search');
  const buildSearchSubmit = $('#builds-search-submit');
  
  if (buildSearch) {
    buildSearch.addEventListener('input', () => {
      page = 1;
      renderBuilds();
    });
    
    // Add enter key support
    buildSearch.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        page = 1;
        renderBuilds();
      }
    });
  }
  
  // Add submit button click handler
  if (buildSearchSubmit && buildSearch) {
    buildSearchSubmit.addEventListener('click', () => {
      page = 1;
      renderBuilds();
    });
  }
  
  $('#sort-builds')?.addEventListener('change', () => {
    page = 1;
    renderBuilds();
  });
}

/* ── Masked email ── */
function setupMaskedEmail() {
  const button = $('.masked-email');
  const text   = $('#masked-email-text');
  if (!button || !text) return;
  const email = [button.dataset.user, '@', button.dataset.domain, '.', button.dataset.tld].join('');
  let revealed = false;
  button.addEventListener('click', async () => {
    if (!revealed) { text.textContent = email; button.classList.add('revealed'); revealed = true; return; }
    try {
      await navigator.clipboard.writeText(email);
      text.textContent = 'Copied ✓'; setTimeout(() => text.textContent = email, 1800);
    } catch { window.location.href = `mailto:${email}`; }
  });
}

/* ── PWA ── */
function setupPWA() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/divgaming-astro-staging/sw.js').catch(() => {});
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); deferredPrompt = e;
    const btn = $('#install-btn');
    if (btn) btn.style.display = 'inline-flex';
  });
  $('#install-btn')?.addEventListener('click', () => {
    if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt.userChoice.then(() => { deferredPrompt = null; $('#install-btn').style.display = 'none'; }); }
  });
}

/* News Ticker */
function renderNewsTicker() {
  const label = document.querySelector('#ticker-label');
  const title = document.querySelector('#ticker-title');
  const link = document.querySelector('#ticker-link');
  if (!label || !title || !link || !newsItems.length) return;
  const item = newsItems[tickerIndex % newsItems.length];
  label.textContent = item.label || 'Official Intel';
  title.textContent = item.title || 'Division 2 News & Updates';
  link.href = item.url || 'https://www.ubisoft.com/en-us/game/the-division/the-division-2/news-updates';
  tickerIndex += 1;
}

function startNewsTicker() {
  renderNewsTicker();
  clearInterval(tickerTimer);
  tickerTimer = setInterval(renderNewsTicker, 7000);
}

function normalizeStatusClass(status = '') {
  return String(status).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'unknown';
}

function renderServerStatus() {
  const card = $('#server-status-card');
  const pill = $('#server-status-pill');
  const message = $('#server-status-message');
  if (!card || !pill || !message) return;
  const data = serverStatus || {
    overallStatus: 'Unknown',
    message: 'Unable to verify server status automatically. Check Ubisoft’s official status page for the latest information.',
    sourceUrl: 'https://www.ubisoft.com/fr-fr/game/the-division/the-division-2/status',
    platforms: [{ name: 'PC', status: 'Unknown' }, { name: 'PlayStation', status: 'Unknown' }, { name: 'Xbox', status: 'Unknown' }]
  };
  const overall = data.overallStatus || 'Unknown';
  card.dataset.status = normalizeStatusClass(overall);
  pill.textContent = overall;
  message.textContent = data.message || 'Check Ubisoft’s official server status page for the latest network information.';
}

function setupResourceTabs() {
  const tabs = document.querySelectorAll('[data-resource-tab]');
  const modal = document.getElementById('backpack-modal');
  const modalBody = document.getElementById('backpack-modal-body');
  const closeBtn = document.getElementById('backpack-modal-close');
  let activePanel = null;

  function openBackpackModule(tabName) {
    const panel = document.querySelector(`[data-tab-panel="${tabName}"]`);
    if (!panel || !modal || !modalBody) return;
    tabs.forEach((tab) => {
      const isActive = tab.dataset.resourceTab === tabName;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    const title = tabName === 'official' ? 'Official Network' : 'Community Intel';
    const subtitle = tabName === 'official'
      ? 'Ubisoft support, patch notes, status resources, and official Division channels.'
      : 'Community tools, maps, spreadsheets, build resources, and field guides.';
    modalBody.innerHTML = `
      <div class="backpack-modal-head">
        <p class="eyebrow">Agent Backpack</p>
        <h3>${title}</h3>
        <p>${subtitle}</p>
      </div>
      <div class="backpack-modal-slot" id="backpack-modal-slot"></div>
    `;
    const slot = document.getElementById('backpack-modal-slot');
    activePanel = panel;
    while (panel.firstChild) { slot.appendChild(panel.firstChild); }
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    if (window.lucide) lucide.createIcons();
  }

  function closeBackpackModule() {
    if (!modal || !modalBody || !activePanel) return;
    const slot = document.getElementById('backpack-modal-slot');
    if (slot) {
      while (slot.firstChild) { activePanel.appendChild(slot.firstChild); }
    }
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    modalBody.innerHTML = '';
    activePanel = null;
  }

  tabs.forEach((tab) => { tab.addEventListener('click', () => { openBackpackModule(tab.dataset.resourceTab); }); });
  closeBtn?.addEventListener('click', closeBackpackModule);
  modal?.addEventListener('click', (event) => {
    if (event.target.classList.contains('backpack-modal-overlay') || event.target.id === 'backpack-modal') {
      closeBackpackModule();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal?.classList.contains('active')) { closeBackpackModule(); }
  });
}

/* ============================================================
   SHD Terminal Broadcast System (with dynamic feeds)
   ============================================================ */

let terminalItems = [];
let terminalIndex = 0;
let terminalInterval;

// Helper to get server status message
function getServerStatusMessage() {
  const statusData = serverStatus;
  if (!statusData) return null;
  
  const overall = statusData.overallStatus || 'Unknown';
  if (overall === 'Operational') {
    return { 
      main: "ISAC: Division 2 network status is OPERATIONAL. All systems online.", 
      sub: "SHD agents cleared for deployment. Report any anomalies to your nearest safe house.",
      label: "NETWORK STATUS",
      pulse: "OPERATIONAL"
    };
  } else if (overall === 'Maintenance') {
    return { 
      main: "ISAC ALERT: Scheduled maintenance in progress. Services may be temporarily unavailable.", 
      sub: "Expected completion within the maintenance window. Check official status for updates.",
      label: "MAINTENANCE",
      pulse: "DEGRADED"
    };
  } else if (overall === 'Problems') {
    return { 
      main: "ISAC WARNING: Network degradation detected. Some services may be impacted.", 
      sub: "Ubisoft engineers are investigating. Monitor official status page for updates.",
      label: "DEGRADED",
      pulse: "INVESTIGATING"
    };
  } else if (overall === 'Outage') {
    return { 
      main: "CRITICAL: Division 2 network outage detected. Connectivity may be affected.", 
      sub: "Emergency protocols activated. Check official status for restoration ETA.",
      label: "OUTAGE",
      pulse: "CRITICAL"
    };
  }
  return null;
}

// Build terminal items from all sources
async function buildTerminalItems() {
  const items = [];
  
  // 1. Add server status if available
  const statusMsg = getServerStatusMessage();
  if (statusMsg) {
    items.push({
      main: statusMsg.main,
      sub: statusMsg.sub,
      label: statusMsg.label,
      pulse: statusMsg.pulse,
      source: 'status',
      url: 'https://ubistatic-a.akamaihd.net/0115/tctd2/status.html'
    });
  }
  
  // 2. Add Ubisoft official news (from newsItems)
  const officialNews = newsItems.filter(item => item.label === 'Official Intel' || item.label === 'Latest Intel');
  if (officialNews.length > 0) {
    officialNews.slice(0, 3).forEach(news => {
      items.push({
        main: `UBISOFT: ${news.title}`,
        sub: `Official Division 2 update. Click for full details.`,
        label: "OFFICIAL INTEL",
        pulse: "NEWS",
        url: news.url,
        source: 'ubisoft'
      });
    });
  }
  
    // 3. Add Reddit community signals and feed items
  const feedItems = newsItems.filter(item => 
    item.label === 'Community Signal' || 
    item.label === 'Reddit Builds' ||
    item.label === 'Reddit Maintenance' ||
    item.label === 'r/thedivision' ||
    item.label === 'r/Division2' ||
    (item.url && item.url.includes('reddit.com'))
  );
  
  if (feedItems.length > 0) {
    feedItems.slice(0, 3).forEach(feed => {
      let title = feed.title;
      // Clean up the title
      title = title.replace(/^r\/\w+:\s*/, '');
      title = title.replace(/^Reddit Builds:\s*/, '');
      title = title.replace(/^Reddit Maintenance:\s*/, '');
      if (title.length > 80) title = title.slice(0, 77) + '...';
      
      items.push({
        main: `COMMUNITY: ${title}`,
        sub: `Discussion from the Division community. Tap to read more.`,
        label: feed.label || "COMMUNITY SIGNAL",
        pulse: "ACTIVE",
        url: feed.url,
        source: 'reddit'
      });
    });
  }
  
  // 4. Add featured event messages (fallback if other sources are empty)
  const fallbackMessages = [
    { main: "ISAC: Stretch Goals event ends in 48 hours. Secure your Lexington before it's gone.", sub: "Priority transmission from SHD Command. All agents report for final objectives.", label: "SHD ALERT", pulse: "EVENT" },
    { main: "URGENT: Escalation Tier 10 rewards boosted until weekly reset. Prototype drop rates increased.", sub: "Field reports indicate rogue activity in DZ East. Proceed with caution.", label: "ESCALATION", pulse: "ACTIVE" },
    { main: "New Exotic Caduceus available. Complete The Director Master Mission to unlock.", sub: "SHD tech division confirms weapon calibration success. Agent, check your inventory.", label: "EXOTIC ALERT", pulse: "NEW" },
    { main: "Vendor reset active. Check Cassie and Danny for DZ exclusives and named items.", sub: "Civilian network reports rare stock at safe houses. Move quickly.", label: "VENDOR ALERT", pulse: "WEEKLY" },
    { main: "Network status: All systems operational. SHD agents cleared for deployment.", sub: "ISAC standing by. Report any anomalies to your nearest safe house.", label: "SHD STATUS", pulse: "ONLINE" }
  ];
  
  // If we have no items from real sources, use fallbacks
  if (items.length === 0) {
    fallbackMessages.forEach(msg => {
      items.push({
        main: msg.main,
        sub: msg.sub,
        label: msg.label,
        pulse: msg.pulse,
        source: 'fallback'
      });
    });
  }
  
  return items;
}

async function refreshTerminalItems() {
  terminalItems = await buildTerminalItems();
  terminalIndex = 0;
  
  // Update the label and pulse badge
  if (terminalItems.length > 0) {
    updateTerminalDisplay(terminalItems[0]);
  }
}

function updateTerminalDisplay(item) {
  const mainElement = document.getElementById('terminal-message');
  const subElement = document.getElementById('terminal-subtext');
  const labelElement = document.getElementById('terminal-source-label');
  const pulseElement = document.getElementById('terminal-pulse-badge');
  
  if (!mainElement || !subElement) return;
  
  // Update label and pulse badge
  if (labelElement) labelElement.textContent = item.label || 'SHD ALERT';
  if (pulseElement) pulseElement.textContent = item.pulse || 'LIVE';
  
  // Update main message with fade effect
  mainElement.style.opacity = '0';
  setTimeout(() => {
    mainElement.textContent = item.main;
    mainElement.style.opacity = '1';
  }, 100);
  
  // Update subtext
  subElement.textContent = item.sub;
  
  // Make the terminal clickable to open source URL if available
  const terminal = document.getElementById('shd-terminal');
  if (terminal) {
    if (item.url) {
      terminal.style.cursor = 'pointer';
      terminal.onclick = () => {
        window.open(item.url, '_blank', 'noopener');
      };
    } else {
      terminal.style.cursor = 'default';
      terminal.onclick = null;
    }
  }
}

function rotateTerminalMessage() {
  if (terminalItems.length === 0) return;
  
  terminalIndex = (terminalIndex + 1) % terminalItems.length;
  updateTerminalDisplay(terminalItems[terminalIndex]);
}

function startTerminalBroadcast() {
  // Initial load
  refreshTerminalItems().then(() => {
    // Rotate every 12 seconds
    if (terminalInterval) clearInterval(terminalInterval);
    terminalInterval = setInterval(rotateTerminalMessage, 12000);
  });
}

// Also refresh terminal when news items change (if needed)
function refreshTerminal() {
  refreshTerminalItems();
}

/* ============================================================
   Google Forms Submission Handler
   ============================================================ */

let formSubmitted = false;

function markDivGamingFormStart(form) {
  const startedAt = form?.querySelector('[data-dg-started-at]');
  if (startedAt && !startedAt.value) {
    startedAt.value = String(Date.now());
  }
}

function isDivGamingBotSubmission(form) {
  if (!form) return true;

  const honeypot = form.querySelector('input[name="website"]');
  if (honeypot && honeypot.value.trim() !== '') {
    return true;
  }

  const startedAt = Number(form.querySelector('[data-dg-started-at]')?.value || 0);
  if (!startedAt || Date.now() - startedAt < 3000) {
    return true;
  }

  return false;
}

window.handleFormSubmit = async function(event) {
  event.preventDefault();

  const form = document.getElementById('submit-form');
  if (!form) return false;

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  const noteElement = document.getElementById('submit-note');

  if (isDivGamingBotSubmission(form)) {
    if (noteElement) noteElement.textContent = 'Submission blocked. Please wait a moment and try again.';
    return false;
  }

  if (!form.checkValidity()) {
    form.reportValidity();
    return false;
  }

  // Show loading state
  submitBtn.textContent = '📡 Transmitting to SHD...';
  submitBtn.disabled = true;
  if (noteElement) noteElement.textContent = 'Sending transmission to SHD Command...';

  const formData = new FormData(form);
  formData.delete('website');
  formData.delete('dg_started_at');

  try {
    await fetch(form.dataset.endpoint, {
      method: 'POST',
      mode: 'no-cors',
      body: formData
    });

    formSubmitted = true;

    // Hide form, show success
    form.style.display = 'none';
    const successDiv = document.getElementById('form-success');
    if (successDiv) successDiv.style.display = 'block';

    if (window.lucide) lucide.createIcons();
    form.reset();
    markDivGamingFormStart(form);

  } catch (error) {
    console.error('Submission error:', error);
    if (noteElement) noteElement.textContent = '⚠️ Transmission failed. Please try again.';
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    formSubmitted = false;
  }

  return false;
};

window.resetForm = function() {
  const form = document.getElementById('submit-form');
  const successDiv = document.getElementById('form-success');
  
  if (form) form.style.display = 'block';
  if (successDiv) successDiv.style.display = 'none';
  formSubmitted = false;
  if (form) markDivGamingFormStart(form);
  if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/* ── Init ── */
async function init() {
  setupNav();
  setupScrollRail();
  setupScrollSpy();
  setupScrollReveal();
  setupBuildControls();
  // setupSubmitForm(); // Removed - using Google Forms now
  setupMaskedEmail();
  markDivGamingFormStart(document.getElementById('submit-form'));
  setupVendorCountdown();
  setupPWA();
  setupResourceTabs();

  [resources, builds, intel, newsItems, serverStatus, featured] = await Promise.all([
    readJson('data/resources.json'),
    readJson('data/builds.json'),
    readJson('data/intel.json'),
    Promise.all([readJson('data/news.json').catch(() => []), readJson('data/feed.json').catch(() => [])]).then(([news, feed]) => [...feed, ...news]),
    readJson('data/server-status.json').catch(() => null),
    readJson('data/featured.json').catch(() => null)
  ]);
  
  renderStats();
  renderBackpackModuleCounts();
  renderResourceFilters();
  renderResources();
  renderBuildFilters();
  renderCommunitySpotlight();
  renderBuilds();
  renderIntel();
  renderServerStatus();
  startNewsTicker();
  
  // Start SHD Terminal broadcast with dynamic content
  await refreshTerminalItems();
  startTerminalBroadcast();
  
  // Render saved builds after builds are loaded
  setTimeout(() => {
    renderDesktopSavedBuilds();
  }, 500);
  
  setupGlobalSearch();
  setupModal();
}

init().catch((err) => {
  console.error(err);
  document.body.insertAdjacentHTML('afterbegin', `<div style="padding:12px;background:#5b120d;color:#fff;text-align:center">${err.message}</div>`);
});

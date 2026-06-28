/* ============================================================
   DivGaming.com — Mobile App Controller (Lucide Icons)
   Activates on screens < 768px
   ============================================================ */

(function() {
  // Check if we're on mobile - do this FIRST
  if (window.innerWidth > 768) {
    console.log('Desktop detected, mobile app not starting');
    return;
  }
  
  console.log('Mobile detected, initializing mobile experience');
  
  let currentPanel = 'home';
  let builds = [];
  let resources = [];
  let intel = [];
  let featured = null;
  let currentVideoCategory = 'Builds';
  let currentBuildTag = 'All';
  let currentPage = 1;
  const perPage = 10;
  let searchTimeout;
  let savedVotes = {};
  
  // Load saved votes from localStorage
  try {
    savedVotes = JSON.parse(localStorage.getItem('div2-local-saves') || '{}');
  } catch(e) {}
  
  // Add mobile class to body IMMEDIATELY
  document.body.classList.add('mobile-active');
  
  // Wait for DOM to be ready before hiding elements
  function hideDesktopElements() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('#nav-links');
    if (navToggle) navToggle.style.display = 'none';
    if (navLinks) navLinks.style.display = 'none';
    
    const heroActions = document.querySelector('.hero-actions');
    if (heroActions) heroActions.style.display = 'none';
  }
  
  // Helper functions
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }
  
  function extractVideoId(url = '') {
    try {
      const p = new URL(url);
      if (p.hostname.includes('youtu.be')) return p.pathname.slice(1);
      if (p.searchParams.get('v')) return p.searchParams.get('v');
    } catch {}
    return '';
  }
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
  return [...new Set([
    getVideoSection(video),
    video.contentType,
    video.section,
    video.subcategory,
    video.activity,
    video.format,
    ...(video.tags || []),
    ...(video.sourceTags || [])
  ].map((value) => String(value || '').trim()).filter(Boolean))];
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

function videoMetaLabel(video = {}) {
  return [...new Set([
    getVideoSection(video),
    getVideoSubcategory(video),
    ...(video.tags || [])
  ].filter(Boolean))].slice(0, 4);
}
  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return iso;
    }
  }
  
  function closeBottomSheet() {
    const sheet = document.getElementById('mobile-bottom-sheet');
    const overlay = document.getElementById('mobile-overlay');
    sheet?.classList.remove('open');
    overlay?.classList.remove('active');
    document.body.style.overflow = '';
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
  
  function getOfficialIcon(title = '') {
    const text = title.toLowerCase();
    if (text.includes('patch')) return 'file-text';
    if (text.includes('status') || text.includes('server')) return 'activity';
    if (text.includes('support')) return 'headphones';
    if (text.includes('twitter') || text.includes('x')) return 'twitter';
    if (text.includes('known')) return 'alert-triangle';
    return 'folder-open';
  }
  
  function getSavedBuilds() {
    const savedIds = Object.keys(savedVotes).filter(id => savedVotes[id] === 1);
    return builds.filter(b => savedIds.includes(b.id));
  }
  
  function openBottomSheet(build) {
    const sheet = document.getElementById('mobile-bottom-sheet');
    const content = document.getElementById('sheet-content');
    const videoId = build.videoId || extractVideoId(build.url);
    const saved = savedVotes[build.id] ? 'Saved' : 'Save';
    const tags = (build.tags || []).join(' · ');
    
    content.innerHTML = `
      <div style="position:relative; border-radius:16px; overflow:hidden; margin-bottom:16px;">
        <img src="https://i.ytimg.com/vi/${videoId}/hqdefault.jpg" style="width:100%; aspect-ratio:16/9; object-fit:cover;" />
        <a href="${build.url}" target="_blank" rel="noopener" style="position:absolute; bottom:12px; right:12px; background:rgba(0,0,0,0.7); backdrop-filter:blur(8px); padding:8px 14px; border-radius:30px; color:white; text-decoration:none; font-weight:700; display:flex; align-items:center; gap:6px;">
          <i data-lucide="play" style="width:14px; height:14px;"></i> Watch
        </a>
      </div>
      <h3 style="margin:0 0 8px;">${escapeHtml(build.title)}</h3>
      <div style="display:flex; gap:12px; margin-bottom:12px; font-size:0.8rem; color:var(--orange);">
        <span><i data-lucide="user" style="width:12px; height:12px; display:inline;"></i> ${escapeHtml(build.creator)}</span>
        <span><i data-lucide="calendar" style="width:12px; height:12px; display:inline;"></i> ${fmtDate(build.publishedAt)}</span>
      </div>
      ${tags ? `<div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:12px;">${tags.split('·').map(t => `<span style="background:rgba(255,107,0,0.15); padding:4px 10px; border-radius:20px; font-size:0.7rem;">${t.trim()}</span>`).join('')}</div>` : ''}
      <p style="color:var(--muted); margin-bottom:20px; line-height:1.6;">${escapeHtml(build.description || 'No description available.')}</p>
      <div style="display:flex; gap:12px; flex-wrap:wrap;">
        <button class="watch-btn" style="flex:1; background:linear-gradient(135deg, var(--orange), var(--orange-2)); border:none; border-radius:30px; padding:12px; color:#120d04; font-weight:900; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
          <i data-lucide="play" style="width:16px; height:16px;"></i> Watch on YouTube
        </button>
        <button class="save-btn" style="flex:1; background:rgba(255,255,255,0.05); border:1px solid rgba(255,107,0,0.3); border-radius:30px; padding:12px; color:${savedVotes[build.id] ? 'var(--orange)' : 'var(--text)'}; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
          <i data-lucide="star" style="width:16px; height:16px;"></i> ${saved}
        </button>
        <button class="share-btn" style="flex:1; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:30px; padding:12px; color:var(--muted); font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
          <i data-lucide="share-2" style="width:16px; height:16px;"></i> Share
        </button>
      </div>
    `;
    
    if (window.lucide) lucide.createIcons({ root: content });
    
    content.querySelector('.watch-btn')?.addEventListener('click', () => {
      window.open(build.url, '_blank');
    });
    
    content.querySelector('.save-btn')?.addEventListener('click', (e) => {
      const id = build.id;
      savedVotes[id] = savedVotes[id] ? 0 : 1;
      localStorage.setItem('div2-local-saves', JSON.stringify(savedVotes));
      openBottomSheet(build);
      renderMobileBuilds();
      renderMobileSaved();
    });
    
    content.querySelector('.share-btn')?.addEventListener('click', (e) => {
      const url = `${location.origin}${location.pathname}#build=${build.id}`;
      navigator.clipboard?.writeText(url);
      const btn = e.currentTarget;
      btn.innerHTML = '<i data-lucide="check" style="width:16px; height:16px;"></i> Copied!';
      if (window.lucide) lucide.createIcons({ root: btn });
      setTimeout(() => {
        btn.innerHTML = '<i data-lucide="share-2" style="width:16px; height:16px;"></i> Share';
        if (window.lucide) lucide.createIcons({ root: btn });
      }, 1500);
    });
    
    sheet.classList.add('open');
    document.getElementById('mobile-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  function setupMobileSearch() {
    const input = document.getElementById('mobile-search-input');
    const resultsDiv = document.getElementById('mobile-search-results');
    if (!input || !resultsDiv) return;
    
    input.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const query = input.value.trim().toLowerCase();
        if (query.length < 2) {
          resultsDiv.style.display = 'none';
          return;
        }
        
        const matches = builds.filter((b) => videoSearchText(b).includes(query)).slice(0, 12);
        
        if (matches.length === 0) {
          resultsDiv.innerHTML = `<div style="padding:20px; text-align:center; color:var(--muted);">No builds found for "${escapeHtml(query)}"</div>`;
        } else {
          resultsDiv.innerHTML = matches.map(b => `
            <div class="mobile-search-result" data-build-id="${b.id}">
              <div class="mobile-search-result-title">${escapeHtml(b.title)}</div>
              <div class="mobile-search-result-meta">
                ${escapeHtml(b.creator)} • ${fmtDate(b.publishedAt)}
                ${(b.tags || []).slice(0,2).map(t => `<span class="mobile-search-result-tag">${escapeHtml(t)}</span>`).join('')}
              </div>
            </div>
          `).join('');
          
          document.querySelectorAll('.mobile-search-result[data-build-id]').forEach(el => {
            el.addEventListener('click', () => {
              const build = builds.find(b => b.id === el.dataset.buildId);
              if (build) {
                openBottomSheet(build);
                resultsDiv.style.display = 'none';
                input.value = '';
              }
            });
          });
        }
        resultsDiv.style.display = 'block';
      }, 250);
    });
    
    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !resultsDiv.contains(e.target)) {
        resultsDiv.style.display = 'none';
      }
    });
  }
  
  // ========== RENDER FUNCTIONS ==========
  
  function renderMobileBuildFilters() {
  const container = document.getElementById('mobile-build-filters');
  if (!container) return;

    const categoryBuilds = currentVideoCategory === 'All'
    ? builds
    : builds.filter((b) => videoMatchesCategory(b, currentVideoCategory));

  const availableValues = new Set(categoryBuilds.flatMap((b) => getVideoFilterValues(b)));

  const hasValue = (tag) =>
    tag === 'All' ||
    [...availableValues].some((value) => value.toLowerCase() === tag.toLowerCase());

  const refineConfig = getRefineFilterConfig(currentVideoCategory);
  const tags = refineConfig.tags.filter(hasValue);

  container.innerHTML = `
    <div class="mobile-filter-stack">
      <div class="mobile-filter-group">
        <p class="mobile-filter-label">Intel Type</p>
        <div class="mobile-filter-row">
          ${VIDEO_CATEGORIES.map((category) => {
            const count = category === 'All'
              ? builds.length
              : builds.filter((b) => videoMatchesCategory(b, category)).length;

            if (category !== 'All' && count === 0) return '';

            return `
              <button
                class="mobile-filter-chip ${category === currentVideoCategory ? 'active' : ''}"
                data-mobile-video-category="${category}"
              >
                ${category}
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <div class="mobile-filter-group">
        <p class="mobile-filter-label">${refineConfig.label}</p>
        <div class="mobile-filter-row">
          ${tags.map((tag) => `
            <button
              class="mobile-filter-chip ${tag === currentBuildTag ? 'active' : ''}"
              data-filter-tag="${tag}"
            >
              ${tag}
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll('[data-mobile-video-category]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentVideoCategory = btn.dataset.mobileVideoCategory;
      currentBuildTag = 'All';
      currentPage = 1;
      renderMobileBuildFilters();
      renderMobileBuilds();
    });
  });

  document.querySelectorAll('[data-filter-tag]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentBuildTag = btn.dataset.filterTag;
      currentPage = 1;
      renderMobileBuildFilters();
      renderMobileBuilds();
    });
  });
}
  
  function renderMobileBuilds() {
    const container = document.getElementById('mobile-builds-container');
    if (!container) return;
    
    let filtered = builds.filter((b) => {
  return videoMatchesCategory(b, currentVideoCategory) && videoMatchesTag(b, currentBuildTag);
});
    
    filtered.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    
    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    currentPage = Math.min(currentPage, totalPages);
    const start = (currentPage - 1) * perPage;
    const pageBuilds = filtered.slice(start, start + perPage);
    
    const headlineLabel = currentVideoCategory === 'All' ? 'SHD Video Intel' : currentVideoCategory;

const headlineHtml = `
  <div class="mobile-builds-headline">
    <h3><i data-lucide="layers"></i> ${headlineLabel}</h3>
    <span>${filtered.length}</span>
  </div>
`;
    
    if (pageBuilds.length === 0) {
      container.innerHTML = headlineHtml + '<p style="text-align:center; padding:40px; color:var(--muted);">No videos match that filter.</p>';
      if (window.lucide) lucide.createIcons({ root: container });
      renderMobilePagination(totalPages);
      return;
    }
    
    const buildsHtml = pageBuilds.map(build => `
      <article class="build-card" data-build-id="${build.id}" style="cursor:pointer;">
        <div class="thumb">
          <img src="https://i.ytimg.com/vi/${build.videoId || extractVideoId(build.url)}/hqdefault.jpg" loading="lazy" />
        </div>
        <div class="build-content">
          <h3>${escapeHtml(build.title)}</h3>
          <div class="build-meta">
            <span class="build-meta-creator">${escapeHtml(build.creator)}</span>
            <span>${fmtDate(build.publishedAt)}</span>
          </div>
          <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">
            ${videoMetaLabel(build).map(tag => `<span style="background:rgba(255,107,0,0.12); padding:3px 8px; border-radius:16px; font-size:0.7rem;">${escapeHtml(tag)}</span>`).join('')}
          </div>
        </div>
        <div class="build-actions">
          <button class="share-btn" data-share-id="${build.id}" aria-label="Copy build link">
            <i data-lucide="link-2"></i>
          </button>
          <button class="vote ${savedVotes[build.id] ? 'voted' : ''}" data-vote-id="${build.id}" aria-label="Save build">
            <i data-lucide="star"></i>
          </button>
        </div>
      </article>
    `).join('');
    
    container.innerHTML = headlineHtml + buildsHtml;
    
    if (window.lucide) lucide.createIcons({ root: container });
    
    document.querySelectorAll('[data-build-id]').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('[data-vote-id]') || e.target.closest('[data-share-id]')) return;
        const id = card.dataset.buildId;
        const build = builds.find(b => b.id === id);
        if (build) openBottomSheet(build);
      });
    });
    
    document.querySelectorAll('[data-vote-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.voteId;
        savedVotes[id] = savedVotes[id] ? 0 : 1;
        localStorage.setItem('div2-local-saves', JSON.stringify(savedVotes));
        renderMobileBuilds();
        renderMobileSaved();
      });
    });
    
    document.querySelectorAll('[data-share-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.shareId;
        const url = `${location.origin}${location.pathname}#build=${id}`;
        navigator.clipboard?.writeText(url).then(() => {
          const icon = btn.querySelector('i');
          const originalIcon = icon.getAttribute('data-lucide');
          icon.setAttribute('data-lucide', 'check');
          if (window.lucide) lucide.createIcons({ root: btn });
          setTimeout(() => {
            icon.setAttribute('data-lucide', originalIcon);
            if (window.lucide) lucide.createIcons({ root: btn });
          }, 1500);
        });
      });
    });
    
    renderMobilePagination(totalPages);
  }
  
  function renderMobileSaved() {
    const container = document.getElementById('mobile-saved-container');
    if (!container) return;
    
    const savedBuilds = getSavedBuilds();
    
    if (savedBuilds.length === 0) {
      container.innerHTML = `
        <div class="empty-saved-state">
          <i data-lucide="star" style="width: 48px; height: 48px; color: var(--muted); margin-bottom: 16px;"></i>
          <p>No saved builds yet.</p>
          <p class="empty-saved-hint">Tap the star icon on any build to save it here.</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons({ root: container });
      return;
    }
    
    container.innerHTML = savedBuilds.map(build => `
      <article class="build-card saved-build-card" data-build-id="${build.id}" style="cursor:pointer;">
        <div class="thumb">
          <img src="https://i.ytimg.com/vi/${build.videoId || extractVideoId(build.url)}/hqdefault.jpg" loading="lazy" />
        </div>
        <div class="build-content">
          <h3>${escapeHtml(build.title)}</h3>
          <div class="build-meta">
            <span class="build-meta-creator">${escapeHtml(build.creator)}</span>
            <span>${fmtDate(build.publishedAt)}</span>
          </div>
          <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">
            ${(build.tags || []).slice(0,3).map(tag => `<span style="background:rgba(255,107,0,0.12); padding:3px 8px; border-radius:16px; font-size:0.7rem;">${escapeHtml(tag)}</span>`).join('')}
          </div>
        </div>
        <div class="build-actions saved-actions">
          <button class="share-btn" data-share-id="${build.id}" aria-label="Copy build link">
            <i data-lucide="link-2"></i>
          </button>
          <button class="vote voted" data-vote-id="${build.id}" aria-label="Remove saved build">
            <i data-lucide="star"></i>
          </button>
        </div>
      </article>
    `).join('');
    
    if (window.lucide) lucide.createIcons({ root: container });
    
    document.querySelectorAll('#mobile-saved-container .build-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('[data-vote-id]') || e.target.closest('[data-share-id]')) return;
        const id = card.dataset.buildId;
        const build = builds.find(b => b.id === id);
        if (build) openBottomSheet(build);
      });
    });
    
    document.querySelectorAll('#mobile-saved-container [data-vote-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.voteId;
        savedVotes[id] = 0;
        localStorage.setItem('div2-local-saves', JSON.stringify(savedVotes));
        renderMobileSaved();
        renderMobileBuilds();
      });
    });
    
    document.querySelectorAll('#mobile-saved-container [data-share-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.shareId;
        const url = `${location.origin}${location.pathname}#build=${id}`;
        navigator.clipboard?.writeText(url).then(() => {
          const icon = btn.querySelector('i');
          const originalIcon = icon.getAttribute('data-lucide');
          icon.setAttribute('data-lucide', 'check');
          if (window.lucide) lucide.createIcons({ root: btn });
          setTimeout(() => {
            icon.setAttribute('data-lucide', originalIcon);
            if (window.lucide) lucide.createIcons({ root: btn });
          }, 1500);
        });
      });
    });
  }
  
  function renderMobilePagination(totalPages) {
    const container = document.getElementById('mobile-pagination');
    if (!container) return;
    
    if (totalPages <= 1) {
      container.innerHTML = '';
      return;
    }
    
    let html = '';
    if (currentPage > 1) {
      html += `<button class="page-btn" data-page="${currentPage - 1}">‹ Prev</button>`;
    }
    
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        html += `<span class="page-ellipsis">…</span>`;
      }
    }
    
    if (currentPage < totalPages) {
      html += `<button class="page-btn" data-page="${currentPage + 1}">Next ›</button>`;
    }
    
    container.innerHTML = html;
    
    document.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        currentPage = parseInt(btn.dataset.page);
        renderMobileBuilds();
        const buildsPanel = document.getElementById('mobile-panel-builds');
        if (buildsPanel) buildsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }
  
  function renderMobileResources() {
    const container = document.getElementById('mobile-resources-container');
    if (!container) return;
    
    const communityTools = resources.slice(0, 6);
    const officialResources = intel.slice(0, 5);
    
    container.innerHTML = `
      <div class="backpack-section-header">
        <i data-lucide="wrench"></i>
        <h3>Community Tools</h3>
        <span>${communityTools.length}</span>
      </div>
      <div class="backpack-resource-grid">
        ${communityTools.map(r => `
          <div class="backpack-resource-card">
            <div class="backpack-resource-card-header">
              <div class="backpack-resource-icon">
                <i data-lucide="${getResourceIcon(r.category)}"></i>
              </div>
              <span class="backpack-resource-category">${escapeHtml(r.category)}</span>
            </div>
            <h4>${escapeHtml(r.title)}</h4>
            <p>${escapeHtml(r.description)}</p>
            <a href="${r.url}" target="_blank" rel="noopener" class="backpack-resource-link">
              Open resource <i data-lucide="arrow-right"></i>
            </a>
          </div>
        `).join('')}
      </div>
      
      <div class="backpack-section-header">
        <i data-lucide="satellite-dish"></i>
        <h3>Official Resources</h3>
        <span>${officialResources.length}</span>
      </div>
      <div class="backpack-official-list">
        ${officialResources.map(i => `
          <a href="${i.url}" target="_blank" rel="noopener" class="backpack-official-item">
            <div class="backpack-official-icon">
              <i data-lucide="${getOfficialIcon(i.title)}"></i>
            </div>
            <div class="backpack-official-content">
              <strong>${escapeHtml(i.title)}</strong>
              <p>${escapeHtml(i.description)}</p>
            </div>
            <div class="backpack-official-arrow">
              <i data-lucide="arrow-right"></i>
            </div>
          </a>
        `).join('')}
      </div>
    `;
    
    if (window.lucide) lucide.createIcons({ root: container });
  }
  
  function renderMobileSpotlight() {
    const container = document.getElementById('mobile-spotlight-container');
    if (!container || !featured) return;
    
    const build = builds.find(b => 
      (featured.buildOfTheWeek?.videoId && b.videoId === featured.buildOfTheWeek.videoId) ||
      (featured.buildOfTheWeek?.id && b.id === featured.buildOfTheWeek.id)
    );
    
    const creator = featured.creatorOfTheWeek || {};
    
    container.innerHTML = `
      <div class="spotlight-card">
        <div class="spotlight-badge">
          <i data-lucide="crown"></i> Build of the Week
        </div>
        ${build ? `
          <div class="spotlight-thumb">
            <img src="https://i.ytimg.com/vi/${build.videoId}/hqdefault.jpg" />
          </div>
          <h3>${escapeHtml(build.title)}</h3>
          <p class="creator-name">${escapeHtml(build.creator)}</p>
          <button class="btn ghost" data-spotlight-build>
            <i data-lucide="play"></i> Watch Build
          </button>
        ` : '<p class="empty-state">No build selected this week.</p>'}
      </div>
      
      <div class="spotlight-card">
        <div class="spotlight-badge">
          <i data-lucide="crown"></i> Creator of the Week
        </div>
        <div class="creator-row">
          ${creator.avatar ? `<img src="${creator.avatar}" class="creator-avatar">` : `<div class="creator-avatar-fallback">${(creator.name || 'C')[0]}</div>`}
          <div class="creator-info">
            <h3>${escapeHtml(creator.name || 'Community Creator')}</h3>
            ${creator.handle ? `<p class="creator-handle">${escapeHtml(creator.handle)}</p>` : ''}
          </div>
        </div>
        <p class="creator-description">${escapeHtml(creator.description || 'Recognized for contributions to the Division 2 community.')}</p>
        ${creator.tags?.length ? `
          <div class="creator-tags">
            ${creator.tags.map(t => `<span>${escapeHtml(t)}</span>`).join('')}
          </div>
        ` : ''}
        ${creator.links?.length ? `
  <div class="spotlight-social-panel spotlight-social-panel-compact">
    <p class="spotlight-social-heading">Support ${escapeHtml(creator.name || 'Creator')}</p>
    <div class="spotlight-social-grid">
      ${creator.links.map(link => `
        <a
          href="${link.url}"
          target="_blank"
          rel="noopener"
          class="spotlight-social-link"
          aria-label="${escapeHtml(link.label || link.platform || 'Creator link')}"
        >
          <img
            src="assets/img/socials/${escapeHtml(link.platform || 'youtube')}.png"
            alt=""
            aria-hidden="true"
            loading="lazy"
          />
          <span>${escapeHtml(link.label || link.platform || 'Link')}</span>
        </a>
      `).join('')}
    </div>
  </div>
` : ''}
      </div>
    `;
    
    if (window.lucide) lucide.createIcons({ root: container });
    
    document.querySelector('[data-spotlight-build]')?.addEventListener('click', () => {
      if (build) openBottomSheet(build);
    });
  }
  
  // ========== SWITCH PANEL ==========
  
  function switchPanel(panel) {
    currentPanel = panel;
    
    document.querySelectorAll('.mobile-nav-item').forEach(btn => {
      if (btn.dataset.panel === panel) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    if (panel === 'home') {
      document.querySelectorAll('.mobile-panel').forEach(p => {
        p.classList.remove('active');
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    document.querySelectorAll('.mobile-panel').forEach(p => {
      if (p.id === `mobile-panel-${panel}`) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });
    
    if (panel === 'builds') {
      renderMobileBuildFilters();
      renderMobileBuilds();
    }
    if (panel === 'saved') {
      renderMobileSaved();
    }
    if (panel === 'backpack') renderMobileResources();
    if (panel === 'spotlight') renderMobileSpotlight();
    
    const activePanel = document.getElementById(`mobile-panel-${panel}`);
    if (activePanel) {
      activePanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  
  // ========== CREATE UI ELEMENTS ==========
  
  function createMobileNav() {
    const nav = document.createElement('div');
    nav.className = 'mobile-bottom-nav';
    nav.innerHTML = `
      <button class="mobile-nav-item" data-panel="home">
        <i data-lucide="home"></i>
        <span>Home</span>
      </button>
      <button class="mobile-nav-item" data-panel="builds">
        <i data-lucide="layers"></i>
        <span>Builds</span>
      </button>
      <button class="mobile-nav-item" data-panel="saved">
        <i data-lucide="star"></i>
        <span>Saved</span>
      </button>
      <button class="mobile-nav-item" data-panel="backpack">
        <i data-lucide="backpack"></i>
        <span>Backpack</span>
      </button>
      <button class="mobile-nav-item" data-panel="spotlight">
        <i data-lucide="crown"></i>
        <span>Spotlight</span>
      </button>
      <button class="mobile-nav-item" data-panel="submit">
        <i data-lucide="send"></i>
        <span>Submit</span>
      </button>
    `;
    document.body.appendChild(nav);
    
    if (window.lucide) lucide.createIcons({ root: nav });
    
    nav.addEventListener('click', (e) => {
      const btn = e.target.closest('.mobile-nav-item');
      if (!btn) return;
      e.preventDefault();
      const panel = btn.dataset.panel;
      if (panel) switchPanel(panel);
    });
  }
  
  function createMobileSearch() {
    // Create wrapper that contains both the search input AND results separately
    const wrapper = document.createElement('div');
    wrapper.className = 'mobile-search-wrapper';
    wrapper.id = 'mobile-search-wrapper';
    wrapper.style.width = '100%';
    
    // Search input container (icons stay here, fixed position)
    const searchContainer = document.createElement('div');
    searchContainer.className = 'mobile-search-container';
    searchContainer.style.position = 'relative';
    searchContainer.style.width = '100%';
    searchContainer.innerHTML = `
      <i data-lucide="search" class="search-icon-left"></i>
      <input type="search" class="mobile-search-input" id="mobile-search-input" placeholder="Search builds, guides, tips, creators..." />
      <div class="search-icon-right" id="mobile-search-submit">
        <i data-lucide="arrow-right"></i>
      </div>
    `;
    
    // Results container - completely separate, won't affect icon positioning
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'mobile-search-results';
    resultsContainer.id = 'mobile-search-results';
    resultsContainer.style.display = 'none';
    
    wrapper.appendChild(searchContainer);
    wrapper.appendChild(resultsContainer);
    
    if (window.lucide) lucide.createIcons({ root: wrapper });
    
    setTimeout(() => {
      const submitBtn = document.getElementById('mobile-search-submit');
      const searchInput = document.getElementById('mobile-search-input');
      if (submitBtn && searchInput) {
        submitBtn.addEventListener('click', () => {
          const event = new Event('input', { bubbles: true });
          searchInput.dispatchEvent(event);
        });
      }
    }, 0);
    
    setTimeout(() => setupMobileSearch(), 0);
    return wrapper;
  }
  
  function createMobileOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    overlay.id = 'mobile-overlay';
    overlay.addEventListener('click', closeBottomSheet);
    document.body.appendChild(overlay);
  }
  
  function createBottomSheet() {
    const sheet = document.createElement('div');
    sheet.className = 'mobile-bottom-sheet';
    sheet.id = 'mobile-bottom-sheet';
    sheet.innerHTML = `
      <div class="mobile-bottom-sheet-header">
        <span style="font-weight:700;">Build Details</span>
        <button class="mobile-bottom-sheet-close" id="sheet-close" type="button" aria-label="Close panel">
          <i data-lucide="x" style="width:18px; height:18px;"></i>
        </button>
      </div>
      <div class="mobile-bottom-sheet-content" id="sheet-content"></div>
    `;
    document.body.appendChild(sheet);
    if (window.lucide) lucide.createIcons({ root: sheet });
    document.getElementById('sheet-close')?.addEventListener('click', closeBottomSheet);
  }
  
  function createMobilePanels() {
    const main = document.querySelector('main');
    if (!main) return;
    
    const originalSections = main.querySelectorAll('.section');
    originalSections.forEach(section => {
      section.style.display = 'none';
    });
    
    const toolsSection = document.getElementById('tools');
    const buildsSection = document.getElementById('builds');
    const submitSection = document.getElementById('submit');
    if (toolsSection) toolsSection.style.display = 'none';
    if (buildsSection) buildsSection.style.display = 'none';
    if (submitSection) submitSection.style.display = 'none';
    
    const panelContainer = document.createElement('div');
    panelContainer.id = 'mobile-panel-container';
    
    const buildsPanel = document.createElement('div');
    buildsPanel.id = 'mobile-panel-builds';
    buildsPanel.className = 'mobile-panel';
    buildsPanel.innerHTML = `
      <div class="shell">
        <div class="section-header">
          <i data-lucide="layers"></i> Build Intel
        </div>
        <p class="section-description">Find builds first, then browse guides, tips, news, and field intel.</p>
        <div id="mobile-search-wrapper"></div>
        <div class="mobile-filters" id="mobile-build-filters"></div>
        <div id="mobile-builds-container"></div>
        <div id="mobile-pagination" class="pagination"></div>
      </div>
    `;
    
    const savedPanel = document.createElement('div');
    savedPanel.id = 'mobile-panel-saved';
    savedPanel.className = 'mobile-panel';
    savedPanel.innerHTML = `
      <div class="shell">
        <div class="section-header">
          <i data-lucide="star"></i> Saved Builds
        </div>
        <p class="section-description">Builds you've starred. Saved to your device.</p>
        <div id="mobile-saved-container"></div>
      </div>
    `;
    
    const backpackPanel = document.createElement('div');
    backpackPanel.id = 'mobile-panel-backpack';
    backpackPanel.className = 'mobile-panel';
    backpackPanel.innerHTML = `
      <div class="shell">
        <div class="section-header">
          <i data-lucide="backpack"></i> Agent Backpack
        </div>
        <p class="section-description">Community tools, official resources, and field guides.</p>
        <div id="mobile-resources-container"></div>
      </div>
    `;
    
    const spotlightPanel = document.createElement('div');
    spotlightPanel.id = 'mobile-panel-spotlight';
    spotlightPanel.className = 'mobile-panel';
    spotlightPanel.innerHTML = `
      <div class="shell">
        <div class="section-header">
          <i data-lucide="crown"></i> Network Spotlight
        </div>
        <p class="section-description">Featured builds and creators selected by the community.</p>
        <div id="mobile-spotlight-container"></div>
      </div>
    `;
    
    const submitPanel = document.createElement('div');
submitPanel.id = 'mobile-panel-submit';
submitPanel.className = 'mobile-panel';
submitPanel.innerHTML = `
  <div class="shell">
    <div class="section-header">
      <i data-lucide="send"></i> Field Submission
    </div>

    <p class="section-description">
      Share a creator, build, tool, guide, spreadsheet, community project, or resource with fellow agents.
    </p>

    <div class="submit-card" style="padding:24px;">
      <form
        id="mobile-submit-form"
        action="#"
        data-endpoint="https://docs.google.com/forms/d/e/1FAIpQLSccnNcB0cWZ_GI90L8twXg3pQ6S7qrWwNr8dl1y3OL0SMfEjA/formResponse"
        method="POST"
      >
        <div class="dg-honeypot" aria-hidden="true" style="position:absolute; left:-10000px; top:auto; width:1px; height:1px; overflow:hidden;">
          <label>Leave this field empty
            <input type="text" name="website" tabindex="-1" autocomplete="off" />
          </label>
        </div>
        <input type="hidden" name="dg_started_at" value="" data-dg-started-at />

        <label>Submission Type
          <select name="entry.361995745" required>
            <option value="Build Video">Build Video</option>
            <option value="Tool / Resource">Tool / Resource</option>
            <option value="Guide / Spreadsheet">Guide / Spreadsheet</option>
            <option value="Creator Channel">Creator Channel</option>
            <option value="Other Intel">Other Intel</option>
          </select>
        </label>

        <label>Creator or Resource Name
          <input name="entry.423443472" required placeholder="Example: GCROCK, Vendor Reset Tool..." />
        </label>

        <label>Link
          <input name="entry.628106485" required type="url" placeholder="https://..." />
        </label>

        <label>Category
          <input name="entry.346745483" placeholder="PvE, PvP, vendor, build tool, guide..." />
        </label>

        <label>Notes
          <textarea name="entry.582344186" rows="4" placeholder="Tell us why this should be added to DivGaming."></textarea>
        </label>

        <button class="btn primary" type="submit">Transmit Intel to ISAC</button>
        <p class="form-note" id="mobile-submit-note">Your submission will be reviewed before being dispatched to agents in the field.</p>
      </form>

      <div
        id="mobile-form-success"
        style="display:none; text-align:center; padding:32px 20px; background:linear-gradient(135deg, rgba(117,240,160,0.1), rgba(16,21,20,0.9)); border-radius:20px; border:1px solid rgba(117,240,160,0.3);"
      >
        <i data-lucide="check-circle" style="width:44px; height:44px; color:#75f0a0; margin-bottom:16px;"></i>
        <h3>Submission Received, Agent!</h3>
        <p>Thank you for contributing to the SHD Network. Your intel has been successfully transmitted for review and will be dispatched if cleared for the field.</p>
        <button class="btn ghost" id="mobile-submit-another" type="button">Submit Another →</button>
      </div>
    </div>
  </div>
`;
    
    panelContainer.appendChild(buildsPanel);
    panelContainer.appendChild(savedPanel);
    panelContainer.appendChild(backpackPanel);
    panelContainer.appendChild(spotlightPanel);
    panelContainer.appendChild(submitPanel);
    main.appendChild(panelContainer);
    
    if (window.lucide) lucide.createIcons({ root: panelContainer });
    
    const mobileForm = document.getElementById('mobile-submit-form');

if (mobileForm) {
  const startedAt = mobileForm.querySelector('[data-dg-started-at]');
  if (startedAt) startedAt.value = String(Date.now());

  mobileForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = mobileForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    const noteElement = document.getElementById('mobile-submit-note');
    const successDiv = document.getElementById('mobile-form-success');

    const honeypot = mobileForm.querySelector('input[name="website"]');
    const startedAt = Number(mobileForm.querySelector('[data-dg-started-at]')?.value || 0);
    if ((honeypot && honeypot.value.trim() !== '') || !startedAt || Date.now() - startedAt < 3000) {
      if (noteElement) {
        noteElement.textContent = 'Submission blocked. Please wait a moment and try again.';
      }
      return;
    }

    if (!mobileForm.checkValidity()) {
      mobileForm.reportValidity();
      return;
    }

    submitBtn.textContent = '📡 Transmitting to SHD...';
    submitBtn.disabled = true;

    if (noteElement) {
      noteElement.textContent = 'Sending transmission to SHD Command...';
    }

    const formData = new FormData(mobileForm);
    formData.delete('website');
    formData.delete('dg_started_at');

    try {
      await fetch(mobileForm.dataset.endpoint, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
      });

      mobileForm.style.display = 'none';

      if (successDiv) {
        successDiv.style.display = 'block';
      }

      mobileForm.reset();
      const startedAt = mobileForm.querySelector('[data-dg-started-at]');
      if (startedAt) startedAt.value = String(Date.now());

      if (window.lucide) {
        lucide.createIcons();
      }
    } catch (error) {
      console.error('Mobile submission error:', error);

      if (noteElement) {
        noteElement.textContent = '⚠️ Transmission failed. Please try again.';
      }

      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}

const mobileSubmitAnother = document.getElementById('mobile-submit-another');

if (mobileSubmitAnother) {
  mobileSubmitAnother.addEventListener('click', () => {
    const mobileForm = document.getElementById('mobile-submit-form');
    const successDiv = document.getElementById('mobile-form-success');
    const noteElement = document.getElementById('mobile-submit-note');
    const submitBtn = mobileForm?.querySelector('button[type="submit"]');

    if (mobileForm) {
      mobileForm.style.display = 'block';
      mobileForm.reset();
      const startedAt = mobileForm.querySelector('[data-dg-started-at]');
      if (startedAt) startedAt.value = String(Date.now());
    }

    if (successDiv) {
      successDiv.style.display = 'none';
    }

    if (noteElement) {
      noteElement.textContent = 'Your submission will be reviewed by DivGaming command.';
    }

    if (submitBtn) {
      submitBtn.textContent = 'Transmit Intel To ISAC';
      submitBtn.disabled = false;
    }

    mobileForm?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}
  }
  
  // ========== INITIALIZATION ==========
  
  async function init() {
    try {
      console.log('Fetching mobile data...');
      
      const [buildsData, resourcesData, intelData, featuredData] = await Promise.all([
        fetch('data/builds.json').then(r => r.json()).catch(() => []),
        fetch('data/resources.json').then(r => r.json()).catch(() => []),
        fetch('data/intel.json').then(r => r.json()).catch(() => []),
        fetch('data/featured.json').then(r => r.json()).catch(() => null)
      ]);
      
      builds = buildsData;
      resources = resourcesData;
      intel = intelData;
      featured = featuredData;
      
      console.log(`Loaded ${builds.length} builds, ${resources.length} resources, ${intel.length} intel items`);
      
      hideDesktopElements();
      
      createMobileNav();
      createMobileOverlay();
      createBottomSheet();
      createMobilePanels();
      
      // Note: We now use mobile-search-wrapper, not mobile-search-container
      const searchWrapper = document.getElementById('mobile-search-wrapper');
      if (searchWrapper) {
        const searchElement = createMobileSearch();
        searchWrapper.appendChild(searchElement);
      }
      
      if (window.lucide) lucide.createIcons();
      
      setTimeout(() => {
        const supportTrigger = document.getElementById('mobile-support-trigger');
        const supportSheet = document.getElementById('mobile-support-sheet');
        const supportOverlay = document.getElementById('mobile-support-overlay');
        const supportClose = document.getElementById('mobile-support-close');
        
        if (supportTrigger) {
          const openSheet = () => {
            supportSheet?.classList.add('open');
            supportOverlay?.classList.add('active');
            document.body.style.overflow = 'hidden';
          };
          
          const closeSheet = () => {
            supportSheet?.classList.remove('open');
            supportOverlay?.classList.remove('active');
            document.body.style.overflow = '';
          };
          
          supportTrigger.addEventListener('click', openSheet);
          if (supportClose) supportClose.addEventListener('click', closeSheet);
          if (supportOverlay) supportOverlay.addEventListener('click', closeSheet);
        }
      }, 100);
      
      const footerSupportCard = document.querySelector('.support-card');
      if (footerSupportCard) {
        footerSupportCard.style.display = 'none';
      }
      
      console.log('DivGaming Mobile ready');
    } catch (err) {
      console.error('Mobile init error:', err);
    }
  }
  
  init();
})();

export type BuildVideo = {
  id?: string;
  videoId?: string;
  title?: string;
  creator?: string;
  channelId?: string;
  url?: string;
  publishedAt?: string;
  views?: number;
  likes?: number;
  comments?: number;
  description?: string;
  tags?: string[];
  sourceTags?: string[];
  section?: string;
  subcategory?: string;
  contentType?: string;
  activity?: string;
  format?: string;
};

export type BuildCategoryKey = 'all' | 'striker' | 'pve' | 'solo' | 'pvp';

export type BuildCategoryConfig = {
  key: BuildCategoryKey;
  title: string;
  eyebrow: string;
  description: string;
  canonical: string;
  emptyMessage: string;
};

export const buildCategories: BuildCategoryConfig[] = [
  {
    key: 'all',
    title: 'Division 2 Builds',
    eyebrow: 'Build Library',
    description:
      'Browse Division 2 build videos from community creators, organized for fast discovery and routed to YouTube so creators receive the direct visit.',
    canonical: '/division-2/builds/',
    emptyMessage: 'No build videos were found in data/builds.json yet.'
  },
  {
    key: 'striker',
    title: 'Striker Builds',
    eyebrow: 'High RPM Damage',
    description:
      'Find Striker-focused Division 2 builds, including DPS, solo, PvE, and endgame variants from community creators.',
    canonical: '/division-2/builds/striker/',
    emptyMessage: 'No Striker build videos were found yet.'
  },
  {
    key: 'pve',
    title: 'PvE Builds',
    eyebrow: 'Missions, Control Points, Open World',
    description:
      'Find PvE-focused Division 2 builds for missions, farming, open-world activities, Countdown, Incursion prep, and general endgame play.',
    canonical: '/division-2/builds/pve/',
    emptyMessage: 'No PvE build videos were found yet.'
  },
  {
    key: 'solo',
    title: 'Solo Builds',
    eyebrow: 'Solo Agent Friendly',
    description:
      'Find solo-friendly Division 2 builds for survivability, damage, farming, open-world control, and independent progression.',
    canonical: '/division-2/builds/solo/',
    emptyMessage: 'No solo build videos were found yet.'
  },
  {
    key: 'pvp',
    title: 'PvP Builds',
    eyebrow: 'Conflict and Dark Zone',
    description:
      'Find PvP-focused Division 2 builds for Conflict, Dark Zone, survivability, burst damage, armor regen, and player-versus-player setups.',
    canonical: '/division-2/builds/pvp/',
    emptyMessage: 'No PvP build videos were found yet.'
  }
];

export function normalizeBuilds(data: unknown): BuildVideo[] {
  if (Array.isArray(data)) return data as BuildVideo[];

  if (data && typeof data === 'object') {
    const value = data as Record<string, unknown>;

    if (Array.isArray(value.builds)) return value.builds as BuildVideo[];
    if (Array.isArray(value.videos)) return value.videos as BuildVideo[];
    if (Array.isArray(value.items)) return value.items as BuildVideo[];
  }

  return [];
}

export function slugify(value = '', fallback = 'item'): string {
  const slug = String(value || fallback)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90)
    .replace(/-+$/g, '');

  return slug || fallback;
}

export function videoSlug(video: BuildVideo): string {
  const title = slugify(video.title || 'division-2-video', 'division-2-video');
  const id = slugify(video.id || video.videoId || '', '');

  return id ? `${title}-${id}` : title;
}

export function videoPath(video: BuildVideo): string {
  return `/division-2/videos/${videoSlug(video)}/`;
}

export function youtubeWatchUrl(video: BuildVideo): string {
  if (video.url) return video.url;

  if (video.videoId) {
    return `https://www.youtube.com/watch?v=${encodeURIComponent(video.videoId)}`;
  }

  return 'https://www.youtube.com/';
}

export function youtubeThumbnail(video: BuildVideo): string {
  if (!video.videoId) return '/assets/img/divgaming-og.svg';
  return `https://i.ytimg.com/vi/${encodeURIComponent(video.videoId)}/maxresdefault.jpg`;
}

export function youtubeThumbnailFallback(video: BuildVideo): string {
  if (!video.videoId) return '/assets/img/divgaming-og.svg';
  return `https://i.ytimg.com/vi/${encodeURIComponent(video.videoId)}/sddefault.jpg`;
}

export function youtubeThumbnailFinalFallback(video: BuildVideo): string {
  if (!video.videoId) return '/assets/img/divgaming-og.svg';
  return `https://i.ytimg.com/vi/${encodeURIComponent(video.videoId)}/hqdefault.jpg`;
}

export function videoDescription(video: BuildVideo): string {
  const description = video.description?.trim();

  if (description) {
    return description.length > 220
      ? `${description.slice(0, 217).trim()}...`
      : description;
  }

  return `Watch ${video.title || 'this Division 2 video'} on the creator's YouTube page via DivGaming.`;
}

export function videoCategory(video: BuildVideo): string {
  const section = video.section || video.contentType || video.subcategory || 'Builds';
  return String(section || 'Builds');
}

export function videoTags(video: BuildVideo): string[] {
  return [
    ...(video.tags || []),
    ...(video.sourceTags || []),
    video.section,
    video.subcategory,
    video.activity,
    video.contentType,
    video.format
  ]
    .filter(Boolean)
    .map((tag) => String(tag));
}

export function videoSearchText(video: BuildVideo): string {
  return [
    video.title,
    video.creator,
    video.description,
    video.section,
    video.subcategory,
    video.contentType,
    video.activity,
    video.format,
    ...(video.tags || []),
    ...(video.sourceTags || [])
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function isBuildVideo(video: BuildVideo): boolean {
  const text = videoSearchText(video);

  return [
    'build',
    'striker',
    'pve',
    'solo',
    'pvp',
    'dps',
    'tank',
    'skill',
    'healer',
    'dark zone',
    'conflict',
    'countdown',
    'incursion',
    'legendary',
    'loadout'
  ].some((term) => text.includes(term));
}

export function matchesBuildCategory(video: BuildVideo, key: BuildCategoryKey): boolean {
  const text = videoSearchText(video);

  if (key === 'all') return isBuildVideo(video);

  if (key === 'striker') {
    return text.includes('striker') || text.includes('striker’s') || text.includes("striker's");
  }

  if (key === 'pve') {
    return (
      text.includes('pve') ||
      text.includes('legendary') ||
      text.includes('heroic') ||
      text.includes('mission') ||
      text.includes('countdown') ||
      text.includes('incursion') ||
      text.includes('raid') ||
      text.includes('open world') ||
      text.includes('control point') ||
      text.includes('farming') ||
      text.includes('farm')
    ) && !text.includes('pvp only');
  }

  if (key === 'solo') {
    return (
      text.includes('solo') ||
      text.includes('soloable') ||
      text.includes('solo player') ||
      text.includes('solo agent')
    );
  }

  if (key === 'pvp') {
    return (
      text.includes('pvp') ||
      text.includes('dark zone') ||
      text.includes('dz ') ||
      text.includes('conflict') ||
      text.includes('rogue') ||
      text.includes('player versus player')
    );
  }

  return false;
}

export function getBuildCategory(key: BuildCategoryKey): BuildCategoryConfig {
  return buildCategories.find((category) => category.key === key) || buildCategories[0];
}

export function getBuildVideos(data: unknown, key: BuildCategoryKey, limit = 72): BuildVideo[] {
  return normalizeBuilds(data)
    .filter((video) => video.title && (video.id || video.videoId))
    .filter((video) => matchesBuildCategory(video, key))
    .sort((a, b) => {
      const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return bDate - aDate;
    })
    .slice(0, limit);
}

export function formatDate(value?: string): string {
  if (!value) return '';

  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(value));
  } catch {
    return '';
  }
}

export function formatNumber(value?: number): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '';

  return new Intl.NumberFormat('en-US', {
    notation: value > 9999 ? 'compact' : 'standard',
    maximumFractionDigits: 1
  }).format(value);
}

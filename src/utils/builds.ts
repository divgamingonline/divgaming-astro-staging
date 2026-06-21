export type RawBuild = Record<string, any>;

export type BuildVideo = {
  id: string;
  title: string;
  creator: string;
  url: string;
  videoId: string;
  date?: string;
  views?: number;
  likes?: number;
  thumbnail?: string;
  description?: string;
  category?: string;
  tags: string[];
  buildTags: string[];
  source?: RawBuild;
};

export type BuildCategoryKey = 'all' | 'striker' | 'pve' | 'solo' | 'pvp';

export type BuildCategory = {
  key: BuildCategoryKey;
  label: string;
  description: string;
  canonical: string;
};

export type DiscoveryFilter = {
  label: string;
  value: string;
};

export const BUILD_CATEGORIES: Record<BuildCategoryKey, BuildCategory> = {
  all: {
    key: 'all',
    label: 'All Builds',
    description: 'Browse every build video in the DivGaming staging build library.',
    canonical: '/division-2/builds/'
  },
  striker: {
    key: 'striker',
    label: 'Striker Builds',
    description: 'Creator build videos focused on Striker setups, damage stacking, and aggressive endgame play.',
    canonical: '/division-2/builds/striker/'
  },
  pve: {
    key: 'pve',
    label: 'PvE Builds',
    description: 'Division 2 PvE builds for missions, open world, Countdown, raids, incursions, and endgame farming.',
    canonical: '/division-2/builds/pve/'
  },
  solo: {
    key: 'solo',
    label: 'Solo Builds',
    description: 'Solo-friendly Division 2 builds built around survivability, consistency, and self-reliant damage.',
    canonical: '/division-2/builds/solo/'
  },
  pvp: {
    key: 'pvp',
    label: 'PvP Builds',
    description: 'PvP and Dark Zone build videos for agents who want to pressure, survive, and counter other players.',
    canonical: '/division-2/builds/pvp/'
  }
};

export function normalizeBuilds(data: unknown): BuildVideo[] {
  const rawItems = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && Array.isArray((data as any).items)
      ? (data as any).items
      : data && typeof data === 'object' && Array.isArray((data as any).builds)
        ? (data as any).builds
        : [];

  return rawItems
    .map((item: RawBuild, index: number) => normalizeBuild(item, index))
    .filter((video): video is BuildVideo => Boolean(video));
}

export function normalizeBuild(item: RawBuild, index: number): BuildVideo | null {
  const title = String(item.title || item.name || item.videoTitle || '').trim();
  const url = String(item.url || item.videoUrl || item.youtubeUrl || item.link || '').trim();
  const videoId = String(item.videoId || item.youtubeId || extractYouTubeId(url) || '').trim();

  if (!title && !url && !videoId) return null;

  const creator = String(
    item.creator ||
    item.channel ||
    item.channelTitle ||
    item.author ||
    item.sourceCreator ||
    'Unknown Creator'
  ).trim();

  const tags = normalizeTags(item.tags);
  const buildTags = normalizeTags([
    item.category,
    item.buildCategory,
    item.activity,
    item.role,
    item.playstyle,
    item.specialization,
    item.weaponType,
    ...(Array.isArray(item.buildTags) ? item.buildTags : []),
    ...(Array.isArray(item.categories) ? item.categories : [])
  ]);

  const fallbackId = videoId || slugToken(`${title}-${creator}-${index}`);

  return {
    id: String(item.id || fallbackId),
    title: title || 'Untitled Build Video',
    creator,
    url: youtubeWatchUrl({ videoId, url }),
    videoId,
    date: item.publishedAt || item.date || item.createdAt || item.updatedAt,
    views: numberValue(item.views || item.viewCount),
    likes: numberValue(item.likes || item.likeCount),
    thumbnail: item.thumbnail || item.thumbnailUrl,
    description: item.description || item.summary || item.notes || '',
    category: String(item.category || item.buildCategory || item.activity || '').trim(),
    tags,
    buildTags,
    source: item
  };
}

export function normalizeTags(input: unknown): string[] {
  const values = Array.isArray(input) ? input : [input];

  return values
    .flatMap((value) => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      return String(value).split(/[,|]/g);
    })
    .map((value) => String(value).trim())
    .filter(Boolean)
    .filter((value, index, array) => array.findIndex((candidate) => candidate.toLowerCase() === value.toLowerCase()) === index);
}

export function numberValue(input: unknown): number | undefined {
  if (input === null || input === undefined || input === '') return undefined;
  const value = Number(String(input).replace(/,/g, ''));
  return Number.isFinite(value) ? value : undefined;
}

export function extractYouTubeId(url: string): string {
  if (!url) return '';

  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/i,
    /youtu\.be\/([^?&]+)/i,
    /youtube\.com\/shorts\/([^?&]+)/i,
    /youtube\.com\/embed\/([^?&]+)/i
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return '';
}

export function youtubeWatchUrl(video: Pick<BuildVideo, 'videoId' | 'url'> | { videoId?: string; url?: string }): string {
  if (video.videoId) return `https://www.youtube.com/watch?v=${video.videoId}`;
  return video.url || '#';
}

export function youtubeThumbnail(video: Pick<BuildVideo, 'videoId' | 'thumbnail'> | { videoId?: string; thumbnail?: string }): string {
  if (video.thumbnail) return video.thumbnail;
  if (video.videoId) return `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`;
  return '';
}

export function youtubeThumbnailFallback(video: Pick<BuildVideo, 'videoId'> | { videoId?: string }): string {
  if (video.videoId) return `https://img.youtube.com/vi/${video.videoId}/sddefault.jpg`;
  return '';
}

export function youtubeThumbnailFinalFallback(video: Pick<BuildVideo, 'videoId'> | { videoId?: string }): string {
  if (video.videoId) return `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
  return '';
}

export function videoSlug(video: BuildVideo): string {
  return slugToken(`${video.title}-${video.creator}-${video.videoId || video.id}`);
}

export function videoPath(video: BuildVideo): string {
  return `/division-2/videos/${videoSlug(video)}/`;
}

export function videoDescription(video: BuildVideo): string {
  return String(video.description || `${video.title} by ${video.creator}. Watch this Division 2 build video on YouTube.`).trim();
}

export function videoCategory(video: BuildVideo): string {
  return video.category || video.buildTags[0] || video.tags[0] || 'Build Video';
}

export function videoTags(video: BuildVideo): string[] {
  return [...new Set([...video.buildTags, ...video.tags])];
}

export function slugToken(value: string): string {
  return String(value || '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatDate(input?: string): string {
  if (!input) return '';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return String(input);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

export function formatNumber(input?: number): string {
  if (input === undefined || input === null) return '';
  return new Intl.NumberFormat('en-US', { notation: input >= 10000 ? 'compact' : 'standard' }).format(input);
}

export function matchesBuildCategory(video: BuildVideo, key: BuildCategoryKey): boolean {
  if (key === 'all') return true;

  const haystack = [
    video.title,
    video.creator,
    video.description,
    video.category,
    ...video.tags,
    ...video.buildTags
  ]
    .join(' ')
    .toLowerCase();

  if (key === 'striker') return haystack.includes('striker');
  if (key === 'pve') return haystack.includes('pve') || haystack.includes('pve') || haystack.includes('countdown') || haystack.includes('raid') || haystack.includes('incursion') || haystack.includes('mission');
  if (key === 'solo') return haystack.includes('solo');
  if (key === 'pvp') return haystack.includes('pvp') || haystack.includes('dark zone') || haystack.includes('dz') || haystack.includes('conflict');

  return true;
}

export function getBuildVideos(data: unknown, key: BuildCategoryKey = 'all', limit?: number): BuildVideo[] {
  const videos = normalizeBuilds(data)
    .filter((video) => matchesBuildCategory(video, key))
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });

  return typeof limit === 'number' ? videos.slice(0, limit) : videos;
}

export function discoverySearchText(video: BuildVideo): string {
  return [
    video.title,
    video.creator,
    video.description,
    video.category,
    ...video.tags,
    ...video.buildTags
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function discoveryFilterValues(video: BuildVideo): string[] {
  return [
    video.creator,
    videoCategory(video),
    ...videoTags(video)
  ]
    .filter(Boolean)
    .map((value) => String(value).trim())
    .filter(Boolean)
    .filter((value, index, array) => array.findIndex((candidate) => candidate.toLowerCase() === value.toLowerCase()) === index);
}

export function discoveryFilterTokens(video: BuildVideo): string[] {
  return discoveryFilterValues(video).map(slugToken).filter(Boolean);
}

export function buildDiscoveryFilters(videos: BuildVideo[], limit = 22): DiscoveryFilter[] {
  const counts = new Map<string, { label: string; count: number }>();

  for (const video of videos) {
    for (const label of discoveryFilterValues(video)) {
      const value = slugToken(label);
      if (!value) continue;

      const current = counts.get(value);
      if (current) {
        current.count += 1;
      } else {
        counts.set(value, { label, count: 1 });
      }
    }
  }

  return [...counts.entries()]
    .sort((a, b) => {
      const countDiff = b[1].count - a[1].count;
      if (countDiff !== 0) return countDiff;
      return a[1].label.localeCompare(b[1].label);
    })
    .slice(0, limit)
    .map(([value, entry]) => ({
      value,
      label: `${entry.label} (${entry.count})`
    }));
}

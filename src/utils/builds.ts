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
  const section = video.section || video.contentType || 'Builds';
  return String(section || 'Builds');
}

export function videoTags(video: BuildVideo): string[] {
  return [
    ...(video.tags || []),
    ...(video.sourceTags || []),
    video.section,
    video.subcategory,
    video.activity,
    video.contentType
  ]
    .filter(Boolean)
    .map((tag) => String(tag));
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

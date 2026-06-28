import { asArray, formatDate, formatNumber, slugify } from './shared';

export type BuildVideo = Record<string, any>;

export function getVideos(data: any): BuildVideo[] {
  return asArray(data).filter((video) => video?.title && (video?.url || video?.videoId || video?.id));
}

export function videoId(video: BuildVideo): string {
  return String(video.videoId || video.youtubeId || video.id || '').replace(/^.*v=/, '').split('&')[0];
}

export function videoUrl(video: BuildVideo): string {
  if (video.url) return String(video.url);
  const id = videoId(video);
  return id ? `https://www.youtube.com/watch?v=${id}` : '#';
}

export function videoThumb(video: BuildVideo): string {
  const id = videoId(video);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : '';
}

export function videoTitle(video: BuildVideo): string {
  return String(video.title || 'Division 2 video');
}

export function videoCreator(video: BuildVideo): string {
  return String(video.creator || video.channelTitle || 'Division 2 Creator');
}

export function videoDescription(video: BuildVideo): string {
  const value = String(video.description || '').trim();
  if (!value) return 'Division 2 creator video indexed by DivGaming.';
  return value.length > 180 ? `${value.slice(0, 177)}...` : value;
}

export function videoTags(video: BuildVideo): string[] {
  const tags = Array.isArray(video.tags) ? video.tags : [];
  return tags.map((tag) => String(tag)).filter(Boolean);
}

export function videoSearch(video: BuildVideo): string {
  return [
    videoTitle(video),
    videoCreator(video),
    videoDescription(video),
    ...videoTags(video)
  ].join(' ').toLowerCase();
}

export function videoFilterTokens(video: BuildVideo): string[] {
  const text = videoSearch(video);
  const tokens = new Set<string>(['all']);

  if (text.includes('striker')) tokens.add('striker');
  if (text.includes('pvp') || text.includes('dark zone') || text.includes('conflict')) tokens.add('pvp');
  if (text.includes('solo')) tokens.add('solo');
  if (text.includes('raid') || text.includes('incursion') || text.includes('countdown') || text.includes('pve') || text.includes('legendary') || text.includes('heroic')) tokens.add('pve');
  if (text.includes('farm') || text.includes('farming')) tokens.add('farming');
  if (text.includes('skill')) tokens.add('skill');
  if (text.includes('tank') || text.includes('armor')) tokens.add('armor');
  if (text.includes('dps') || text.includes('damage')) tokens.add('damage');

  return [...tokens];
}

export function getCategoryVideos(data: any, category: string): BuildVideo[] {
  const videos = getVideos(data);
  if (!category || category === 'all') return videos;

  return videos.filter((video) => videoFilterTokens(video).includes(category));
}

export function videoMeta(video: BuildVideo): string {
  const parts = [
    formatDate(video.publishedAt || video.date),
    formatNumber(video.views || video.viewCount || video.youtubeStats?.viewCount)
      ? `${formatNumber(video.views || video.viewCount || video.youtubeStats?.viewCount)} views`
      : ''
  ].filter(Boolean);
  return parts.join(' · ');
}

export const CATEGORY_INFO: Record<string, { label: string; description: string; href: string }> = {
  all: {
    label: 'Build Library',
    description: 'Browse Division 2 build and creator videos by playstyle, activity, and topic.',
    href: '/division-2/builds/'
  },
  striker: {
    label: 'Striker Builds',
    description: 'Browse Striker-focused Division 2 build videos and creator resources.',
    href: '/division-2/builds/striker/'
  },
  pve: {
    label: 'PvE Builds',
    description: 'Browse PvE, Countdown, Incursion, Raid, Heroic, and Legendary build videos.',
    href: '/division-2/builds/pve/'
  },
  solo: {
    label: 'Solo Builds',
    description: 'Browse solo-friendly Division 2 build videos for players who run content alone.',
    href: '/division-2/builds/solo/'
  },
  pvp: {
    label: 'PvP Builds',
    description: 'Browse PvP, Conflict, and Dark Zone build videos.',
    href: '/division-2/builds/pvp/'
  }
};

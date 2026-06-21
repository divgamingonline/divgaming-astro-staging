import {
  getBuildVideos,
  slugToken,
  type BuildVideo
} from './builds';

export type CreatorProfile = {
  name: string;
  slug: string;
  videoCount: number;
  videos: BuildVideo[];
  tags: string[];
  latestDate?: string;
  totalViews?: number;
};

export function getCreators(data: unknown): CreatorProfile[] {
  const videos = getBuildVideos(data, 'all');
  const map = new Map<string, BuildVideo[]>();

  for (const video of videos) {
    const name = video.creator || 'Unknown Creator';
    const key = slugToken(name) || 'unknown-creator';
    const current = map.get(key) || [];
    current.push(video);
    map.set(key, current);
  }

  return [...map.entries()]
    .map(([slug, creatorVideos]) => {
      const sortedVideos = [...creatorVideos].sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      });

      const name = sortedVideos[0]?.creator || 'Unknown Creator';
      const tags = [
        ...new Set(
          sortedVideos.flatMap((video) => [...video.tags, ...video.buildTags])
            .filter(Boolean)
            .map((tag) => String(tag))
        )
      ];

      const totalViews = sortedVideos.reduce((sum, video) => sum + (video.views || 0), 0);

      return {
        name,
        slug,
        videoCount: sortedVideos.length,
        videos: sortedVideos,
        tags,
        latestDate: sortedVideos[0]?.date,
        totalViews
      };
    })
    .sort((a, b) => {
      const countDiff = b.videoCount - a.videoCount;
      if (countDiff !== 0) return countDiff;
      return a.name.localeCompare(b.name);
    });
}

export function formatCreatorDate(input?: string): string {
  if (!input) return '';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return String(input);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

export function formatCreatorNumber(input?: number): string {
  if (!input) return '';
  return new Intl.NumberFormat('en-US', { notation: input >= 10000 ? 'compact' : 'standard' }).format(input);
}

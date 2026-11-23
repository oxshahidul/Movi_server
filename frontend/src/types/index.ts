export interface Genre {
  id: number;
  name: string;
  slug: string;
  totalTitles?: number;
}

export interface CastMember {
  id: string;
  name: string;
  image?: string;
  biography?: string;
  characterName?: string;
}

export interface VideoSource {
  id: string;
  sourceName: string;
  sourceUrl: string;
  quality: string;
  format: string;
}

export interface Subtitle {
  id: string;
  language: string;
  subtitleUrl: string;
  format: string;
}

export interface Movie {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  poster: string | null;
  backdrop: string | null;
  trailerUrl: string | null;
  releaseYear: number | null;
  runtime: number | null;
  rating: string | number | null;
  language: string | null;
  status: string;
  genres: Genre[];
  cast?: CastMember[];
  videoSources?: VideoSource[];
  subtitles?: Subtitle[];
  userState?: {
    progressSeconds: number;
    isWatchlisted: boolean;
    isFavorite: boolean;
  };
}

export interface Episode {
  id: string;
  seasonId: string;
  title: string;
  slug: string;
  episodeNumber: number;
  description: string | null;
  thumbnail: string | null;
  runtime: number | null;
  videoSources?: VideoSource[];
  subtitles?: Subtitle[];
}

export interface Season {
  id: string;
  seriesId: string;
  seasonNumber: number;
  title: string;
  description: string | null;
  poster: string | null;
  episodes: Episode[];
}

export interface Series {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  poster: string | null;
  backdrop: string | null;
  trailerUrl: string | null;
  releaseYear: number | null;
  rating: string | number | null;
  status: string;
  genres: Genre[];
  cast?: CastMember[];
  seasons?: Season[];
  totalSeasons?: number;
  userState?: {
    isWatchlisted: boolean;
    isFavorite: boolean;
    lastWatchedEpisodeId: string | null;
    progressSeconds: number;
  };
}

export interface WatchHistoryItem {
  id: string;
  contentType: "MOVIE" | "SERIES";
  contentId: string;
  episodeId?: string | null;
  progressSeconds: number;
  durationSeconds: number;
  lastWatchedAt: string;
  media?: {
    id: string;
    title: string;
    slug: string;
    poster: string | null;
    backdrop: string | null;
    type: "movie" | "series";
    runtime?: number;
    episode?: {
      id: string;
      title: string;
      slug: string;
      episodeNumber: number;
      thumbnail: string | null;
    };
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "CONTENT_MANAGER" | "MODERATOR" | "USER";
  avatar?: string | null;
}

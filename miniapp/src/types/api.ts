export interface AuthResponse {
  token: string
}

export interface TelegramUser {
  profileId: string
  id: number | string
  userName?: string | null
    name?: string | null
  photoUrl?: string | null
}

export interface Profile {
  id: string
  name: string
  userName?: string
  photoUrl?: string
  telegramId?: number
  skills?: Skill[]
  description?: string;
  rating: number;
  reviewsCount: number;
}

export interface ProfileWithGithub extends Profile {
  githubInfo?: GithubInfo
}

export interface Skill {
  id: string
  name: string
}

export interface GithubInfo {
  username: string
  profileUrl: string
  repositoriesCount: number
  totalStars: number
  topLanguage: string
  avatarUrl?: string
}

export interface GithubLoginResponse {
  url: string
}

export interface Tag {
  id: number;
  name: string;
}

export interface TeamMember {
  profileId?: string;
  id: string;
  initials?: string;
  name?: string;
  status?: number;
}

export interface Team {
  id: string;
  name: string;
  event?: string;
  startDate?: string;
  endDate?: string;
  description: string;
  currentMembers: number;
  maxMembers: number;
  eventDetails?: {
    title: string;
    tags: Tag[];
    period: {
      start: string;
      end: string;
    };
  };
  wantedProfiles?: {
    id: number;
    name: string;
  }[];
  status: number;
  members: TeamMember[];
  joinRequests?: TeamMember[];
    ownerId?: string;
    averageRating?: number;
    eventTitle?: string;
}

export interface PagedResponse<T> {
    items: T[];
    totalCount: number;
}

export interface CreateTeamRequest {
  teamName: string;
  description: string | null;
  eventName: string | null;
  eventStart: string | null;
  eventEnd: string | null;
  maxMembers: number;
  tags: number[];
}

export interface Review {
    id: string;
    reviewerId: string;
    reviewerName: string;
    targetProfileId: string;
    teamId: string;
    rating: number;
    comment: string;
    createdAt: string;
}
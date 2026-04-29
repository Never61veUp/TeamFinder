import { httpClient } from '../lib/http-client';

export interface AuthResponse {
  token: string
}

export interface TelegramUser {
  profileId: string
  id: number | string
  username?: string | null
  firstName?: string | null
  lastName?: string | null
  photoUrl?: string | null
}

export interface Profile {
  id: string
  name: string
  username?: string
  photoUrl?: string
  telegramId?: number
  skills?: Skill[]
  description?: string;
  hackathons?: number;
  wins?: number;
  projects?: number;
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
  id: number;
  initials: string;
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
}

/**
 * Данные для создания команды (POST /api/teams)
 */
export interface CreateTeamRequest {
  teamName: string;
  description: string | null;
  eventName: string | null;
  eventStart: string | null;
  eventEnd: string | null;
  maxMembers: number;
  tags: number[];
}

export const teamService = {
  getMyTeam: async (): Promise<Team> => {
    // Заменили api на httpClient и убрали лишний .data,
    // так как твой клиент обычно возвращает тело сразу
    return await httpClient.get<Team>('/teams/my-team');
  },

  leaveTeam: async (): Promise<void> => {
    await httpClient.post('/teams/leave', {});
  },

  makeInactive: async (): Promise<void> => {
    await httpClient.post('/teams/make-inactive', {});
  }
};
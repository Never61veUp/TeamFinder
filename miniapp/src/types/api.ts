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

export interface TeamMember {
  id: string;
  initials: string;
}

export interface Team {
  id: string;
  name: string;
  event?: string;
  description: string;
  currentMembers: number;
  maxMembers: number;
  skills: string[];
  members: TeamMember[];
}

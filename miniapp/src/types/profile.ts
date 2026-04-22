export interface UserProfile {
    name: string;
    username: string;
    avatarUrl?: string;
    skills: string[];
    about: string;
    githubStats: {
        repositories: number;
        stars: number;
        pullRequests: number;
        topLanguage: string;
        issues: number;
        followers: number;
    };
    achievements: {
        hackathons: number;
        wins: number;
        projects: number;
    };
}
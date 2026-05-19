import { httpClient } from '../lib/http-client';
import type { Team } from '../types/api';

export const teamService = {
    getMyTeam: async (): Promise<Team> => {
        return await httpClient.get<Team>('/teams/my-team');
    },

    getTeam: async (teamId: string): Promise<Team> => {
        return await httpClient.get<Team>(`/teams/${teamId}`);
    },

    getMyHistory: async (): Promise<Team[]> => {
        return await httpClient.get<Team[]>('/teams/my-team-list?status=0');
    },

    leaveTeam: async (): Promise<void> => {
        await httpClient.post('/teams/leave', {});
    },

    makeInactive: async (): Promise<void> => {
        await httpClient.post('/teams/make-inactive', {});
    },

    kickMember: async (profileId: string): Promise<void> => {
        await httpClient.post(`/teams/kick-member/${profileId}`, {});
    }
};
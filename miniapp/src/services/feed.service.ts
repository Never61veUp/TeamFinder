import type { Tag, Team } from '../types/api'
import { httpClient } from "../lib/http-client";

export const feedService = {
    async getEventTags(): Promise<Tag[]> {
        return await httpClient.get<Tag[]>('/teams/event-tags');
    },

    async getRecommendedTeams(): Promise<Team[]> {
        return await httpClient.get<Team[]>('/teams');
    },

    async requestJoin(teamId: string | number): Promise<void> {
        return await httpClient.post(`/teams/${teamId}/request-join`, {
            teamId: teamId
        });
    }
}

export const acceptJoinRequest = async (teamId: string, requestedProfileId: string) => {
    if (!requestedProfileId || requestedProfileId === "undefined") {
        console.error("Ошибка: profileId не определен");
        throw new Error("Invalid profileId");
    }
    return httpClient.post(`/teams/${teamId}/accept-join/${requestedProfileId}`, {
        teamId,
        profileId: requestedProfileId
    });
};

export const rejectJoinRequest = async (teamId: string, requestedProfileId: string) => {
    return httpClient.post(`/teams/${teamId}/reject-join/${requestedProfileId}`, {
        teamId,
        profileId: requestedProfileId
    });
};
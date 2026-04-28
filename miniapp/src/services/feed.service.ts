// src/services/feed.service.ts
import type { Tag, Team } from '../types/api'
import { httpClient } from "../lib/http-client.ts";

export const feedService = {
    async getEventTags(): Promise<Tag[]> {
        return await httpClient.get<Tag[]>('/teams/event-tags');
    },

    async getRecommendedTeams(): Promise<Team[]> {
        return await httpClient.get<Team[]>('/teams');
    },

    // Добавляем этот метод:
    async requestJoin(teamId: string | number): Promise<void> {
        return await httpClient.post(`/teams/${teamId}/request-join`, {});
    }
}
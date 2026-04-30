import { httpClient } from '../lib/http-client';
import type { Profile } from '../types/api';

export const searchService = {
    getProfilesBySkill: (skillId: string) => {
        return httpClient.get<Profile[]>(`/profiles/search/${skillId}`);
    },

    findProfileByName: (name: string) => {
        return httpClient.get<Profile>(`/profiles/find-profile/${name}`);
    }
};
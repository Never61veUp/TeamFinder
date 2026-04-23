import {httpClient} from "../lib/http-client.ts";
import type {Profile, ProfileWithGithub, Skill} from "../types/api.ts";


export const profileService = {
  getById(profileId: string) {
    return httpClient.get<Profile>(`/profiles/${profileId}`)
  },

  getWithGithubStats(profileId: string) {
    return httpClient.get<ProfileWithGithub>(`/profiles/${profileId}/gitstats`)
  },

  getSkills(profileId: string) {
    return httpClient.get<Skill[]>(`/profiles/${profileId}/skills`)
  },

  addSkill(profileId: string, skillId: string) {
    return httpClient.post(`/profiles/${profileId}/skills/${skillId}`)
  },
}

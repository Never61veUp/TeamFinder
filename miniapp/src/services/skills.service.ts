import type {Skill} from "../types/api.ts";
import {httpClient} from "../lib/http-client.ts";


export const skillsService = {
  getAll() {
    return httpClient.get<Skill[]>('/skills/all')
  },

  getChildren(skillId: string) {
    return httpClient.get<Skill[]>(`/skills/${skillId}/children`)
  },
}

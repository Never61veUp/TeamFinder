import { httpClient } from "../lib/http-client";
import type { Profile, ProfileWithGithub, Skill } from "../types/api";

export const profileService = {
  getById(profileId: string) {
    return httpClient.get<Profile>(`/profiles/${profileId}`);
  },

  getMyProfile() {
    return httpClient.get<ProfileWithGithub>(`/profiles/me`);
  },

  getSkills(profileId: string) {
    return httpClient.get<Skill[]>(`/profiles/${profileId}/skills`);
  },

  // Возвращает глобальный список доступных навыков (строки или объекты {id, name})
  getAllSkills() {
    return httpClient.get<string[] | Skill[]>(`/skills`);
  },

  addSkill(profileId: string, skillIdOrName: string) {
    const encoded = encodeURIComponent(skillIdOrName);
    const attempts = [
      // path variant: /profiles/:id/skills/:skillId
      () => httpClient.post(`/profiles/${profileId}/skills/${encoded}`),
      // body variant: POST /profiles/:id/skills { skillId }
      () => httpClient.post(`/profiles/${profileId}/skills`, { skillId: skillIdOrName }),
      // global endpoint: POST /profiles/skills { profileId, skillId }
      () => httpClient.post(`/profiles/skills`, { profileId, skillId: skillIdOrName }),
    ];
    return tryAttempts(attempts);
  },

  removeSkill(profileId: string, skillIdOrName: string) {
    const encoded = encodeURIComponent(skillIdOrName);
    const attempts = [
      // path variant: DELETE /profiles/:id/skills/:skillId
      () => httpClient.delete(`/profiles/${profileId}/skills/${encoded}`),
      // query variant: DELETE /profiles/:id/skills?skillId=...
      () => httpClient.delete(`/profiles/${profileId}/skills?skillId=${encoded}`),
      // fallback: POST /profiles/skills/remove { profileId, skillId }
      () => httpClient.post(`/profiles/skills/remove`, { profileId, skillId: skillIdOrName }),
    ];
    return tryAttempts(attempts);
  },

  setSkills(profileId: string, skillIds: string[]) {
    return httpClient.put(`/profiles/${profileId}/skills`, { skills: skillIds });
  },

  async updateProfile(profileId: string, payload: Partial<Profile & {
    about?: string;
    hackathons?: number;
    wins?: number;
    projects?: number;
    skills?: string[]; // ожидаем массив id или массив объектов в зависимости от API
  }>) {
    try {
      // получаем текущий профиль, чтобы собрать полный объект
      const current = await httpClient.get<Profile>(`/profiles/${profileId}`).catch(() => null);

      const full: Partial<Profile> = {
        id: profileId,
        name: (current as any)?.name ?? (payload as any).name ?? 'Unknown',
        username: (current as any)?.username,
        photoUrl: (current as any)?.photoUrl,
        about: payload.about ?? (current as any)?.about,
        hackathons: payload.hackathons ?? (current as any)?.hackathons,
        wins: payload.wins ?? (current as any)?.wins,
        projects: payload.projects ?? (current as any)?.projects,
        // если пришли skills — используем их; иначе берём из current
        skills: (payload as any).skills ?? (current as any)?.skills ?? [],
      };

      console.log('profileService.updateProfile: POST /profiles', full);
      return await httpClient.post(`/profiles`, full);
    } catch (postErr: any) {
      console.warn('profileService.updateProfile: POST /profiles failed, trying legacy attempts', postErr);

      const attempts = [
        { method: 'patch', path: `/profiles/${profileId}` },
        { method: 'put', path: `/profiles/${profileId}` },
        { method: 'post', path: `/profiles/${profileId}` },
      ];

      let lastErr: any = null;
      for (const a of attempts) {
        try {
          if (a.method === 'patch') return await httpClient.patch(a.path, payload);
          if (a.method === 'put') return await httpClient.put(a.path, payload);
          if (a.method === 'post') return await httpClient.post(a.path, payload);
        } catch (err: any) {
          lastErr = err;
          if (err?.status && err.status !== 405 && err.status !== 404) throw err;
          console.warn(`profileService.updateProfile: attempt ${a.method.toUpperCase()} ${a.path} failed`, err?.status);
        }
      }

      const e: any = new Error('All updateProfile attempts failed');
      e.cause = lastErr;
      throw e;
    }
  },
};

async function tryAttempts(attempts: Array<() => Promise<any>>) {
  let lastErr: any = null;
  for (const fn of attempts) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      // если ошибка не 404/405 — пробрасываем, иначе пробуем следующий вариант
      if (err?.status && err.status !== 404 && err.status !== 405) {
        throw err;
      }
      console.warn('profile.service tryAttempts failed attempt', err?.status ?? err);
    }
  }
  const e: any = new Error('All attempts failed');
  e.cause = lastErr;
  throw e;
}

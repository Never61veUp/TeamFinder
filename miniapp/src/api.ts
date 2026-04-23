const API_URL = 'https://api.teamfinder.mixdev.me'

export type TelegramUser = {
  id: number | string
  username?: string | null
  firstName?: string | null
  lastName?: string | null
  photoUrl?: string | null
}

export async function telegramLogin(initData: string): Promise<{ token: string }> {
  const res = await fetch(`${API_URL}/api/auth/telegram`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ initData })
  })
  if (!res.ok) throw new Error(`Auth failed: ${res.status}`)
  const json = (await res.json()) as { token: string }
  return json
}

export async function getMe(token: string): Promise<TelegramUser> {
  const res = await fetch(`${API_URL}/api/me`, {
    headers: { authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error(`Me failed: ${res.status}`)
  return (await res.json()) as TelegramUser
}

export const profileApi = {
  getSkills: (profileId: number) =>
      fetch(`/api/profiles/${profileId}/skills`).then(res => res.json()),

  connectGithub: () => {
    window.location.href = `${window.location.origin}/api/github/login`;
  }
};


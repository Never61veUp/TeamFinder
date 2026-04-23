import type {AuthResponse, TelegramUser} from "../types/api.ts";
import {httpClient, tokenStorage} from "../lib/http-client.ts";



export const authService = {
  async loginWithTelegram(initData: string) {
    const response = await httpClient.post<AuthResponse>('/auth/telegram', { initData })
    tokenStorage.set(response.token)
    return response
  },

  async loginDev(telegramId = 1) {
    const response = await httpClient.post<AuthResponse>('/auth/dev', telegramId)
    tokenStorage.set(response.token)
    return response
  },

  getMe() {
    return httpClient.get<TelegramUser>('/me')
  },

  logout() {
    tokenStorage.remove()
  },

  hasToken() {
    return Boolean(tokenStorage.get())
  },
}

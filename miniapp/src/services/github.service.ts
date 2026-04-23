import type {GithubLoginResponse} from "../types/api.ts";
import {httpClient} from "../lib/http-client.ts";


export const githubService = {
  async connect() {
    const response = await httpClient.get<GithubLoginResponse>('/github/login')
    const webapp = window.Telegram?.WebApp
    if (webapp) {
      webapp.openLink(response.url)
    } else {
      window.location.href = response.url
    }
  },
}

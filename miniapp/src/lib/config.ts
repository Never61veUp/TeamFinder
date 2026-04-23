export const config = {
    api: {
        baseUrl: import.meta.env.VITE_API_URL || 'https://api.teamfinder.mixdev.me/api',
    },
    storage: {
        tokenKey: 'jwt',
    },
    isDev: import.meta.env.DEV,
}
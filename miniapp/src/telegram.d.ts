export {}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string
        initDataUnsafe: unknown
        ready: () => void
        expand: () => void
        close: () => void
        platform?: string
        version?: string
        openLink: (url: string) => void
        colorScheme?: 'light' | 'dark'
      }
    }
  }
}


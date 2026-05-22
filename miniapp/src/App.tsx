import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import { ProfilePage } from './components/Profile/ProfilePage'
import { Navigation } from './components/Navigation/Navigation'
import { TeamPage } from './components/Team/TeamPage.tsx'
import { HomePage } from './components/Home/HomePage'
import { NotificationsSheet } from './components/ui/Notifications/NotificationsSheet'
import { SearchPage } from './components/Search/SearchPage'
import './style.css'
import type { TelegramUser } from "./types/api.ts"
import { authService } from "./services"
import { NotificationProvider } from './components/ui/Notifications/NotificationContext'

function App() {
    const initData = window.Telegram?.WebApp?.initData ?? ''
    const [token, setToken] = useState<string>(() => localStorage.getItem('jwt') ?? '')
    const [me, setMe] = useState<TelegramUser | null>(null)
    const [error, setError] = useState<string>('')
    const [initializing, setInitializing] = useState(true)

    const [isNotifOpen, setIsNotifOpen] = useState(false)

    useEffect(() => {
        try {
            const tg = (window as any).Telegram?.WebApp;

            if (tg) {
                tg.ready();

                if (tg.expand) {
                    tg.expand();
                }

                if (tg.setHeaderColor) {
                    tg.setHeaderColor('bg_color');
                }
            }
        } catch (e) {
            console.error('Ошибка инициализации:', e);
        }
    }, []);

    useEffect(() => {
        let cancelled = false

        async function initAuth() {
            try {
                setError('')

                let currentToken = token

                if (!currentToken) {
                    const data = initData
                        ? await authService.loginWithTelegram(initData)
                        : await authService.loginDev()

                    currentToken = data.token

                    localStorage.setItem('jwt', currentToken)
                    setToken(currentToken)
                }

                const user = await authService.getMe()

                if (!cancelled) {
                    setMe(user)
                }
            } catch (e: unknown) {
                if (!cancelled) {
                    localStorage.removeItem('jwt')
                    setToken('')
                    setMe(null)

                    setError(
                        e instanceof Error
                            ? e.message
                            : 'Unknown error'
                    )
                }
            } finally {
                if (!cancelled) {
                    setInitializing(false)
                }
            }
        }

        initAuth()

        return () => {
            cancelled = true
        }
    }, [])

    function onLogout() {
        localStorage.removeItem('jwt')
        window.location.reload()
    }

    if (initializing) {
        return (
            <div className="min-h-dvh flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="text-sm text-slate-500">
                        Авторизация...
                    </div>

                    {error && (
                        <div className="mt-2 text-xs text-red-500">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    if (!me) {
        return (
            <div className="min-h-dvh flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="text-sm text-red-500">
                        Не удалось авторизоваться
                    </div>

                    {error && (
                        <div className="mt-2 text-xs text-slate-500">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <NotificationProvider>
            <Router>
                <main className="main-scroll-area">
                    <Routes>
                        <Route
                            path="/"
                            element={<HomePage user={me} onOpenNotif={() => setIsNotifOpen(true)} />}
                        />
                        <Route
                            path="/search"
                            element={<SearchPage onOpenNotif={() => setIsNotifOpen(true)} />}
                        />
                        <Route
                            path="/create"
                            element={<TeamPage onOpenNotif={() => setIsNotifOpen(true)} />}
                        />
                        <Route
                            path="/profile"
                            element={<ProfilePage user={me} onLogout={onLogout} onOpenNotif={() => setIsNotifOpen(true)} />}
                        />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </main>

                <NotificationsSheet
                    isOpen={isNotifOpen}
                    onClose={() => setIsNotifOpen(false)}
                />

                <Navigation />
            </Router>
        </NotificationProvider>
    )
}

export default App
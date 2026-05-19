import {useEffect, useState} from 'react'
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom'
import {ProfilePage} from './components/Profile/ProfilePage'
import {Navigation} from './components/Navigation/Navigation'
import {TeamPage} from './components/Team/TeamPage.tsx'
import {HomePage} from './components/Home/HomePage'
import {NotificationsSheet} from './components/ui/Notifications/NotificationsSheet'
import {SearchPage} from './components/Search/SearchPage'
import './style.css'
import type {TelegramUser} from "./types/api.ts";
import {authService} from "./services";

function App() {
    const initData = window.Telegram?.WebApp?.initData ?? ''
    const [token, setToken] = useState<string>(() => localStorage.getItem('jwt') ?? '')
    const [me, setMe] = useState<TelegramUser | null>(null)
    const [error, setError] = useState<string>('')
    const [busy, setBusy] = useState(false)
    const [authTried, setAuthTried] = useState(false)

    const [isNotifOpen, setIsNotifOpen] = useState(false)

    useEffect(() => {
        try {
            const tg = (window as any).Telegram?.WebApp;

            if (tg) {
                tg.ready();

                if (tg.setHeaderColor) {
                    tg.setHeaderColor('bg_color');
                }
            }
        } catch (e) {
            console.error("Ошибка инициализации:", e);
        }
    }, []);

    useEffect(() => {
        if (!token) return
        let cancelled = false
        setError('')
        authService.getMe()
            .then((u) => {
                if (!cancelled) setMe(u)
            })
            .catch((e: unknown) => {
                if (!cancelled) {
                    setError(e instanceof Error ? e.message : 'Unknown error')
                    if (token) {
                        onLogout()
                        setAuthTried(true)
                    }
                }
            })
        return () => {
            cancelled = true
        }
    }, [token])

    useEffect(() => {
        if (token || busy || authTried) return

        setAuthTried(true)
        onLogin()
    }, [token, authTried, busy])

    async function onLogin() {
        setBusy(true)
        if (!initData) {
            try {
                const data = await authService.loginDev()
                localStorage.setItem('jwt', data.token)
                setToken(data.token)
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : 'Unknown error')
            } finally {
                setBusy(false)
            }
        } else {
            setError('')
            try {
                const data = await authService.loginWithTelegram(initData)
                localStorage.setItem('jwt', data.token)
                setToken(data.token)
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : 'Unknown error')
            } finally {
                setBusy(false)
            }
        }
    }

    function onLogout() {
        localStorage.removeItem('jwt')
        setToken('')
        setMe(null)
        setError('')
    }

    if (!me) {
        return (
            <div className="min-h-dvh flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="text-sm text-slate-500">
                        {busy ?? 'Загрузка...'}
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

    return (
        <Router>
            <main className="main-scroll-area">
                <Routes>
                    <Route
                        path="/"
                        element={<HomePage user={me} onOpenNotif={() => setIsNotifOpen(true)}/>}
                    />
                    <Route
                        path="/search"
                        element={<SearchPage onOpenNotif={() => setIsNotifOpen(true)}/>}
                    />

                    <Route
                        path="/create"
                        element={<TeamPage onOpenNotif={() => setIsNotifOpen(true)}/>}
                    />

                    <Route
                        path="/profile"
                        element={<ProfilePage user={me} onLogout={onLogout} onOpenNotif={() => setIsNotifOpen(true)}/>}
                    />
                    <Route path="*" element={<Navigate to="/"/>}/>
                </Routes>
            </main>

            <NotificationsSheet
                isOpen={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
            />

            <Navigation/>
        </Router>
    )
}

export default App
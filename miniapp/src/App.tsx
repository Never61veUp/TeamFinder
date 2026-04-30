import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ProfilePage } from './components/Profile/ProfilePage'
import { Navigation } from './components/Navigation/Navigation'
import { TeamPage } from './components/Team/TeamPage.tsx'
import { HomePage } from './components/Home/HomePage'
import { NotificationsSheet } from './components/ui/Notifications/NotificationsSheet'
import { SearchPage } from './components/Search/SearchPage'
import './style.css'
import type { TelegramUser } from "./types/api.ts";
import { authService } from "./services";

function App() {
    const initData = window.Telegram?.WebApp?.initData ?? ''
    const [token, setToken] = useState<string>(() => localStorage.getItem('jwt') ?? '')
    const [me, setMe] = useState<TelegramUser | null>(null)
    const [error, setError] = useState<string>('')
    const [busy, setBusy] = useState(false)

    const [isNotifOpen, setIsNotifOpen] = useState(false)

    useEffect(() => {
        try {
            window.Telegram?.WebApp?.ready?.()
            window.Telegram?.WebApp?.expand?.()
        } catch { /* empty */ }
    }, [])

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
                    if (token) onLogout()
                }
            })
        return () => {
            cancelled = true
        }
    }, [token])

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
            <div className="min-h-dvh bg-slate-50 text-slate-900">
                <div className="mx-auto grid max-w-2xl gap-3 p-4">
                    <header className="py-2">
                        <div className="text-xl font-extrabold">TeamFinder</div>
                    </header>
                    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <button
                            className="w-full inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-3 text-sm font-bold text-white disabled:opacity-50"
                            disabled={busy}
                            onClick={onLogin}
                        >
                            {busy ? 'Вход...' : 'Войти через Telegram'}
                        </button>
                        {error ? <div className="mt-3 text-red-700">{error}</div> : null}
                    </section>
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
    )
}

export default App
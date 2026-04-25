import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ProfilePage } from './components/Profile/ProfilePage'
import { Navigation } from './components/Navigation/Navigation'
import { CreateTeamPage } from './components/CreateTeam/CreateTeamPage'
import './style.css'
import type {TelegramUser} from "./types/api.ts";
import {authService} from "./services";

function App() {
    const initData = window.Telegram?.WebApp?.initData ?? ''
    const [token, setToken] = useState<string>(() => localStorage.getItem('jwt') ?? '')
    const [me, setMe] = useState<TelegramUser | null>(null)
    const [error, setError] = useState<string>('')
    const [busy, setBusy] = useState(false)

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
                console.log(u);
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
        // ТЕСТОВЫЙ РЕЖИМ: Если запустили приложение в браузере (нет initData от Telegram)
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

        }else {
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

        // РЕАЛЬНЫЙ РЕЖИМ: Если мы в Telegram


    }

    //БУДЕТ ИСПОЛЬЗОВАТЬ НО ОТКЛЮЧИЛ ДЛЯ ТЕСТА
    //async function onLogin() {
    //    setBusy(true)
    //    setError('')
    //    try {
    //        const data = await telegramLogin(initData)
    //        localStorage.setItem('jwt', data.token)
    //        setToken(data.token)
    //    } catch (e: unknown) {
    //        setError(e instanceof Error ? e.message : 'Unknown error')
    //    } finally {
    //        setBusy(false)
    //    }
    //}

    function onLogout() {
        localStorage.removeItem('jwt')
        setToken('')
        setMe(null)
        setError('')
    }

    const isTelegram = Boolean(window.Telegram?.WebApp)

    // ЭКРАН АВТОРИЗАЦИИ
    if (!me) {
        return (
            <div className="min-h-dvh bg-slate-50 text-slate-900">
                <div className="mx-auto grid max-w-2xl gap-3 p-4">
                    <header className="py-2">
                        <div className="text-xl font-extrabold">TeamFinder Starter</div>
                        <div className="mt-1 text-sm text-slate-600">
                            {isTelegram ? 'Telegram WebApp detected' : 'Open via Telegram to get initData'}
                        </div>
                    </header>

                    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-3 py-2">
                            <div className="font-bold">initData</div>
                            <div className="font-mono text-sm text-slate-600">{initData ? 'present' : 'missing'}</div>
                        </div>

                        <div className="flex items-center justify-between gap-3 py-2">
                            <div className="font-bold">JWT</div>
                            <div className="font-mono text-sm text-slate-600">{token ? 'present' : 'missing'}</div>
                        </div>

                        <div className="mt-3 flex gap-2">
                            <button
                                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={busy}//|| !initData} ДЛЯ ТЕСТА ОТКЛЮЧИЛ
                                onClick={onLogin}
                            >
                                {busy ? 'Logging in…' : 'Login with Telegram'}
                            </button>
                        </div>

                        {error ? <div className="mt-3 font-semibold text-red-700">{error}</div> : null}
                    </section>
                </div>
            </div>
        )
    }

    // ЭКРАН ПРИЛОЖЕНИЯ
    return (
        <Router>
            <div className="min-h-dvh bg-slate-50 pb-20">
                <Routes>
                    <Route path="/" element={<div className="p-4"><h1>Главная (Лента)</h1></div>} />
                    <Route path="/search" element={<div className="p-4"><h1>Поиск команд</h1></div>} />
                    <Route path="/create" element={<CreateTeamPage />} />
                    <Route path="/profile" element={<ProfilePage user={me} onLogout={onLogout} />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>

                <Navigation />
            </div>
        </Router>
    )
}

export default App
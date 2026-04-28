// src/components/Home/HomePage.tsx
import { useEffect, useState } from 'react'
import type { TelegramUser, Team } from '../../types/api'
import { feedService } from '../../services/feed.service'
import { TeamCard } from './TeamCard'
import { Header } from '../ui/Header/Header'
import './home.css'

interface HomePageProps {
    user: TelegramUser
}

export function HomePage({ user }: HomePageProps) {
    const [teams, setTeams] = useState<Team[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        feedService.getRecommendedTeams()
            .then((data) => {
                // Если API возвращает объект с полем data, обрабатываем это
                const teamsData = Array.isArray(data) ? data : (data as any).data || [];
                setTeams(teamsData);
            })
            .catch(err => console.error("Ошибка загрузки команд:", err))
            .finally(() => setIsLoading(false))
    }, [])

    return (
        <div className="home-container">
            <Header title={`Привет, ${user.firstName || 'Александр'}!`} />

            <main className="home-content">
                <h2 className="section-title">Рекомендуемые команды</h2>

                {isLoading ? (
                    <div className="loader-container">
                        <div className="spinner" />
                    </div>
                ) : teams.length > 0 ? (
                    <div className="teams-grid">
                        {teams.map((team) => (
                            <TeamCard key={team.id} team={team} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-slate-400 py-10">Активных команд пока нет</p>
                )}

                <div className="tip-box">
                    <div className="tip-header">
                        <span style={{fontSize: '20px'}}>💡</span>
                        <span className="tip-title">Совет</span>
                    </div>
                    <p className="tip-text">
                        Заполните свой профиль и добавьте навыки, чтобы команды могли легче вас найти!
                    </p>
                </div>
            </main>
        </div>
    )
}
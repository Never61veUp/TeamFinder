import { useEffect, useState } from 'react'
import type {TelegramUser, Team} from '../../types/api'
import { feedService } from '../../services/feed.service'
import { TeamCard } from './TeamCard'
import './home.css'

interface HomePageProps {
    user: TelegramUser
}

export function HomePage({ user }: HomePageProps) {
    const [teams, setTeams] = useState<Team[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        feedService.getRecommendedTeams()
            .then((data) => setTeams(data))
            .catch(console.error)
            .finally(() => setIsLoading(false))
    }, [])

    return (
        <div className="home-container">
            <header className="home-header">
                <h1 className="home-greeting">Привет, {user.firstName || 'Александр'}! 👋</h1>
                <p className="home-subtitle">Найди свою команду мечты</p>
            </header>

            <main className="home-content">
                <h2 className="section-title">Рекомендуемые команды</h2>

                {isLoading ? (
                    <div className="loader-container">
                        <div className="spinner" />
                    </div>
                ) : (
                    <div className="teams-grid">
                        {teams.map((team) => (
                            <TeamCard key={team.id} team={team} />
                        ))}
                    </div>
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
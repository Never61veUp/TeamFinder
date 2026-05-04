import {useEffect, useState} from 'react'
import type {TelegramUser, Team} from '../../types/api'
import {feedService} from '../../services/feed.service'
import {TeamCard} from './TeamCard'
import {Header} from '../ui/Header/Header'
import './home.css'

interface HomePageProps {
    user: TelegramUser,
    onOpenNotif?: () => void
}

export function HomePage({user, onOpenNotif}: HomePageProps) {
    const [teams, setTeams] = useState<Team[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        feedService.getRecommendedTeams()
            .then((data) => {
                const teamsData = data && 'items' in data ? data.items : (Array.isArray(data) ? data : []);
                setTeams(teamsData);
                console.log(teamsData);
            })
            .catch(err => console.error("Ошибка загрузки команд:", err))
            .finally(() => setIsLoading(false))
    }, [])

    const hasTeam = teams.some(team => {
        const isOwner = String(team.ownerId) === String(user.profileId);

        const isMember = team.members?.some(memberId =>
            String(memberId) === String(user.profileId)
        );

        return isOwner || isMember;
    });

    return (
        <div className="home-container">
            <Header
                title={`Привет, ${user.firstName || 'Александр'}!`}
                onNotificationClick={onOpenNotif}
            />

            <main className="home-content">
                <h2 className="section-title">Рекомендуемые команды</h2>

                {isLoading ? (
                    <div className="loader-container">
                        <div className="spinner"/>
                    </div>
                ) : teams.length > 0 ? (
                    <div className="teams-grid">
                        {teams.map((team) => (
                            <TeamCard
                                key={team.id}
                                team={team}
                                myProfileId={user.profileId}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-slate-400 py-10">Активных команд пока нет</p>
                )}

                {!hasTeam && !isLoading && (
                    <div className="tip-box">
                        <div className="tip-header">
                            <span style={{fontSize: '20px'}}>💡</span>
                            <span className="tip-title">Совет</span>
                        </div>
                        <p className="tip-text">
                            Заполните свой профиль и добавьте навыки, чтобы команды могли легче вас найти!
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
import {useEffect, useState} from 'react'
import type {TelegramUser, Team} from '../../types/api'
import {feedService} from '../../services/feed.service'
import {TeamCard} from './TeamCard'
import {Header} from '../ui/Header/Header'
import './home.css'
import {Button} from "../ui/Button.tsx";

interface HomePageProps {
    user: TelegramUser,
    onOpenNotif?: () => void
}

export function HomePage({user, onOpenNotif}: HomePageProps) {
    const [teams, setTeams] = useState<Team[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [totalCount, setTotalCount] = useState(0)
    const PAGE_SIZE = 5;

    const loadTeams = (from: number, append: boolean = false) => {
        const loadingTrigger = append ? setIsLoadingMore : setIsLoading;
        loadingTrigger(true);

        feedService.getRecommendedTeams(1, from, PAGE_SIZE)
            .then((data) => {
                setTeams(prev => append ? [...prev, ...data.items] : data.items);
                setTotalCount(data.totalCount);
            })
            .catch(err => console.error("Ошибка загрузки:", err))
            .finally(() => loadingTrigger(false));
    };

    useEffect(() => {
        loadTeams(0);
    }, []);

    const handleLoadMore = () => {
        if (teams.length < totalCount) {
            loadTeams(teams.length, true);
        }
    };

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
                    <div className="loader-container"><div className="spinner"/></div>
                ) : (
                    <>
                        <div className="teams-grid">
                            {teams.map((team) => (
                                <TeamCard key={team.id} team={team} myProfileId={user.profileId} />
                            ))}
                        </div>

                        {teams.length < totalCount && (
                            <Button
                                onClick={handleLoadMore}
                                disabled={isLoadingMore}
                            >
                                {isLoadingMore ? 'Загрузка...' : 'Показать еще'}
                            </Button>
                        )}
                    </>
                )}

                {teams.length === 0 && !isLoading && <p>Активных команд нет</p>}

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
import { useState, useEffect } from 'react'
import type { Team } from '../../types/api'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { feedService } from '../../services/feed.service'
import './home.css'

interface TeamCardProps {
    team: Team
    myProfileId?: string;
}

export function TeamCard({ team, myProfileId }: TeamCardProps) {
    const [showDetails, setShowDetails] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [alreadyJoined, setAlreadyJoined] = useState(false);

    const storageKey = `req_sent_${team.id}`;

    useEffect(() => {
        // Проверяем участие (ID участников могут приходить строками или числами, приводим к String)
        const isMember = team.members?.some(m => String(m) === String(myProfileId));
        const hasLocalRecord = localStorage.getItem(storageKey) === 'true';

        if (isMember || hasLocalRecord) {
            setAlreadyJoined(true);
        }
    }, [team.members, myProfileId, storageKey]);

    const handleJoin = async () => {
        setIsJoining(true);
        try {
            await feedService.requestJoin(team.id);
            localStorage.setItem(storageKey, 'true');
            setAlreadyJoined(true);
            alert('Заявка успешно отправлена!');
            setShowDetails(false);
        } catch (e: any) {
            alert('Ошибка при отправке заявки.');
        } finally {
            setIsJoining(false);
        }
    };

    // Основная информация
    const currentCount = team.currentMembers || team.members?.length || 1;
    const description = team.description || 'Описание отсутствует';

    // Данные события и теги (берем из новой структуры)
    const eventTitle = team.eventDetails?.title;
    const period = team.eventDetails?.period;

    // ТЕПЕРЬ ТЕГИ ТУТ:
    const teamTags = team.eventDetails?.tags || [];

    return (
        <div className="team-card">
            <div className="team-card-header">
                <div className="team-info-group">
                    <h2 className="team-name">{team.name}</h2>
                    {eventTitle && <p className="team-event">{eventTitle}</p>}
                </div>
                <div className="team-capacity">
                    {currentCount} / {team.maxMembers}
                </div>
            </div>

            <p className="team-desc-short">
                {description.length > 80 ? description.slice(0, 80) + '...' : description}
            </p>

            {/* Отображение тегов в списке */}
            <div className="skills-list">
                {teamTags.length > 0 ? (
                    teamTags.map((tag: any) => (
                        <Badge key={tag.id} variant="primary">
                            {tag.name}
                        </Badge>
                    ))
                ) : (
                    <span className="text-slate-500 text-xs italic">Направления не указаны</span>
                )}
            </div>

            <Button
                size="lg"
                variant="primary"
                className="team-card-btn"
                onClick={() => setShowDetails(true)}
                disabled={alreadyJoined}
            >
                {alreadyJoined ? 'Заявка подана' : 'Подробнее'}
            </Button>

            {showDetails && (
                <div className="modal-overlay" onClick={() => setShowDetails(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{team.name}</h2>
                            <span className="modal-capacity">{currentCount} / {team.maxMembers} чел.</span>
                        </div>

                        <div className="modal-body">
                            {(eventTitle || period) && (
                                <div className="modal-info-panel">
                                    {eventTitle && (
                                        <div className="info-item">
                                            <span className="info-label">Хакатон:</span>
                                            <span className="info-value">{eventTitle}</span>
                                        </div>
                                    )}
                                    {period?.start && (
                                        <div className="info-item">
                                            <span className="info-label">Даты:</span>
                                            <span className="info-value">
                                                {new Date(period.start).toLocaleDateString('ru-RU')}
                                                {' — '}
                                                {new Date(period.end).toLocaleDateString('ru-RU')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="modal-section">
                                <h3>О проекте:</h3>
                                <p className="full-desc">{team.description}</p>
                            </div>

                            {/* Теги в модальном окне */}
                            {teamTags.length > 0 && (
                                <div className="modal-section">
                                    <h3>Направления:</h3>
                                    <div className="view-tags-list flex flex-wrap gap-2">
                                        {teamTags.map((tag: any) => (
                                            <Badge key={tag.id} className="badge">
                                                {tag.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            <Button
                                variant="primary"
                                onClick={handleJoin}
                                isLoading={isJoining}
                                className="w-full"
                                disabled={alreadyJoined}
                            >
                                {alreadyJoined ? 'Заявка уже отправлена' : 'Подать заявку'}
                            </Button>
                            <Button variant="ghost" onClick={() => setShowDetails(false)}>
                                Закрыть
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
import { useState } from 'react'
import type { Team } from '../../types/api'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { feedService } from '../../services/feed.service'
import './home.css'

interface TeamCardProps {
    team: Team
}

export function TeamCard({ team }: TeamCardProps) {
    const [showDetails, setShowDetails] = useState(false);
    const [isJoining, setIsJoining] = useState(false);

    // Безопасная обрезка текста: проверяем наличие описания перед slice/substring
    const description = team.description || 'Описание отсутствует';
    const shortDescription = description.length > 80
        ? description.slice(0, 80) + '...'
        : description;

    const handleJoin = async () => {
        setIsJoining(true);
        try {
            // В документации API метод post /api/teams/{teamId}/request-join
            await feedService.requestJoin(team.id);
            alert('Заявка успешно отправлена!');
            setShowDetails(false);
        } catch (e) {
            console.error(e);
            alert('Ошибка при отправке заявки');
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <div className="team-card">
            <div className="team-card-header">
                <div className="team-info-group">
                    <h2 className="team-name">{team.name}</h2>
                    {/* Исправлено: используем только team.event, так как в типе Team именно оно */}
                    {team.event && (
                        <p className="team-event">{team.event}</p>
                    )}
                </div>
                <div className="team-capacity">
                    {team.currentMembers}/{team.maxMembers}
                </div>
            </div>

            <p className="team-desc-short">{shortDescription}</p>

            <div className="skills-list">
                {team.tags?.map((tag) => (
                    <Badge key={tag.id} variant="primary">
                        {tag.name}
                    </Badge>
                ))}
            </div>

            <Button size="lg" variant="primary" className="team-card-btn" onClick={() => setShowDetails(true)}>
                Подробнее
            </Button>

            {/* Модальное окно (Полное описание) */}
            {showDetails && (
                <div className="modal-overlay" onClick={() => setShowDetails(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">{team.name}</h2>
                        <div className="modal-body">
                            <p className="full-desc">{description}</p>

                            <div className="modal-section">
                                <h3>Направления:</h3>
                                <div className="skills-list">
                                    {team.tags?.map(tag => (
                                        <Badge key={tag.id} variant="primary">{tag.name}</Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <Button
                                variant="primary"
                                onClick={handleJoin}
                                isLoading={isJoining}
                                className="w-full"
                            >
                                Подать заявку
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
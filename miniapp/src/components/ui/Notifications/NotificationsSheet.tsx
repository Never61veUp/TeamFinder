import React, { useState, useEffect } from 'react';
import { Button } from '../Button';
import { teamService } from '../../../types/api';
import { acceptJoinRequest } from '../../../services/feed.service';
import type { Team, TeamMember } from '../../../types/api';
import './notifications.css';

interface NotificationsSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onViewProfile?: (id: string) => void;
}

export const NotificationsSheet: React.FC<NotificationsSheetProps> = ({ isOpen, onClose, onViewProfile }) => {
    const [myTeam, setMyTeam] = useState<Team | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) loadMyTeam();
    }, [isOpen]);

    const loadMyTeam = async () => {
        setIsLoading(true);
        try {
            const data = await teamService.getMyTeam(); //
            setMyTeam(data);
        } catch (error) {
            console.error('Ошибка загрузки команды:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAccept = async (id: string) => {
        if (!myTeam) return;
        setActionLoadingId(id);
        try {
            await acceptJoinRequest(myTeam.id, id); //
            await loadMyTeam();
        } catch (error) {
            alert('Ошибка при принятии заявки');
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <>
            <div className={`sheet-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
            <div className={`notifications-sheet ${isOpen ? 'open' : ''}`}>
                <div className="sheet-header">
                    <div className="sheet-drag-handle" />
                    <h3>Уведомления</h3>
                </div>

                <div className="sheet-content">
                    {isLoading ? (
                        <div className="empty-state">Загрузка...</div>
                    ) : myTeam?.joinRequests?.length ? (
                        <div className="requests-list">
                            <h5 className="section-subtitle">Новые заявки</h5>
                            {myTeam.joinRequests.map((req: TeamMember) => (
                                <div key={req.id} className="request-notification-card">
                                    <div className="request-message">
                                        <span className="user-name">{req.name || `Пользователь #${req.id}`}</span>
                                        {' '}хочет вступить к вам в команду
                                    </div>

                                    <div className="request-actions">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => onViewProfile?.(String(req.id))}
                                        >
                                            Подробнее
                                        </Button>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            isLoading={actionLoadingId === String(req.id)}
                                            onClick={() => handleAccept(String(req.id))}
                                        >
                                            Принять
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">Новых заявок пока нет</div>
                    )}
                </div>
            </div>
        </>
    );
};
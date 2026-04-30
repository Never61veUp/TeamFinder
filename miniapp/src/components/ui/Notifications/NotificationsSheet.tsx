import React, { useState, useEffect } from 'react';
import { Button } from '../Button';
import { teamService } from '../../../types/api';
import { invitationsService } from '../../../services/invitations.service';
import { acceptJoinRequest } from '../../../services/feed.service';
import type { Team } from '../../../types/api';
import './notifications.css';

interface NotificationsSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onViewProfile?: (id: string) => void;
}

export const NotificationsSheet: React.FC<NotificationsSheetProps> = ({ isOpen, onClose}) => {
    const [myTeam, setMyTeam] = useState<Team | null>(null);
    const [personalInvites, setPersonalInvites] = useState<any[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            try {
                const teamData = await teamService.getMyTeam();
                setMyTeam(teamData);
            } catch (e) {
                setMyTeam(null);
            }

            const invitesData = await invitationsService.getInvitations(0);
            setPersonalInvites(Array.isArray(invitesData) ? invitesData : []);

        } catch (error) {
            console.error('Ошибка загрузки уведомлений:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAcceptJoinRequest = async (targetId: string) => {
        if (!myTeam) return;
        setActionLoadingId(`join_${targetId}`);
        try {
            await acceptJoinRequest(myTeam.id, targetId);
            await loadData();
        } catch (error) {
            alert('Ошибка при принятии заявки');
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleAcceptInvite = async (invitationId: string) => {
        setActionLoadingId(`invite_${invitationId}`);
        try {
            await invitationsService.acceptInvitation(invitationId);
            alert('Вы успешно вступили в команду!');
            await loadData();
            onClose(); // Закрываем шторку, т.к. статус изменился
        } catch (error) {
            alert('Ошибка при принятии приглашения');
        } finally {
            setActionLoadingId(null);
        }
    };

    const hasAnyNotifications = myTeam?.joinRequests?.length || personalInvites.length > 0;

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
                    ) : hasAnyNotifications ? (
                        <div className="requests-list">

                            {/* Секция: Вас пригласили в команду */}
                            {personalInvites.length > 0 && (
                                <>
                                    <h5 className="section-subtitle">Вас пригласили</h5>
                                    {personalInvites.map((invite) => (
                                        <div key={invite.id} className="request-notification-card">
                                            <div className="request-message">
                                                Команда <span className="user-name">{invite.teamName || 'Неизвестная'}</span>{' '}
                                                приглашает вас присоединиться
                                            </div>
                                            <div className="request-actions">
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    isLoading={actionLoadingId === `invite_${invite.id}`}
                                                    onClick={() => handleAcceptInvite(invite.id)}
                                                >
                                                    Принять инвайт
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}

                            {/* Секция: Хотят вступить в вашу команду */}
                            {myTeam?.joinRequests?.length ? (
                                <>
                                    <h5 className="section-subtitle" style={{ marginTop: '16px' }}>Заявки в вашу команду</h5>
                                    {myTeam.joinRequests.map((req: any) => {
                                        const effectiveId = String(req.profileId || req.id || "");
                                        return (
                                            <div key={effectiveId} className="request-notification-card">
                                                <div className="request-message">
                                                    <span className="user-name">
                                                        {req.name || `Пользователь #${effectiveId.slice(0, 8)}`}
                                                    </span>
                                                    {' '}хочет вступить к вам в команду
                                                </div>
                                                <div className="request-actions">
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        isLoading={actionLoadingId === `join_${effectiveId}`}
                                                        onClick={() => handleAcceptJoinRequest(effectiveId)}
                                                    >
                                                        Принять
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            ) : null}

                        </div>
                    ) : (
                        <div className="empty-state">Новых уведомлений пока нет</div>
                    )}
                </div>
            </div>
        </>
    );
};
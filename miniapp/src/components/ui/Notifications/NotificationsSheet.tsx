import React, {useEffect, useState} from 'react';
import {Button} from '../Button';
import type {Team} from '../../../types/api';
import {teamService} from '../../../types/api';
import {invitationsService} from '../../../services/invitations.service';
import {acceptJoinRequest} from '../../../services/feed.service';
import './notifications.css';

interface NotificationsSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onViewProfile?: (id: string) => void;
}

export const NotificationsSheet: React.FC<NotificationsSheetProps> = ({ isOpen, onClose}) => {
    const [myTeam, setMyTeam] = useState<Team | null>(null);
    const [personalInvitesTeams, setPersonalInvitesTeams] = useState<Record<string, Team>>({});
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
            const invitesArray = Array.isArray(invitesData) ? invitesData : [];
            setPersonalInvites(invitesArray);

            const teamsInfo: Record<string, Team> = {};
            for (const invite of invitesArray) {
                if (invite.teamId && !teamsInfo[invite.teamId]) {
                    try {
                        teamsInfo[invite.teamId] = await teamService.getTeam(invite.teamId);
                    } catch (err) {
                        console.error(`Не удалось загрузить команду ${invite.teamId}`, err);
                    }
                }
            }
            setPersonalInvitesTeams(teamsInfo);

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
            onClose();
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
                            {personalInvites.map((invite) => {
                                const teamInfo = personalInvitesTeams[invite.teamId];
                                if (!teamInfo) return null; // Или скелетон

                                return (
                                    <div key={invite.id} className="request-notification-card">
                                        <div className="request-message">
                                            Команда <span className="user-name">{teamInfo.name}</span> приглашает вас
                                        </div>

                                        {/* Название мероприятия */}
                                        {teamInfo.eventDetails?.title && (
                                            <div className="team-event-badge">
                                                {teamInfo.eventDetails.title}
                                            </div>
                                        )}

                                        {/* Полное описание (убрали slice) */}
                                        {teamInfo.description && (
                                            <div className="team-full-desc">
                                                {teamInfo.description}
                                            </div>
                                        )}

                                        {/* Теги/Стек технологий */}
                                        {teamInfo.eventDetails?.tags && teamInfo.eventDetails.tags.length > 0 && (
                                            <div className="team-tags-row">
                                                {teamInfo.eventDetails.tags.map((tag: any) => (
                                                    <span key={tag.id} className="team-mini-tag">#{tag.name}</span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Информация о свободных местах */}
                                        <div className="team-meta-info">
                                            Участников: {teamInfo.members?.length || 0} / {teamInfo.maxMembers}
                                        </div>

                                        <div className="request-actions">
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                isLoading={actionLoadingId === `invite_${invite.id}`}
                                                onClick={() => handleAcceptInvite(invite.id)}
                                            >
                                                Принять заявку
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}

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
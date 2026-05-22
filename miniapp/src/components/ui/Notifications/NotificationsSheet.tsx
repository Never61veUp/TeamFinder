import React, { useEffect, useState } from 'react';
import { Button } from '../Button';
import type { Team } from '../../../types/api';
import { useNotifications } from './NotificationContext';
import { invitationsService } from '../../../services/invitations.service';
import { acceptJoinRequest } from '../../../services/feed.service';
import { httpClient } from '../../../lib/http-client';
import './notifications.css';
import { teamService } from "../../../services/team.service.ts";

interface NotificationsSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onViewProfile?: (id: string) => void;
}

export const NotificationsSheet: React.FC<NotificationsSheetProps> = ({ isOpen, onClose }) => {
    const [myTeam, setMyTeam] = useState<Team | null>(null);
    const [personalInvitesTeams, setPersonalInvitesTeams] = useState<Record<string, Team>>({});
    const [personalInvites, setPersonalInvites] = useState<any[]>([]);
    const [requestsProfiles, setRequestsProfiles] = useState<Record<string, any>>({});
    const { markAsRead, loadData: loadDataFromContext } = useNotifications();
    const [isLoading, setIsLoading] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const loadData = async () => {
        setIsLoading(true);
        console.log('=== ДЕБАГ: Начало загрузки уведомлений ===');
        try {
            let currentTeam: Team | null = null;
            try {
                const teamData = await teamService.getMyTeam();
                console.log('1. Моя команда из API:', teamData);
                console.log('2. Список заявок в команду (joinRequests):', teamData?.joinRequests);
                setMyTeam(teamData);
                currentTeam = teamData;
            } catch (e) {
                console.error('Ошибка запроса команды:', e);
                setMyTeam(null);
            }

            const invitesData = await invitationsService.getInvitations(0);
            console.log('3. Инвайты из API (invitesData):', invitesData);

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

            const requests = currentTeam?.joinRequests;

            if (requests && requests.length > 0) {
                const profilesMap: Record<string, any> = { ...requestsProfiles };

                await Promise.all(
                    requests.map(async (req: any) => {
                        const profileId = String(req.profileId || req.id || "");
                        if (profileId && !profilesMap[profileId]) {
                            try {
                                const res = await httpClient.get(`/profiles/${profileId}`);
                                profilesMap[profileId] = (res as any).data || res;
                            } catch (err) {
                                console.error(`Ошибка загрузки профиля заявки ${profileId}`, err);
                            }
                        }
                    })
                );
                setRequestsProfiles(profilesMap);
            }

        } catch (error) {
            console.error('Критическая ошибка в loadData:', error);
        } finally {
            setIsLoading(false);
            console.log('=== ДЕБАГ: Конец загрузки уведомлений ===');
        }
    };

    useEffect(() => {
        const initSheet = async () => {
            if (isOpen) {
                await loadData();
                markAsRead();
            }
        };
        initSheet();
    }, [isOpen]);

    const handleAcceptJoinRequest = async (targetId: string) => {
        if (!myTeam) return;
        setActionLoadingId(`join_${targetId}`);
        try {
            await acceptJoinRequest(myTeam.id, targetId);
            await loadData();
            if (loadDataFromContext) await loadDataFromContext();
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
            if (loadDataFromContext) await loadDataFromContext();
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

                            {personalInvites.map((invite) => {
                                const teamInfo = personalInvitesTeams[invite.teamId];
                                if (!teamInfo) return null;

                                return (
                                    <div key={invite.id} className="request-notification-card">
                                        <div className="request-message">
                                            Команда <span className="user-name">{teamInfo.name}</span> приглашает вас
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

                            {myTeam?.joinRequests?.length ? (
                                <>
                                    <h5 className="section-subtitle" style={{ marginTop: '16px' }}>Заявки в вашу команду</h5>
                                    {myTeam.joinRequests.map((req: any) => {
                                        const effectiveId = String(req.profileId || req.id || "");
                                        const profileData = requestsProfiles[effectiveId];
                                        const name = profileData?.telegramUser?.firstName || profileData?.firstName || profileData?.name;
                                        const username = profileData?.userName;
                                        const displayName = name && username
                                            ? `${name} (@${username})`
                                            : username
                                                ? `@${username}`
                                                : name || `Пользователь #${effectiveId.slice(0, 8)}`;

                                        return (
                                            <div key={effectiveId} className="request-notification-card">
                                                <div className="request-message">
                                                    <span className="user-name">
                                                        {displayName}
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
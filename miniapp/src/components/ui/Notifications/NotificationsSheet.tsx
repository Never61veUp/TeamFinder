import React, { useState, useEffect } from 'react';
import { Button } from '../Button';
import { teamService } from '../../../types/api';
import { acceptJoinRequest } from '../../../services/feed.service';
import type { Team, TeamMember } from '../../../types/api';
import './notifications.css';

interface NotificationsSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationsSheet: React.FC<NotificationsSheetProps> = ({ isOpen, onClose }) => {
    const [myTeam, setMyTeam] = useState<Team | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState<string | number | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadMyTeam();
        }
    }, [isOpen]);

    const loadMyTeam = async () => {
        setIsLoading(true);
        try {
            const data = await teamService.getMyTeam();
            setMyTeam(data);
        } catch (error) {
            console.error('Ошибка загрузки команды:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAcceptMember = async (requestedProfileId: string) => {
        if (!myTeam) return;

        setActionLoadingId(requestedProfileId);
        try {
            // Вызов API принятия
            await acceptJoinRequest(myTeam.id, requestedProfileId);

            await loadMyTeam();
            alert('Участник успешно добавлен в команду!');
        } catch (error) {
            console.error('Ошибка принятия заявки:', error);
            alert('Не удалось принять заявку');
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
                        <div className="empty-state">Загрузка данных...</div>
                    ) : myTeam ? (
                        <div className="team-notifications-info">
                            <h4 className="team-name-header">{myTeam.name}</h4>
                            <p className="team-status-text">
                                Участники: {myTeam.currentMembers} / {myTeam.maxMembers}
                            </p>

                            <div className="requests-section">
                                <h5>Заявки и участники</h5>
                                {myTeam.members && myTeam.members.length > 0 ? (
                                    myTeam.members.map((member: TeamMember) => (
                                        <div key={member.id} className="member-request-card">
                                            <div className="member-avatar-circle">
                                                {member.initials}
                                            </div>
                                            <div className="member-info">
                                                <span className="member-id">ID: {member.id}</span>
                                            </div>

                                            <Button
                                                variant="primary"
                                                size="sm"
                                                isLoading={actionLoadingId === String(member.id)}
                                                onClick={() => handleAcceptMember(String(member.id))}
                                            >
                                                Принять
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">Заявок пока нет</div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">У вас пока нет уведомлений</div>
                    )}
                </div>
            </div>
        </>
    );
};
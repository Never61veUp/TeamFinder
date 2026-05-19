import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { teamService } from '../../../services/team.service';
import { invitationsService } from '../../../services/invitations.service';
import type { Team } from '../../../types/api';

interface NotificationContextType {
    hasUnread: boolean;
    myTeam: Team | null;
    personalInvites: any[];
    personalInvitesTeams: Record<string, Team>;
    isLoading: boolean;
    loadData: () => Promise<void>;
    markAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [myTeam, setMyTeam] = useState<Team | null>(null);
    const [personalInvites, setPersonalInvites] = useState<any[]>([]);
    const [personalInvitesTeams, setPersonalInvitesTeams] = useState<Record<string, Team>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);

    const currentIdsRef = useRef<string[]>([]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            let teamData: Team | null = null;
            try {
                teamData = await teamService.getMyTeam();
            } catch {
            }
            setMyTeam(teamData);

            const invitesData = await invitationsService.getInvitations(0).catch(() => []);
            const invitesArray = Array.isArray(invitesData)
                ? invitesData
                : (invitesData as any)?.items || (invitesData as any)?.data || [];

            setPersonalInvites(invitesArray);

            const currentIds: string[] = [
                ...(teamData?.joinRequests || []).map((r: any) => `join_${r.profileId || r.id}`),
                ...invitesArray.map((i: any) => `invite_${i.id || i.inviteeId || i.teamId}`)
            ];
            currentIdsRef.current = currentIds;

            const teamsInfo = { ...personalInvitesTeams };
            for (const invite of invitesArray) {
                const tId = invite.teamId || invite.team?.id;
                if (tId && !teamsInfo[tId]) {
                    try {
                        teamsInfo[tId] = await teamService.getTeam(tId);
                    } catch (err) {
                        console.error(`Ошибка загрузки команды ${tId}:`, err);
                    }
                }
            }
            setPersonalInvitesTeams(teamsInfo);

            if (currentIds.length === 0) {
                setHasUnread(false);
            } else {
                const seenIds: string[] = JSON.parse(localStorage.getItem('seen_notif_ids') || '[]');
                setHasUnread(currentIds.some(id => !seenIds.includes(id)));
            }

        } catch (error) {
            console.error('Ошибка провайдера уведомлений:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = () => {
        if (currentIdsRef.current.length > 0) {
            localStorage.setItem('seen_notif_ids', JSON.stringify(currentIdsRef.current));
        }
        setHasUnread(false);
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <NotificationContext.Provider value={{
            hasUnread,
            myTeam,
            personalInvites,
            personalInvitesTeams,
            isLoading,
            loadData,
            markAsRead
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
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

const NotificationContext = createContext<NotificationContextType>({
    hasUnread: false,
    myTeam: null,
    personalInvites: [],
    personalInvitesTeams: {},
    isLoading: false,
    loadData: async () => {},
    markAsRead: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [myTeam, setMyTeam] = useState<Team | null>(null);
    const [personalInvites, setPersonalInvites] = useState<any[]>([]);
    const [personalInvitesTeams, setPersonalInvitesTeams] = useState<Record<string, Team>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);

    const currentNotificationsRef = useRef<{ joinRequests: any[], invites: any[] }>({ joinRequests: [], invites: [] });

    const loadData = async () => {
        setIsLoading(true);
        try {
            let teamData: Team | null = null;
            try {
                teamData = await teamService.getMyTeam();
                setMyTeam(teamData);
            } catch (e) {
                setMyTeam(null);
            }

            const invitesData = await invitationsService.getInvitations(0);
            const invitesArray = Array.isArray(invitesData) ? invitesData : [];
            setPersonalInvites(invitesArray);

            currentNotificationsRef.current = {
                joinRequests: teamData?.joinRequests || [],
                invites: invitesArray
            };

            const teamsInfo: Record<string, Team> = {};
            for (const invite of invitesArray) {
                const tId = invite.teamId || invite.team?.id;
                if (tId && !teamsInfo[tId]) {
                    try {
                        teamsInfo[tId] = await teamService.getTeam(tId);
                    } catch (err) {
                        console.error(`Не удалось загрузить команду ${tId}:`, err);
                    }
                }
            }
            setPersonalInvitesTeams(teamsInfo);

            let currentIds: string[] = [];
            if (teamData && teamData.joinRequests && teamData.joinRequests.length) {
                currentIds = [...currentIds, ...teamData.joinRequests.map((r: any) => `join_${r.profileId || r.id}`)];
            }
            currentIds = [...currentIds, ...invitesArray.map(i => `invite_${i.id}`)];

            const seenIds = JSON.parse(localStorage.getItem('seen_notif_ids') || '[]');
            const hasNew = currentIds.some(id => !seenIds.includes(id));

            setHasUnread(hasNew);
        } catch (error) {
            console.error('Ошибка загрузки уведомлений:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = () => {
        const { joinRequests} = currentNotificationsRef.current;
        let currentIds: string[] = [];

        if (joinRequests.length) {
            currentIds = [...currentIds, ...joinRequests.map((r: any) => `join_${r.profileId || r.id}`)];
        }
        currentIds = [...currentIds, ...personalInvites.map(i => `invite_${i.id || i.inviteeId || i.teamId}`)];

        localStorage.setItem('seen_notif_ids', JSON.stringify(currentIds));
        setHasUnread(false);
    };
    useEffect(() => {
        loadData();

        const interval = setInterval(() => {
            loadData();
        }, 30000); // 30000 мс = 30 сек

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
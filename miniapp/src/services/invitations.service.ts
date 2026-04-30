import { httpClient } from '../lib/http-client';

export const invitationsService = {
    getInvitations: (status: number = 0) => {
        return httpClient.get<any[]>(`/invitations?invitationStatus=${status}`);
    },

    acceptInvitation: (invitationId: string) => {
        return httpClient.post(`/invitations/accept/${invitationId}`);
    },

    inviteToTeam: (teamId: string, inviteeId: string) => {
        return httpClient.post(`/teams/${teamId}/invitations/${inviteeId}`);
    }
};
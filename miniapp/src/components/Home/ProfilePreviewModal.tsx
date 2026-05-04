import React from 'react';
import { useProfile } from '../hooks/useProfile';
import { ProfileModal } from '../ui/ProfileModal/ProfileModal';

interface ProfilePreviewModalProps {
    profileId: string;
    onClose: () => void;
}

export const ProfilePreviewModal: React.FC<ProfilePreviewModalProps> = ({ profileId, onClose }) => {
    const { profile, isLoading } = useProfile(profileId);

    return (
        <ProfileModal
            profile={profile}
            isLoading={isLoading}
            onClose={onClose}
        />
    );
};
import React from 'react';
import { Bell } from 'lucide-react';
import '../profile.css';

interface HeaderProps {
    name: string;
    username: string;
    avatarUrl?: string | null;
    onNotificationClick?: () => void;
}

export const ProfileHeader: React.FC<HeaderProps> = ({
                                                         name,
                                                         username,
                                                         avatarUrl,
                                                         onNotificationClick
                                                     }) => {
    const initials = name
        ? name.split(' ').map(n => n[0]).join('').toUpperCase()
        : 'U';

    return (
        <div className="profile-header">
            <button
                className="profile-bell-btn"
                onClick={onNotificationClick}
                type="button"
            >
                <Bell size={24} color="white" />
            </button>

            <div className="avatar-container">
                {avatarUrl ? (
                    <img src={avatarUrl} alt={name} className="avatar-img" />
                ) : (
                    <div className="avatar-placeholder">{initials}</div>
                )}
            </div>
            <h1 className="profile-name">{name}</h1>
            <p className="profile-username">{username}</p>
        </div>
    );
};
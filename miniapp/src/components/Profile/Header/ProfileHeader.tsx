import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { NotificationsSheet } from '../../ui/Notifications/NotificationsSheet'; // Путь может отличаться в зависимости от вашей структуры
import '../profile.css';

interface HeaderProps {
    name: string;
    username: string;
    avatarUrl?: string | null;
}

export const ProfileHeader: React.FC<HeaderProps> = ({ name, username, avatarUrl }) => {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

    return (
        <div className="profile-header">
            {/* Кнопка колокольчика внутри фиолетовой зоны */}
            <button
                className="profile-bell-btn"
                onClick={() => setIsNotificationsOpen(true)}
            >
                <Bell size={24} color="white" />
                {/*<span className="bell-dot"></span>*/}
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

            {/* Шторка уведомлений */}
            <NotificationsSheet
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
            />
        </div>
    );
};
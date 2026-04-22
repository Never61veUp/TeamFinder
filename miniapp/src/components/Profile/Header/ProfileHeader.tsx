import React from 'react';

interface HeaderProps {
    name: string;
    username: string;
    avatarUrl?: string;
}

export const ProfileHeader: React.FC<HeaderProps> = ({ name, username, avatarUrl }) => {

    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

    return (
        <div className="profile-header">
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
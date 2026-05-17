import React from 'react';
import { useNotifications } from '../Notifications/NotificationContext';
import './header.css';

interface HeaderProps {
    title: string;
    onNotificationClick?: () => void;
    children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, onNotificationClick, children }) => {
    const { hasUnread } = useNotifications();

    return (
        <header className="team-header flex flex-col w-full">
            <div className="team-header-content flex items-center justify-between w-full">
                <h1 className="team-title">{title}</h1>
                <button
                    className="notification-btn"
                    onClick={onNotificationClick}
                    type="button"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    {hasUnread && <div className="notification-badge"></div>}
                </button>
            </div>

            {children && (
                <div className="header-profile-block flex flex-col items-center justify-center w-full mt-2 pb-6 animate-fade-in">
                    {children}
                </div>
            )}
        </header>
    );
};
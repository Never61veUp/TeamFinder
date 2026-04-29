import React from 'react'
import './header.css';

interface HeaderProps {
    title: string,
    onNotificationClick?: () => void
}

export const Header: React.FC<HeaderProps> = ({title, onNotificationClick}) => {

    return (
        <header className="team-header">
            <div className="team-header-content">
                <h1 className="team-title">{title}</h1>
                <button
                    className="notification-btn"
                    onClick={onNotificationClick}
                    type="button"
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                </button>
            </div>
        </header>
    );
};
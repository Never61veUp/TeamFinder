import React from 'react';
import { UserProfile } from '../../../types/profile';

interface GithubStatsProps {
    stats: UserProfile['githubStats'];
}

export const GithubStats: React.FC<GithubStatsProps> = ({ stats }) => {
    const statCards = [
        { label: 'Repositories', value: stats.repositories, icon: '📁' },
        { label: 'Stars', value: stats.stars, icon: '⭐' },
        { label: 'Pull Requests', value: stats.pullRequests, icon: '🔀' },
        { label: 'Top Language', value: stats.topLanguage, icon: '💻' },
        { label: 'Issues', value: stats.issues, icon: '❗' },
        { label: 'Followers', value: stats.followers, icon: '👥' },
    ];

    return (
        <section className="profile-section">
            <h2>GitHub Статистика</h2>
            <div className="stats-grid">
                {statCards.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <span className="stat-icon">{stat.icon}</span>
                        <span className="stat-label">{stat.label}</span>
                        <span className="stat-value">{stat.value}</span>
                    </div>
                ))}
            </div>
        </section>
    );
};
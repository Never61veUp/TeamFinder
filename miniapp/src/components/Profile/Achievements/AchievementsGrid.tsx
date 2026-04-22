import React from 'react';
import type { UserProfile } from '../../../types/profile';

interface AchievementsProps {
    achievements: UserProfile['achievements'];
}

export const AchievementsGrid: React.FC<AchievementsProps> = ({ achievements }) => {
    const items = [
        { label: 'Хакатоны', value: achievements.hackathons },
        { label: 'Победы', value: achievements.wins },
        { label: 'Проекты', value: achievements.projects },
    ];

    return (
        <section className="profile-section">
            <h2>Достижения</h2>
            <div className="achievements-row">
                {items.map((item, index) => (
                    <div key={index} className="achievement-card">
                        <span className="achievement-value">{item.value}</span>
                        <span className="achievement-label">{item.label}</span>
                    </div>
                ))}
            </div>
        </section>
    );
};
import React from 'react';

interface SkillsProps {
    skills: string[];
}

export const SkillTags: React.FC<SkillsProps> = ({ skills }) => {
    return (
        <section className="profile-section">
            <div className="section-header">
                <h2>Навыки</h2>
            </div>
            <div className="skills-list">
                {skills.map((skill, index) => (
                    <span key={index} className="skill-tag">
                        {skill}
                    </span>
                ))}
            </div>
        </section>
    );
};
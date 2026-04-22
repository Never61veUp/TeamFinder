import React from 'react';

interface AboutProps {
    text: string;
}

export const AboutMe: React.FC<AboutProps> = ({ text }) => {
    return (
        <section className="profile-section">
            <h2>О себе</h2>
            <div className="about-card">
                <p>{text}</p>
            </div>
        </section>
    );
};
import React from 'react';
import '../profile.css';

interface AboutProps {
    text: string;
    isEditing?: boolean;
    onChange?: (value: string) => void;
}

export const AboutMe: React.FC<AboutProps> = ({ text, isEditing = false, onChange }) => {
    return (
        <section className="profile-section">
            <h2>Обо мне</h2>
            <div className="about-card">
                {!isEditing ? (
                    <p className="about-text">{text || 'Расскажите о себе'}</p>
                ) : (
                    <textarea
                        value={text}
                        onChange={(e) => onChange?.(e.target.value)}
                        className="about-textarea"
                        rows={4}
                    />
                )}
            </div>
        </section>
    );
};

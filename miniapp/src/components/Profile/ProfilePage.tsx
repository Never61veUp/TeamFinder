import React from 'react';
import {ProfileHeader} from './Header/ProfileHeader';
import {SkillTags} from './Skills/SkillTags';
import {GithubStats} from './Stats/GithubStats';
import {AboutMe} from './About/AboutMe';
import {AchievementsGrid} from './Achievements/AchievementsGrid';
import type {UserProfile} from '../../types/profile';
import './Profile.css';
import type {TelegramUser} from "../../api.ts";

// Оставляем mockUser как запасной вариант для полей, которых нет в TelegramUser
const mockUser: UserProfile = {
    name: 'Александр Петров',
    username: '@alexanderpetrov',
    skills: ['React', 'TypeScript', 'Node.js', 'Python', 'UI/UX Design'],
    about: 'Фулстек-разработчик с опытом работы над веб-приложениями. Люблю создавать интуитивные пользовательские интерфейсы и участвовать в хакатонах. Ищу команду для создания крутого проекта!',
    githubStats: {
        repositories: 19,
        stars: 1,
        pullRequests: 45,
        topLanguage: 'Python',
        issues: 12,
        followers: 30,
    },
    achievements: {
        hackathons: 12,
        wins: 5,
        projects: 8,
    }
};

interface ProfilePageProps {
    user: TelegramUser;
    onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onLogout }) => {

    const fullName = `${user.firstName} ${user.lastName ?? ''}`.trim();

    return (
        <div className="profile-container">
            <ProfileHeader
                name={fullName}
                username={user.username ? `@${user.username}` : mockUser.username}
                avatarUrl={user.photoUrl ?? undefined}
            />

            <div className="profile-content">
                {/* Пока используем mockUser для скиллов и статистики, так как в TelegramUser их нет */}
                <SkillTags skills={mockUser.skills}/>
                <GithubStats stats={mockUser.githubStats}/>
                <AboutMe text={mockUser.about}/>
                <AchievementsGrid achievements={mockUser.achievements}/>

                {/* Добавляем кнопку выхода, раз мы передали onLogout */}
                <button
                    onClick={onLogout}
                    className="mt-4 w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold border border-red-100 active:bg-red-100 transition-colors"
                >
                    Выйти из аккаунта
                </button>
            </div>
        </div>
    );
};
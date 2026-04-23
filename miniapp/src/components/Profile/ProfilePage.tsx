import React, { useState } from 'react';
import axios from 'axios';
import { ProfileHeader } from './Header/ProfileHeader';
import { SkillTags } from './Skills/SkillTags';
import { GithubStats } from './Stats/GithubStats';
import { AboutMe } from './About/AboutMe';
import { AchievementsGrid } from './Achievements/AchievementsGrid';
import './Profile.css';
import type { TelegramUser } from "../../api.ts";

interface ExtendedUser extends TelegramUser {
    about?: string | null;
    skills?: string[] | null;
    githubUsername?: string | null;
}

declare global {
    interface Window {
        Telegram?: {
            WebApp: {
                initData: string; //
                ready: () => void;
                expand: () => void;
                openLink: (url: string) => void;
            };
        };
    }
}

const mockUser = {
    skills: ['React', 'TypeScript', 'Node.js'],
    about: 'Фулстек-разработчик. Ищу команду!',
    achievements: { hackathons: 12, wins: 5, projects: 8 },
    githubStats: {
        repositories: 19, stars: 1, pullRequests: 45,
        topLanguage: 'Python', issues: 12, followers: 30,
    }
};

interface ProfilePageProps {
    user: ExtendedUser;
    onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onLogout }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [aboutText, setAboutText] = useState(user.about ?? mockUser.about);
    const [achievements, setAchievements] = useState(mockUser.achievements);
    const [skills, setSkills] = useState<string[]>(user.skills ?? mockUser.skills);

    const handleAchievementChange = (key: 'hackathons' | 'wins' | 'projects', value: number) => {
        setAchievements(prev => ({...prev, [key]: value}));
    };

    const fullName = `${user.firstName} ${user.lastName ?? ''}`.trim();
    const isGithubConnected = !!user.githubUsername;

    const handleSave = async () => {
        if (isEditing) {
            try {
                await axios.patch(`/api/profiles/${user.id}`, {
                    about: aboutText,
                    skills: skills,
                    achievements: achievements // Не забываем сохранять достижения
                });
            } catch (err) {
                console.error("Ошибка сохранения:", err);
            }
        }
        setIsEditing(!isEditing);
    };

    // Обновленная логика подключения GitHub согласно API
    const handleConnectGithub = async (e: React.MouseEvent) => {
        e.preventDefault();

        try {
            // 1. Получаем URL для авторизации от бэкенда
            const response = await axios.get('https://api.teamfinder.mixdev.me/api/github/login');
            const authUrl = response.data.url || response.data; // Зависит от того, возвращает ли сервер объект {url: ...} или просто строку

            // 2. Открываем ссылку
            if (window.Telegram?.WebApp) {
                // В Telegram Mini App используем встроенный метод
                window.Telegram.WebApp.openLink(authUrl);
            } else {
                // В обычном браузере делаем редирект
                window.location.href = authUrl;
            }
        } catch (err) {
            console.error("Ошибка при инициализации GitHub Login:", err);
            alert("Не удалось инициировать подключение к GitHub. Попробуйте позже.");
        }
    };

    return (
        <div className="profile-container pb-24 bg-white">
            <ProfileHeader
                name={fullName}
                username={user.username ? `@${user.username}` : ''}
                avatarUrl={user.photoUrl ?? undefined}
            />

            <div className="profile-content px-4 space-y-4">
                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        className={`px-8 py-2 rounded-2xl font-bold transition-all text-sm border-2 shadow-sm ${
                            isEditing
                                ? 'bg-green-500 border-green-500 text-white shadow-green-200'
                                : 'bg-white border-violet-600 text-violet-600'
                        }`}
                    >
                        {isEditing ? '✅ Сохранить' : '✎ Редактировать'}
                    </button>
                </div>

                <div className="space-y-10">
                    <section className="w-full flex flex-col items-center">
                        {isEditing ? (
                            <div className="w-full text-center bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                <label className="text-[16px] text-gray-400 font-black uppercase mb-2 block tracking-widest text-center">Навыки</label>
                                <input
                                    className="w-full p-3 border-2 border-violet-100 rounded-xl outline-none focus:border-violet-500 bg-white"
                                    value={skills.join(', ')}
                                    onChange={(e) => setSkills(e.target.value.split(',').map(s => s.trim()))}
                                />
                            </div>
                        ) : (
                            <div className="w-full">
                                <SkillTags skills={skills.length > 0 ? skills : ['Навыки не указаны']}/>
                            </div>
                        )}
                    </section>

                    <section className="w-full flex flex-col items-center">
                        {isEditing ? (
                            <div className="w-full text-left bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                <label className="text-[16px] text-gray-400 font-black uppercase mb-2 block tracking-widest text-center">О себе</label>
                                <textarea
                                    className="w-full p-3 border-2 border-violet-100 rounded-xl min-h-30 outline-none focus:border-violet-500 bg-white"
                                    value={aboutText}
                                    onChange={(e) => setAboutText(e.target.value)}
                                />
                            </div>
                        ) : (
                            <AboutMe text={aboutText}/>
                        )}
                    </section>

                    <section className="w-full flex flex-col items-center">
                        <AchievementsGrid
                            achievements={achievements}
                            isEditing={isEditing}
                            onChange={handleAchievementChange}
                        />
                    </section>

                    <section className="w-full flex flex-col items-center">
                        <h2 className="font-bold text-[#333333] mb-4 text-center text-[16px] uppercase tracking-widest">GitHub Статистика</h2>
                        {isGithubConnected ? (
                            <GithubStats stats={mockUser.githubStats} />
                        ) : (
                            <button
                                type="button"
                                onClick={handleConnectGithub}
                                className="w-full py-12 border-2 border-dashed border-gray-100 rounded-3xl text-gray-400 flex flex-col items-center gap-2 hover:border-violet-200 hover:bg-violet-50 transition-all"
                            >
                                <span className="text-4xl text-gray-200">＋</span>
                                <span className="font-medium text-sm">Подключить GitHub</span>
                            </button>
                        )}
                    </section>

                    <div className="flex justify-center pt-8">
                        <button
                            onClick={(e) => { e.preventDefault(); onLogout(); }}
                            className="px-6 py-1.5 border border-red-200 text-red-400 text-[10px] font-black rounded-lg uppercase tracking-widest hover:bg-red-50 transition-colors"
                        >
                            Выйти из аккаунта
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
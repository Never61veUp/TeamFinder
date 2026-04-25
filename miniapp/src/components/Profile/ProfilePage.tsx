import React, { useEffect, useState } from 'react';
import { ProfileHeader } from './Header/ProfileHeader';
import { AboutMe } from './About/AboutMe';
import { AchievementsGrid } from './Achievements/AchievementsGrid';
import type { TelegramUser } from "../../types/api";
import { useProfile } from "../hooks/useProfile";
import { useGithub } from "../hooks/useGithub";
import { GithubStatsSection } from "./Stats/GithubStats";
import { SkillsList } from "./Skills/SkillTags";
import './profile.css';
import { profileService } from '../../services';
import { Pencil } from 'lucide-react';


const HARD_SKILLS: string[] = [
    'JavaScript','TypeScript','React','Redux','Next.js','Node.js','Express','NestJS',
    'HTML','CSS','Sass','Tailwind CSS','Webpack','Vite','Babel','GraphQL','REST',
    'Postgres','MySQL','MongoDB','Docker','Kubernetes','AWS','GCP','Azure',
    'Python','Django','Flask','Go','C#','Java','PHP','Laravel','Ruby','Rails',
    'Git','CI/CD','Jest','Testing Library','Cypress','Storybook','Figma','UI/UX'
];

interface Props {
    user: TelegramUser;
    onLogout: () => void;
}

export const ProfilePage: React.FC<Props> = ({ user, onLogout }) => {
    const { profile, skills: allProfileSkills, isLoading, refetch } = useProfile(user?.profileId);
    const { isConnecting, connect } = useGithub();

    const [isEditing, setIsEditing] = useState(false);
    const [localAbout, setLocalAbout] = useState<string>('');
    const [localAchievements, setLocalAchievements] = useState<{
        hackathons: number | '';
        wins: number | '';
        projects: number | '';
    }>({
        hackathons: 0,
        wins: 0,
        projects: 0,
    });
    const [localSkills, setLocalSkills] = useState<string[]>([]);
    const [isSkillsEditorOpen, setIsSkillsEditorOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [skillsModalSelected, setSkillsModalSelected] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!profile) return;

        setLocalAbout((profile as any).about ?? '');
        setLocalAchievements({
            hackathons: (profile as any).hackathons ?? 0,
            wins: (profile as any).wins ?? 0,
            projects: (profile as any).projects ?? 0,
        });

        const initialNames = (allProfileSkills && allProfileSkills.length > 0)
            ? allProfileSkills.map(s => (s as any).name ?? (s as any).id ?? String(s))
            : (profile?.skills ?? []).map((s: any) => s.name ?? s.id ?? String(s));

        setLocalSkills(initialNames);

        const map: Record<string, boolean> = {};
        HARD_SKILLS.forEach(name => {
            map[name] = initialNames.includes(name);
        });
        setSkillsModalSelected(map);
    }, [profile, allProfileSkills]);

    const handleToggleEdit = () => {
        if (isEditing) {
            saveChanges();
        } else {
            setIsEditing(true);
        }
    };

    const saveChanges = async () => {
        const profileId = profile?.id ?? user?.profileId;
        if (!profileId) {
            alert('Не удалось сохранить: отсутствует идентификатор профиля.');
            return;
        }

        setIsSaving(true);

        try {
            const skillsMap: Record<string, string> = {};
            try {
                const allSkillsResponse = await profileService.getAllSkills?.();
                if (allSkillsResponse && Array.isArray(allSkillsResponse)) {
                    allSkillsResponse.forEach((s: any) => {
                        if (typeof s === 'string') {
                            skillsMap[s] = s;
                        } else if (s && s.id && s.name) {
                            skillsMap[s.name] = s.id;
                        }
                    });
                }
            } catch (e) {
                console.warn('saveChanges: Could not fetch skills map', e);
            }

            const skillIds = localSkills.map(name => skillsMap[name] ?? name);

            await profileService.updateProfile(profileId, {
                about: localAbout,
                hackathons: Number(localAchievements.hackathons) || 0,
                wins: Number(localAchievements.wins) || 0,
                projects: Number(localAchievements.projects) || 0,
                skills: skillIds as any,
            });

            setIsEditing(false);
        } catch (err) {
            console.warn('saveChanges: updateProfile failed', err);
            alert('Не удалось сохранить профиль на сервере.');
        } finally {
            setIsSaving(false);
            if (typeof refetch === 'function') {
                refetch().catch(rErr => console.warn('refetch failed', rErr));
            }
        }
    };

    const handleAchievementChange = (key: 'hackathons' | 'wins' | 'projects', value: number | '') => {
        setLocalAchievements(prev => ({ ...prev, [key]: value }));
    };

    const openSkillsEditor = () => {
        const map: Record<string, boolean> = {};
        HARD_SKILLS.forEach(name => {
            map[name] = localSkills.includes(name);
        });
        setSkillsModalSelected(map);
        setIsSkillsEditorOpen(true);
    };
    const closeSkillsEditor = () => setIsSkillsEditorOpen(false);

    const handleSkillsModalToggle = (name: string) => {
        setSkillsModalSelected(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const handleSkillsModalSave = () => {
        const selected = Object.keys(skillsModalSelected).filter(k => skillsModalSelected[k]);
        setLocalSkills(selected);
        setIsSkillsEditorOpen(false);
    };

    if (isLoading) {
        return <div className="profile-container"><div className="p-6">Загрузка...</div></div>;
    }

    return (
        <div className="profile-container pb-24 bg-white">
            <ProfileHeader
                name={user.username ?? 'User'}
                username={user.username ? `@${user.username}` : ''}
                avatarUrl={user.photoUrl}
            />

            <div className="profile-content px-4 space-y-4">
                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleToggleEdit}
                        className="edit-btn flex items-center gap-2"
                        disabled={isSaving}
                    >
                        {!isEditing && <Pencil size={18} strokeWidth={2} />}

                        <span>
                            {isEditing ? (isSaving ? 'Сохранение...' : 'Сохранить') : 'Редактировать'}
                        </span>
                    </button>
                </div>

                <SkillsList
                    skills={allProfileSkills ?? (profile?.skills ?? [])}
                    isEditing={isEditing}
                    onOpenEditor={openSkillsEditor}
                    selectedSkillIds={localSkills}
                />

                <AboutMe text={localAbout} isEditing={isEditing} onChange={setLocalAbout} />

                <AchievementsGrid
                    achievements={localAchievements}
                    isEditing={isEditing}
                    onChange={handleAchievementChange}
                />

                <section className="w-full flex flex-col items-left">
                    <h2 className="font-bold text-[#333] mb-4 text-left text-[16px]  tracking-widest">
                        GitHub Статистика
                    </h2>
                    <GithubStatsSection githubInfo={profile?.githubInfo} isConnecting={isConnecting} onConnect={connect} />
                </section>

                <div className="flex justify-center pt-8">
                    <button onClick={onLogout} className="text-red-400 text-sm font-bold">
                        Выйти
                    </button>
                </div>
            </div>

            {isSkillsEditorOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black opacity-40" onClick={closeSkillsEditor}></div>
                    <div className="relative bg-white rounded-2xl p-6 w-[90%] max-w-lg shadow-lg">
                        <h3 className="font-bold text-lg mb-3">Выберите навыки</h3>

                        <div className="max-h-64 overflow-auto grid grid-cols-2 gap-2">
                            {HARD_SKILLS.map(name => (
                                <label key={name} className="flex items-center gap-2 p-2 border rounded-md cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={!!skillsModalSelected[name]}
                                        onChange={() => handleSkillsModalToggle(name)}
                                    />
                                    <span className="text-sm">{name}</span>
                                </label>
                            ))}
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button className="px-4 py-2 rounded-md bg-gray-100" onClick={closeSkillsEditor}>Отмена</button>
                            <button
                                className="px-4 py-2 rounded-md bg-violet-600 text-white"
                                onClick={handleSkillsModalSave}
                                data-testid="skills-save-btn"
                            >
                                Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
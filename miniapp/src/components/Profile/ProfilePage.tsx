import React, { useEffect, useState } from 'react';
import { ProfileHeader } from './Header/ProfileHeader';
import { AboutMe } from './About/AboutMe';
import { AchievementsGrid } from './Achievements/AchievementsGrid';
import type {Skill, TelegramUser} from "../../types/api";
import { useProfile } from "../hooks/useProfile";
import { useGithub } from "../hooks/useGithub";
import { GithubStatsSection } from "./Stats/GithubStats";
import { SkillsList } from "./Skills/SkillTags";
import { TeamHistory } from './Review/TeamHistory';
import { ReviewList } from './Review/ReviewList';
import './profile.css';
import { profileService } from '../../services';
import { Pencil } from 'lucide-react';
import { Button } from "../ui/Button.tsx";

const HARD_SKILLS: string[] = ["Backend", "Programming", "Frontend", "React", "Python", "Jango"];

interface Props {
    user: TelegramUser;
    onLogout: () => void;
    onOpenNotif?: () => void;
}

export const ProfilePage: React.FC<Props> = ({ user, onLogout, onOpenNotif }) => {
    const { profile, skills: allProfileSkills, isLoading, refetch } = useProfile(user?.profileId);
    const { isConnecting, connect } = useGithub();

    const [isEditing, setIsEditing] = useState(false);
    const [localAbout, setLocalAbout] = useState<string>('');
    const [localAchievements, setLocalAchievements] = useState<{
        hackathons: number | '';
        wins: number | '';
        projects: number | '';
    }>({ hackathons: 0, wins: 0, projects: 0 });
    const [localSkills, setLocalSkills] = useState<string[]>([]);
    const [isSkillsEditorOpen, setIsSkillsEditorOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [skillsModalSelected, setSkillsModalSelected] = useState<Record<string, boolean>>({});
    const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
    const loadAvailableSkills = async () => {
        try {
            const response = await profileService.getAllSkills();
            setAvailableSkills(response);
        } catch (err) {
            console.error("Не удалось загрузить список навыков", err);
        }
    };

    useEffect(() => {
        loadAvailableSkills();
    }, []);

    useEffect(() => {
        if (!profile) return;
        setLocalAbout((profile as any).description ?? (profile as any).about ?? '');
        setLocalAchievements({
            hackathons: (profile as any).hackathons ?? 0,
            wins: (profile as any).wins ?? 0,
            projects: (profile as any).projects ?? 0,
        });
        const initialNames = (profile.skills ?? []).map((s: any) => s.name ?? String(s));
        setLocalSkills(initialNames);
        const map: Record<string, boolean> = {};
        HARD_SKILLS.forEach(name => { map[name] = initialNames.includes(name); });
        setSkillsModalSelected(map);
    }, [profile]);

    const handleRemoveSkill = (skillToRemove: string) => {
        setLocalSkills(prev => prev.filter(skill => skill !== skillToRemove));
        setSkillsModalSelected(prev => ({ ...prev, [skillToRemove]: false }));
    };

    const handleToggleEdit = () => {
        if (isEditing) saveChanges();
        else setIsEditing(true);
    };

    const saveChanges = async () => {
        setIsSaving(true);
        try {
            const skillIds = localSkills
                .map(localName => {
                    const found = availableSkills.find(s => s.name === localName);
                    return found ? found.id : null;
                })
                .filter((id): id is string => id !== null);

            const descriptionToSave = localAbout.trim() === "" ? "Пользователь пока ничего не рассказал о себе" : localAbout;

            await Promise.all([
                profileService.updateDescription(descriptionToSave),
                profileService.updateSkills(skillIds)
            ]);
            setIsEditing(false);
        } catch (err: any) {
            console.error("Ошибка при сохранении профиля", err);
            alert(err.message || "Не удалось сохранить изменения. Попробуйте позже.");
        } finally {
            setIsSaving(false);
            if (typeof refetch === 'function') await refetch();
        }
    };

    const handleAchievementChange = (key: 'hackathons' | 'wins' | 'projects', value: number | '') => {
        setLocalAchievements(prev => ({ ...prev, [key]: value }));
    };

    const openSkillsEditor = () => {
        const map: Record<string, boolean> = {};
        availableSkills.forEach(skill => {
            map[skill.name] = localSkills.includes(skill.name);
        });
        setSkillsModalSelected(map);
        setIsSkillsEditorOpen(true);
    };

    const closeSkillsEditor = () => setIsSkillsEditorOpen(false);

    const handleSkillsModalToggle = (name: string) => {
        setLocalSkills(prev =>
            prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
        );
        setSkillsModalSelected(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const handleSkillsModalSave = () => {
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
                onNotificationClick={onOpenNotif}
            />

            <div className="profile-content px-4 space-y-4">
                <div className="flex justify-end pt-4">
                    <Button size="sm" onClick={handleToggleEdit} className="edit-btn flex items-center gap-2" disabled={isSaving}>
                        {!isEditing && <Pencil size={18} strokeWidth={2} />}
                        <span>{isEditing ? (isSaving ? 'Сохранение...' : 'Сохранить') : 'Редактировать'}</span>
                    </Button>
                </div>

                {isEditing ? (
                    <div className="w-full flex flex-col items-left">
                        <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={openSkillsEditor} className="skills-btn-add px-4 py-2 text-sm font-medium text-violet-600 bg-violet-50 rounded-full hover:bg-violet-100 transition-colors">
                                + Добавить навык
                            </button>
                            {localSkills.map((skill) => (
                                <div key={skill} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-full bg-white text-sm shadow-sm">
                                    <span className="text-slate-800 font-medium">{skill}</span>
                                    <button type="button" onClick={() => handleRemoveSkill(skill)} className="skills-btn-cancel text-gray-400 hover:text-red-500 text-lg flex items-center justify-center transition-colors">
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <SkillsList skills={allProfileSkills ?? (profile?.skills ?? [])} isEditing={isEditing} onOpenEditor={openSkillsEditor} selectedSkillIds={localSkills} />
                )}

                <AboutMe text={localAbout} isEditing={isEditing} onChange={setLocalAbout} />
                <AchievementsGrid achievements={localAchievements} isEditing={isEditing} onChange={handleAchievementChange} />

                <section className="w-full flex flex-col items-left">
                    <h2 className="font-bold text-[#333] mb-4 text-left text-[16px] tracking-widest uppercase">GitHub Статистика</h2>
                    <GithubStatsSection githubInfo={profile?.githubInfo} isConnecting={isConnecting} onConnect={connect} />
                </section>

                {profile?.id && (
                    <ReviewList userId={profile.id} />
                )}

                {profile?.id && (
                    <TeamHistory currentUserId={profile.id} />
                )}

                <div className="flex justify-center pt-8">
                    <button onClick={onLogout} className="exit-btn text-red-500 text-sm font-bold">Выйти</button>
                </div>
            </div>

            {isSkillsEditorOpen && (
                <div className="fixed inset-0 z-1000 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black opacity-40" onClick={closeSkillsEditor}></div>
                    <div className="relative bg-white rounded-2xl p-6 w-[90%] max-w-120 shadow-lg">
                        <h3 className="font-bold text-lg mb-3 text-slate-800">Выберите навыки</h3>
                        <div className="max-h-64 overflow-auto grid grid-cols-2 gap-2 pr-2">
                            {availableSkills.map(skill => (
                                <label key={skill.id} className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-colors ${skillsModalSelected[skill.name] ? 'border-violet-500 bg-violet-50' : 'border-gray-100'}`}>
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 accent-violet-600"
                                        checked={!!skillsModalSelected[skill.name]}
                                        onChange={() => handleSkillsModalToggle(skill.name)}
                                    />
                                    <span className="text-sm font-medium text-slate-700">{skill.name}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button className="px-4 py-2 rounded-xl bg-gray-100 font-semibold text-gray-600" onClick={closeSkillsEditor}>Отмена</button>
                            <Button size="md" className="px-6 py-2 rounded-xl" onClick={handleSkillsModalSave}>Готово</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
import React from 'react';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Computer, CodeXml, Folder, Star, Target, Trophy, Layout } from 'lucide-react';
import type { ProfileWithGithub } from '../../../types/api';
import { ReviewList } from '../Review/ReviewList';
import './profile-modal.css';

interface ProfileModalProps {
    profile: ProfileWithGithub | any | null;
    onClose: () => void;
    isLoading?: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ profile, onClose, isLoading }) => {
    if (isLoading) {
        return (
            <div className="modal-overlay bottom" onClick={onClose}>
                <div className="modal-content-bottom flex items-center justify-center min-h-[300px]" onClick={e => e.stopPropagation()}>
                    <div className="font-bold text-violet-600 animate-pulse">Загрузка профиля...</div>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    const name = profile.name || "Пользователь";
    const initial = name[0]?.toUpperCase() || "?";

    return (
        <div className="modal-overlay bottom" onClick={onClose}>
            <div className="modal-content-bottom profile-detail-modal animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="modal-drag-handle" onClick={onClose} />

                <div className="profile-detail-header">
                    <div className="detail-avatar">{initial}</div>
                    <div>
                        <h2 className="detail-name">{name}</h2>
                        <p className="detail-username">@{profile.username || 'user'}</p>
                    </div>
                </div>

                <div className="detail-scroll-area">
                    <section className="detail-section mb-8">
                        <h4 className="detail-section-title">Навыки</h4>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills && profile.skills.length > 0 ? (
                                profile.skills.map((skill: any) => (
                                    <Badge key={skill.id} variant="secondary" className="px-3 py-1 font-bold">
                                        {skill.name}
                                    </Badge>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 italic">Навыки не указаны</p>
                            )}
                        </div>
                    </section>

                    <section className="detail-section mb-6">
                        <h4 className="detail-section-title">О себе</h4>
                        <p className="detail-description">{profile.description || "Нет описания."}</p>
                    </section>

                    {profile.githubInfo && (
                        <section className="github-card mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Computer size={18} className="text-emerald-400" />
                                <span className="font-bold text-sm">GitHub: {profile.githubInfo.username}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-white/10 rounded-2xl p-3 text-center">
                                    <Folder size={15} className="mx-auto mb-1 opacity-50" />
                                    <div className="text-lg font-bold">{profile.githubInfo.repositoriesCount}</div>
                                    <div className="text-[10px] uppercase opacity-50 font-bold">Репо</div>
                                </div>
                                <div className="bg-white/10 rounded-2xl p-3 text-center">
                                    <Star size={15} className="mx-auto mb-1 text-amber-400" />
                                    <div className="text-lg font-bold">{profile.githubInfo.totalStars}</div>
                                    <div className="text-[10px] uppercase opacity-50 font-bold">Звезды</div>
                                </div>
                                <div className="bg-white/10 rounded-2xl p-3 items-center text-center flex flex-col justify-center min-h-20">
                                    <CodeXml size={15} className="mb-1 text-emerald-400" />
                                    <div className="text-emerald-400 text-[10px] font-bold truncate w-full px-1">
                                        {profile.githubInfo.topLanguage || '---'}
                                    </div>
                                    <div className="text-[10px] uppercase opacity-50 font-bold mt-1">Язык</div>
                                </div>
                            </div>
                        </section>
                    )}

                    <div className="stats-grid mt-4">
                        <div className="stat-box">
                            <Target className="stat-icon text-blue-500" />
                            <div className="stat-value">{profile.hackathons || 0}</div>
                            <div className="stat-label">Хакатоны</div>
                        </div>
                        <div className="stat-box">
                            <Trophy className="stat-icon text-amber-500" />
                            <div className="stat-value">{profile.wins || 0}</div>
                            <div className="stat-label">Победы</div>
                        </div>
                        <div className="stat-box">
                            <Layout className="stat-icon text-emerald-500" />
                            <div className="stat-value">{profile.projects || 0}</div>
                            <div className="stat-label">Проекты</div>
                        </div>
                    </div>

                    <div className="mt-2 mb-6">
                        <ReviewList userId={profile.id} />
                    </div>

                </div>

                <Button variant="primary" className="detail-close-btn mt-auto" onClick={onClose}>
                    Закрыть
                </Button>
            </div>
        </div>
    );
};
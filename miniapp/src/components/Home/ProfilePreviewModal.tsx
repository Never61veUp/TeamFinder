import React from 'react';
import { useProfile } from '../hooks/useProfile';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Computer, CodeXml, Folder, Star, Target, Trophy, Layout } from 'lucide-react';

interface ProfilePreviewModalProps {
    profileId: string;
    onClose: () => void;
}

export const ProfilePreviewModal: React.FC<ProfilePreviewModalProps> = ({ profileId, onClose }) => {
    const { profile, isLoading } = useProfile(profileId);

    if (isLoading) {
        return (
            <div className="modal-overlay bottom" onClick={onClose}>
                <div className="modal-content-bottom flex items-center justify-center min-h-75" onClick={e => e.stopPropagation()}>
                    <div className="font-bold text-violet-600 animate-pulse">Загрузка профиля...</div>
                </div>
            </div>
        );
    }

    const name = profile?.name || "Пользователь";
    const initial = name[0].toUpperCase();
    const profileData = profile as any;

    return (
        <div className="modal-overlay bottom" onClick={onClose}>
            <div className="modal-content-bottom profile-detail-modal animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="modal-drag-handle" onClick={onClose} />

                <div className="profile-detail-header">
                    <div className="detail-avatar">{initial}</div>
                    <div>
                        <h2 className="detail-name">{name}</h2>
                        <p className="detail-username">@{profile?.username || 'user'}</p>
                    </div>
                </div>

                <div className="detail-scroll-area">
                    <section className="detail-section">
                        <section className="detail-section mb-8">
                            <h4 className="detail-section-title">Навыки</h4>
                            <div className="flex flex-wrap gap-2">
                                {profileData?.skills && profileData.skills.length > 0 ? (
                                    profileData.skills.map((skill: any) => (
                                        <Badge key={skill.id} variant="secondary" className="px-3 py-1 font-bold">
                                            {skill.name}
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-400 italic">Навыки не указаны</p>
                                )}
                            </div>
                        </section>

                        <h4 className="detail-section-title">О себе</h4>
                        <p className="detail-description">{profile?.description || "Нет описания."}</p>
                    </section>

                    {profileData?.githubInfo && (
                        <section className="github-card">
                            <div className="flex items-center gap-2 mb-4">
                                <Computer size={18} className="text-emerald-400" />
                                <span className="font-bold text-sm">GitHub: {profileData.githubInfo.username}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-white/10 rounded-2xl p-3 text-center">
                                    <Folder size={15} className="mx-auto mb-1 opacity-50" />
                                    <div className="text-lg font-bold">{profileData.githubInfo.repositoriesCount}</div>
                                    <div className="text-[10px] uppercase opacity-50 font-bold">Репо</div>
                                </div>
                                <div className="bg-white/10 rounded-2xl p-3 text-center">
                                    <Star size={15} className="mx-auto mb-1 text-amber-400" />
                                    <div className="text-lg font-bold">{profileData.githubInfo.totalStars}</div>
                                    <div className="text-[10px] uppercase opacity-50 font-bold">Звезды</div>
                                </div>
                                <div className="bg-white/10 rounded-2xl p-3 items-center text-center flex flex-col justify-center min-h-20">
                                    <CodeXml size={15} className="mb-1 text-emerald-400" />
                                    <div className="text-emerald-400 text-[10px] font-bold truncate w-full px-1">
                                        {profileData.githubInfo.topLanguage || '---'}
                                    </div>
                                    <div className="text-[10px] uppercase opacity-50 font-bold mt-1">Язык</div>
                                </div>
                            </div>
                        </section>
                    )}

                    <div className="stats-grid mt-4">
                        <div className="stat-box">
                            <Target className="stat-icon text-blue-500" />
                            <div className="stat-value">{profileData?.hackathons || 0}</div>
                            <div className="stat-label">Хакатоны</div>
                        </div>
                        <div className="stat-box">
                            <Trophy className="stat-icon text-amber-500" />
                            <div className="stat-value">{profileData?.wins || 0}</div>
                            <div className="stat-label">Победы</div>
                        </div>
                        <div className="stat-box">
                            <Layout className="stat-icon text-emerald-500" />
                            <div className="stat-value">{profileData?.projects || 0}</div>
                            <div className="stat-label">Проекты</div>
                        </div>
                    </div>
                </div>

                <Button variant="primary" className="detail-close-btn" onClick={onClose}>
                    Закрыть
                </Button>
            </div>
        </div>
    );
};
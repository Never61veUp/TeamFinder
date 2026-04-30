import { useState, useEffect, useMemo } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Header } from '../ui/Header/Header';
import { httpClient } from '../../lib/http-client';
import { teamService } from '../../types/api';
import type { Team } from '../../types/api';
import {
    LogOut, Trash2, Loader2, Target, Trophy,
    Layout
} from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import './team.css';

interface TeamPageProps {
    onOpenNotif?: () => void;
}

export const TeamPage = ({ onOpenNotif }: TeamPageProps) => {
    const { profile: myProfile } = useProfile(undefined);
    const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [selectedProfile, setSelectedProfile] = useState<any>(null);

    useEffect(() => {
        const initPage = async () => {
            try {
                const myTeamRes = await teamService.getMyTeam();
                if (myTeamRes && (myTeamRes as any).status !== 0) {
                    setCurrentTeam(myTeamRes);
                } else {
                    setCurrentTeam(null);
                }
            } catch (err) {
                console.warn('Команда не найдена');
                setCurrentTeam(null);
            } finally {
                setIsLoading(false);
            }
        };
        initPage();
    }, []);

    const isCreator = useMemo(() => {
        if (!currentTeam || !myProfile) return false;

        const teamData = currentTeam as any;
        const myId = myProfile.id.toString();

        const ownerId = teamData.ownerId?.toString();
        const firstMember = teamData.members?.[0];
        // Бэк отдает UUID профиля в поле .profileId внутри member
        const firstMemberProfileId = firstMember?.profileId?.toString();

        return myId === ownerId || myId === firstMemberProfileId;
    }, [currentTeam, myProfile]);

    const handleOpenProfile = async (profileId: string) => {
        if (!profileId) {
            console.error("Profile UUID не определен");
            return;
        }
        try {
            // Запрос в /api/profiles/{id}
            const response = await httpClient.get<any>(`/profiles/${profileId}`);
            setSelectedProfile(response.data || response);
        } catch (err) {
            console.error("Ошибка загрузки профиля:", err);
            alert("Не удалось загрузить данные пользователя");
        }
    };

    const handleLeave = async () => {
        if (!confirm("Выйти из команды?")) return;
        setIsSubmitting(true);
        try {
            await teamService.leaveTeam();
            setCurrentTeam(null);
        } catch (err) { alert("Не удалось выйти"); }
        finally { setIsSubmitting(false); }
    };

    const handleInactivate = async () => {
        if (!confirm("Удалить команду?")) return;
        setIsSubmitting(true);
        try {
            await teamService.makeInactive();
            setCurrentTeam(null);
        } catch (err) { setCurrentTeam(null); }
        finally { setIsSubmitting(false); }
    };

    const formatDate = (dateValue: any) => {
        if (!dateValue) return '—';
        try { return new Date(dateValue).toLocaleDateString('ru-RU'); }
        catch (e) { return '—'; }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-violet-600" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <Header title={currentTeam ? "Моя команда" : "Создать команду"} onNotificationClick={onOpenNotif} />

            {currentTeam ? (
                <div className="px-4 pt-6 overflow-y-auto h-full pb-20">
                    <div className="bg-white rounded-4xl p-6 shadow-sm border border-slate-100">
                        {/* Инфо о команде */}
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">{currentTeam.name}</h2>
                            {currentTeam.eventDetails?.title && (
                                <p className="text-sm font-bold text-violet-500 uppercase tracking-wider mt-1">{currentTeam.eventDetails.title}</p>
                            )}
                        </div>

                        {/* Период */}
                        {currentTeam.eventDetails?.period && (
                            <div className="flex justify-between items-center bg-slate-50 rounded-2xl p-4 mb-8 border border-slate-100">
                                <div className="flex flex-col items-center w-1/2 border-r border-slate-200">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Начало</span>
                                    <span className="text-sm font-bold text-slate-700">{formatDate(currentTeam.eventDetails.period.start)}</span>
                                </div>
                                <div className="flex flex-col items-center w-1/2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Конец</span>
                                    <span className="text-sm font-bold text-slate-700">{formatDate(currentTeam.eventDetails.period.end)}</span>
                                </div>
                            </div>
                        )}

                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-slate-900 mb-3">О проекте</h3>
                            <p className="text-slate-600 text-center text-sm leading-relaxed">{currentTeam.description}</p>
                        </div>

                        {/* Направления (Теги) */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-slate-900 mb-3">Направления</h3>
                            <div className="flex justify-center flex-wrap gap-2">
                                {currentTeam.eventDetails?.tags?.map((tag: any) => (
                                    <Badge key={tag.id} className="bg-slate-50 text-slate-700 border border-slate-200 px-4 py-1.5 rounded-full font-medium">
                                        {tag.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* СПИСОК УЧАСТНИКОВ*/}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-slate-900 mb-3">Участники</h3>
                            <div className="flex flex-col gap-3">
                                {currentTeam.members?.map((member: any) => {
                                    const profileId = typeof member === 'string' ? member : (member.profileId || member.id);

                                    const displayName = "Участник команды";

                                    return (
                                        <div key={profileId} className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-violet-600 font-bold shadow-sm">
                                                    U
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-900">{displayName}</span>
                                                    <span className="text-[10px] text-slate-400 font-mono">
                                {profileId.substring(0, 8)}...
                            </span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-violet-600 font-semibold"
                                                onClick={() => {
                                                    if (profileId) {
                                                        handleOpenProfile(profileId);
                                                    }
                                                }}
                                            >
                                                Подробнее
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex justify-between items-center py-4 border-t border-slate-100 mt-2 mb-4">
                            <span className="text-slate-500 font-medium">Состав:</span>
                            <span className="bg-slate-50 text-slate-800 px-4 py-1 rounded-full text-sm font-bold border border-slate-100">
                                {currentTeam.currentMembers || (currentTeam.members?.length) || 1} / {currentTeam.maxMembers}
                            </span>
                        </div>

                        <div className="exit-btn">
                            {isCreator ? (
                                <Button onClick={handleInactivate} variant="secondary" className="w-full text-red-500! bg-red-50! hover:bg-red-100! border-none rounded-xl py-3" isLoading={isSubmitting}>
                                    <Trash2 size={18} className="mr-2" /> Удалить команду
                                </Button>
                            ) : (
                                <Button onClick={handleLeave} variant="ghost" className="w-full border border-slate-200 rounded-xl py-3 text-slate-700" isLoading={isSubmitting}>
                                    <LogOut size={18} className="mr-2" /> Покинуть команду
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="px-4 pt-6 text-center text-slate-400">У вас пока нет команды</div>
            )}

            {/* ШТОРКА ПРОФИЛЯ */}
            {selectedProfile && (
                <div className="modal-overlay bottom" onClick={() => setSelectedProfile(null)}>
                    <div className="modal-content-bottom profile-detail-modal animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="modal-drag-handle" onClick={() => setSelectedProfile(null)} />

                        <div className="profile-detail-header">
                            <div className="detail-avatar">{(selectedProfile.name?.[0] || selectedProfile.username?.[0] || '?').toUpperCase()}</div>
                            <div>
                                <h2 className="detail-name">{selectedProfile.name || selectedProfile.username}</h2>
                                <p className="detail-username">@{selectedProfile.username || 'user'}</p>
                            </div>
                        </div>

                        <div className="detail-scroll-area">
                            <section className="detail-section">
                                <h4 className="detail-section-title">О себе</h4>
                                <p className="detail-description">{selectedProfile.description || "Пользователь пока не добавил описание."}</p>
                            </section>

                            {/* Навыки */}
                            {selectedProfile.skills && selectedProfile.skills.length > 0 && (
                                <section className="detail-section">
                                    <h4 className="detail-section-title">Навыки</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProfile.skills.map((s: any, idx: number) => (
                                            <Badge key={s.id || idx} className="bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1 rounded-full text-xs font-medium">
                                                {typeof s === 'string' ? s : s.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Статистика */}
                            <div className="stats-grid mb-4">
                                <div className="stat-box">
                                    <Target className="stat-icon text-blue-500" />
                                    <div className="stat-value">{selectedProfile.hackathonsCount || 0}</div>
                                    <div className="stat-label">Хакатоны</div>
                                </div>
                                <div className="stat-box">
                                    <Trophy className="stat-icon text-amber-500" />
                                    <div className="stat-value">{selectedProfile.winsCount || 0}</div>
                                    <div className="stat-label">Победы</div>
                                </div>
                                <div className="stat-box">
                                    <Layout className="stat-icon text-emerald-500" />
                                    <div className="stat-value">{selectedProfile.projectsCount || 0}</div>
                                    <div className="stat-label">Проекты</div>
                                </div>
                            </div>
                        </div>
                        <Button className="detail-close-btn" onClick={() => setSelectedProfile(null)}>Закрыть</Button>
                    </div>
                </div>
            )}
        </div>
    );
};
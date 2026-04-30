import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Header } from '../ui/Header/Header';
import { httpClient } from '../../lib/http-client';
import { teamService } from '../../types/api';
import type { Team, Tag, CreateTeamRequest } from '../../types/api';
import { LogOut, Trash2, Loader2, Target, Trophy, Layout, CodeXml, Folder, Star } from 'lucide-react';
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

    const [formData] = useState({
        name: '',
        description: '',
        event: '',
        startDate: '',
        endDate: '',
        maxMembers: '4',
        selectedTags: [] as Tag[]
    });

    const isCreator = useMemo(() => {
        if (!currentTeam || !myProfile) return false;
        if (currentTeam.currentMembers === 1) return true;

        const myId = myProfile.id.toString();
        const ownerId = (currentTeam as any).ownerId?.toString();
        if (ownerId && myId === ownerId) return true;

        const firstMemberId = currentTeam.members?.[0]?.id?.toString();
        return myId === firstMemberId;
    }, [currentTeam, myProfile]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload: CreateTeamRequest = {
                teamName: formData.name,
                maxMembers: parseInt(formData.maxMembers, 10),
                description: formData.description || null,
                eventName: formData.event || null,
                eventStart: formData.startDate || null,
                eventEnd: formData.endDate || null,
                tags: formData.selectedTags.map(t => Number(t.id))
            };
            await httpClient.post('/teams', payload);
            const freshTeamRes = await teamService.getMyTeam();
            if (freshTeamRes) setCurrentTeam(freshTeamRes);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Ошибка при создании');
        } finally {
            setIsSubmitting(false);
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
        } catch (err: any) {
            setCurrentTeam(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenProfile = async (id: number | string) => {
        try {
            const response = await httpClient.get<any>(`/users/${id}`);
            setSelectedProfile(response.data || response);
        } catch (err) {
            alert("Не удалось загрузить данные пользователя");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-violet-600" size={32} />
            </div>
        );
    }

    const formatDate = (dateValue: any) => {
        if (!dateValue) return '—';
        try {
            return new Date(dateValue).toLocaleDateString('ru-RU');
        } catch (e) {
            return '—';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <Header
                title={currentTeam ? "Моя команда" : "Создать команду"}
                onNotificationClick={onOpenNotif}
            />

            {currentTeam ? (
                <div className="px-4 pt-6">
                    <div className="bg-white rounded-4xl p-6 shadow-sm border border-slate-100">

                        {/* Шапка с названием */}
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-extrabold text-slate-900">{currentTeam.name}</h2>
                            {currentTeam.eventDetails?.title && (
                                <p className="text-sm font-bold text-violet-500 uppercase tracking-wider mt-1">
                                    {currentTeam.eventDetails.title}
                                </p>
                            )}
                        </div>

                        {/* Даты */}
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

                        {/* О проекте */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-slate-900 mb-3">О проекте</h3>
                            <p className="text-slate-600 text-center text-sm leading-relaxed">
                                {currentTeam.description}
                            </p>
                        </div>

                        {/* Направления */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-slate-900 mb-3">Направления</h3>
                            <div className="flex justify-center flex-wrap gap-2">
                                {currentTeam.eventDetails?.tags && currentTeam.eventDetails.tags.length > 0 ? (
                                    currentTeam.eventDetails.tags.map((tag: any) => (
                                        <Badge key={tag.id} className="bg-slate-50 text-slate-700 border border-slate-200 px-4 py-1.5 rounded-full font-medium">
                                            {tag.name}
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-slate-400 text-sm italic text-center w-full">Направления не указаны</p>
                                )}
                            </div>
                        </div>

                        {/* Участники */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-slate-900 mb-3">Участники</h3>
                            <div className="flex flex-col gap-3">
                                {currentTeam.members?.map((member: any) => {
                                    const userData = member.user || member;
                                    const displayName = userData.name || userData.username || 'Участник';
                                    const telegramId = userData.telegramId || userData.id;

                                    return (
                                        <div key={telegramId} className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-violet-600 font-bold shadow-sm">
                                                    {displayName[0].toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-900">{displayName}</span>
                                                    {userData.username && <span className="text-xs text-slate-400">@{userData.username}</span>}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-violet-600 font-semibold"
                                                onClick={() => handleOpenProfile(telegramId)}
                                            >
                                                Подробнее
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Состав */}
                        <div className="flex justify-between items-center py-4 border-t border-slate-100 mt-2 mb-4">
                            <span className="text-slate-500 font-medium">Состав:</span>
                            <span className="bg-slate-50 text-slate-800 px-4 py-1 rounded-full text-sm font-bold border border-slate-100">
                                {currentTeam.currentMembers || (currentTeam.members?.length) || 1} / {currentTeam.maxMembers}
                            </span>
                        </div>

                        {/* Кнопки */}
                        <div className="exit-btn">
                            {isCreator ? (
                                <Button
                                    onClick={handleInactivate}
                                    variant="secondary"
                                    className="w-full text-red-500! bg-red-50! hover:bg-red-100! border-none rounded-xl py-3"
                                    isLoading={isSubmitting}
                                >
                                    <Trash2 size={18} className="mr-2" /> Удалить команду
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleLeave}
                                    variant="ghost"
                                    className="w-full border border-slate-200 rounded-xl py-3 text-slate-700"
                                    isLoading={isSubmitting}
                                >
                                    <LogOut size={18} className="mr-2" /> Покинуть команду
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="px-4 pt-6">
                    <div className="p-4 text-center text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-100">
                        Форма создания временно скрыта или требует заполнения полей formData.
                    </div>
                </form>
            )}

            {/* Модальное окно профиля */}
            {selectedProfile && (
                <div className="modal-overlay bottom" onClick={() => setSelectedProfile(null)}>
                    <div className="modal-content-bottom profile-detail-modal animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="modal-drag-handle" onClick={() => setSelectedProfile(null)} />

                        <div className="profile-detail-header">
                            <div className="detail-avatar">
                                {selectedProfile.name?.[0] || selectedProfile.username?.[0] || '?'}
                            </div>
                            <div>
                                <h2 className="detail-name">{selectedProfile.name || selectedProfile.username}</h2>
                                <p className="detail-username">@{selectedProfile.username}</p>
                            </div>
                        </div>

                        <div className="detail-scroll-area">
                            <section className="detail-section">
                                <h4 className="detail-section-title">О себе</h4>
                                <p className="detail-description">
                                    {selectedProfile.description || "Пользователь пока не добавил описание."}
                                </p>
                            </section>

                            {selectedProfile.tags && selectedProfile.tags.length > 0 && (
                                <section className="detail-section">
                                    <h4 className="detail-section-title">Навыки</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProfile.tags.map((tag: any) => (
                                            <Badge key={tag.id} className="bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1 rounded-full text-xs font-medium">
                                                {tag.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </section>
                            )}

                            <div className="stats-grid">
                                <div className="stat-box">
                                    <Target className="stat-icon text-blue-500" />
                                    <div className="stat-value">{selectedProfile.hackathons || 0}</div>
                                    <div className="stat-label">Хакатоны</div>
                                </div>
                                <div className="stat-box">
                                    <Trophy className="stat-icon text-amber-500" />
                                    <div className="stat-value">{selectedProfile.wins || 0}</div>
                                    <div className="stat-label">Победы</div>
                                </div>
                                <div className="stat-box">
                                    <Layout className="stat-icon text-emerald-500" />
                                    <div className="stat-value">{selectedProfile.projects || 0}</div>
                                    <div className="stat-label">Проекты</div>
                                </div>
                            </div>

                            {selectedProfile.githubInfo && (
                                <section className="github-card">
                                    <div className="github-header">
                                        <div className="github-icon-wrapper">
                                            <CodeXml size={18} />
                                        </div>
                                        <span className="github-title">GitHub</span>
                                    </div>
                                    <div className="github-stats-row">
                                        <div className="github-stat-item">
                                            <CodeXml className="text-slate-500 mb-1" size={14} />
                                            <div className="github-stat-label">Язык</div>
                                            <div className="github-stat-value">{selectedProfile.githubInfo?.topLanguage || '—'}</div>
                                        </div>
                                        <div className="github-stat-item border-x">
                                            <Folder className="text-slate-500 mb-1" size={14} />
                                            <div className="github-stat-label">Репо</div>
                                            <div className="github-stat-value">{selectedProfile.githubInfo?.repositoriesCount || 0}</div>
                                        </div>
                                        <div className="github-stat-item">
                                            <Star className="text-amber-400 mb-1" size={14} />
                                            <div className="github-stat-label">Звезды</div>
                                            <div className="github-stat-value">{selectedProfile.githubInfo?.totalStars || 0}</div>
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>

                        <Button className="detail-close-btn" onClick={() => setSelectedProfile(null)}>
                            Закрыть
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
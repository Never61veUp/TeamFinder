import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Header } from '../ui/Header/Header';
import { TagsInput } from './TagsInput';
import { httpClient } from '../../lib/http-client';
import type { Team, Tag, CreateTeamRequest, ProfileWithGithub } from '../../types/api';
import { LogOut, Trash2, Loader2, Calendar, UserMinus } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { ProfileModal } from '../ui/ProfileModal/ProfileModal';
import { RatingStars } from '../ui/RatingStars';
import './team.css';
import {teamService} from "../../services/team.service.ts";

interface TeamPageProps {
    onOpenNotif?: () => void;
}

export const TeamPage = ({ onOpenNotif }: TeamPageProps) => {
    const { profile: myProfile } = useProfile(undefined);
    const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        event: '',
        startDate: '',
        endDate: '',
        maxMembers: '4',
        selectedTags: [] as Tag[]
    });

    const [membersData, setMembersData] = useState<Record<string, ProfileWithGithub>>({});
    const [selectedProfile, setSelectedProfile] = useState<ProfileWithGithub | null>(null);

    const today = new Date().toISOString().split('T')[0];
    const maxDate = "2100-12-31";

    const loadMembersData = async (team: Team) => {
        setMembersData({});
        if (!team.members) return;

        const profiles: Record<string, ProfileWithGithub> = {};

        await Promise.all(
            team.members.map(async (member: any) => {
                const id =
                    typeof member === 'string'
                        ? member
                        : (member.profileId || member.id);

                try {
                    const res = await httpClient.get<ProfileWithGithub>(`/profiles/${id}`);
                    profiles[id] = (res as any).data || res;
                } catch (e) {
                    console.error("Ошибка загрузки профиля", id);
                }
            })
        );

        setMembersData(profiles);
    };

    useEffect(() => {
        const initPage = async () => {
            try {
                const [tagsRes, myTeamRes] = await Promise.allSettled([
                    httpClient.get<Tag[]>('/teams/event-tags'),
                    teamService.getMyTeam()
                ]);

                if (tagsRes.status === 'fulfilled') {
                    const tagsData = Array.isArray(tagsRes.value)
                        ? tagsRes.value
                        : (tagsRes.value as any).data || [];
                    setAvailableTags(tagsData);
                }

                if (myTeamRes.status === 'fulfilled') {
                    const teamData = myTeamRes.value;
                    if (teamData && (teamData as any).status !== 0) {
                        setCurrentTeam(teamData);

                        await loadMembersData(teamData);
                    }
                }
            } catch (err) {
                console.warn('Ошибка инициализации');
            } finally {
                setIsLoading(false);
            }
        };
        initPage();
    }, []);

    const activeMembers = useMemo(() => {
        if (!currentTeam?.members) return [];
        return currentTeam.members.filter((m: any) => m.status === 1 || m.status === undefined);
    }, [currentTeam?.members]);

    const isCreator = useMemo(() => {
        if (!currentTeam || !myProfile) return false;
        const myId = myProfile.id.toString().toLowerCase();
        const ownerId = currentTeam.ownerId?.toString().toLowerCase();
        return myId === ownerId;
    }, [currentTeam, myProfile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const nextData = { ...prev, [name]: value };
            if (name === 'startDate' && nextData.endDate && value > nextData.endDate) {
                nextData.endDate = value;
            }
            return nextData;
        });
    };

    const handleTagsChange = (newTags: Tag[]) => {
        setFormData(prev => ({ ...prev, selectedTags: newTags }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
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

            if (freshTeamRes) {
                setCurrentTeam(freshTeamRes);
                await loadMembersData(freshTeamRes);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Ошибка при создании');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenProfile = async (profileId: string) => {
        if (!profileId) return;
        try {
            const response = await httpClient.get<ProfileWithGithub>(`/profiles/${profileId}`);
            setSelectedProfile((response as any).data || response);
        } catch (err) {
            alert("Не удалось загрузить данные пользователя");
        }
    };

    const handleKickMember = async (profileId: string) => {
        if (!confirm("Вы уверены, что хотите удалить этого участника из команды?")) return;

        setIsSubmitting(true);
        try {
            await teamService.kickMember(profileId);
            const freshTeamRes = await teamService.getMyTeam();
            if (freshTeamRes) setCurrentTeam(freshTeamRes);
        } catch (err) {
            alert("Не удалось удалить участника. Попробуйте позже.");
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
        } catch (err) { alert("Ошибка удаления"); }
        finally { setIsSubmitting(false); }
    };

    const formatDate = (dateValue: any) => {
        if (!dateValue) return '—';
        try { return new Date(dateValue).toLocaleDateString('ru-RU'); }
        catch (e) { return '—'; }
    };

    const handleDateClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const input = e.currentTarget.querySelector('input');
        if (input) {
            if ('showPicker' in HTMLInputElement.prototype) {
                try {
                    input.showPicker();
                } catch (error) {
                    input.focus();
                }
            } else {
                input.focus();
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-violet-600" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Header title={currentTeam ? "Моя команда" : "Создать команду"} onNotificationClick={onOpenNotif} />

            {currentTeam ? (
                <div className="px-4 pt-6">
                    <div className="bg-white rounded-4xl p-6 shadow-sm border border-slate-100">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">{currentTeam.name}</h2>
                            {currentTeam.eventDetails?.title && (
                                <p className="text-sm font-bold text-violet-500 uppercase tracking-wider mt-1">{currentTeam.eventDetails.title}</p>
                            )}
                        </div>

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

                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-slate-900 mb-3">Участники</h3>
                            <div className="flex flex-col gap-3">
                                {activeMembers.map((member: any) => {
                                    const profileId = typeof member === 'string' ? member : (member.profileId || member.id);
                                    const data = membersData[profileId];
                                    const name = data?.name || "Загрузка...";
                                    const username = data?.userName || "user";
                                    const isMe = myProfile?.id.toString() === profileId;

                                    return (
                                        <div key={profileId} className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-violet-600 font-bold shadow-sm text-lg">
                                                    {name && name.length > 0 ? name[0].toUpperCase() : "?"}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-900">{name}</span>
                                                    <span className="text-xs text-slate-400">@{username}</span>
                                                    <RatingStars rating={data?.rating || 0} size={12} />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="sm" className="text-violet-600 font-semibold px-2" onClick={() => handleOpenProfile(profileId)}>
                                                    Подробнее
                                                </Button>

                                                {isCreator && !isMe && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-500 hover:bg-red-50 hover:text-red-600 px-2"
                                                        onClick={() => handleKickMember(profileId)}
                                                        title="Удалить участника"
                                                    >
                                                        <UserMinus size={18} />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-4">
                            {isCreator ? (
                                <Button onClick={handleInactivate} variant="secondary" className="w-full text-red-500! bg-red-50! border-none rounded-xl py-3" isLoading={isSubmitting}>
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
                <form onSubmit={handleSubmit} className="px-4 pt-6 space-y-4">
                    <div className="bg-white rounded-4xl p-6 shadow-sm border border-slate-100 space-y-4">
                        <div className="form-group">
                            <label className="text-sm font-bold text-slate-700 ml-1">Название команды</label>
                            <input name="name" type="text" placeholder="Прим: InnovatorsHub" value={formData.name} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none transition-all" required />
                        </div>

                        <div className="form-group">
                            <label className="text-sm font-bold text-slate-700 ml-1">Описание</label>
                            <textarea name="description" placeholder="Расскажите о проекте..." value={formData.description} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none min-h-30 transition-all" required />
                        </div>

                        <div className="form-group">
                            <label className="text-sm font-bold text-slate-700 ml-1">Хакатон</label>
                            <input name="event" type="text" placeholder="Название мероприятия" value={formData.event} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none transition-all" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="form-group">
                                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Начало</label>
                                <div onClick={handleDateClick} className="relative flex items-center group cursor-pointer">
                                    <input
                                        name="startDate"
                                        type="date"
                                        min={today}
                                        max={maxDate}
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className="w-full p-3 pr-10 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none transition-all duration-200 group-hover:bg-white group-hover:border-violet-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white"
                                    />
                                    <Calendar size={16} className="absolute right-3 text-slate-400 transition-colors duration-200 group-hover:text-violet-500 pointer-events-none" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Конец</label>
                                <div onClick={handleDateClick} className="relative flex items-center group cursor-pointer">
                                    <input
                                        name="endDate"
                                        type="date"
                                        min={formData.startDate || today}
                                        max={maxDate}
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        className="w-full p-3 pr-10 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none transition-all duration-200 group-hover:bg-white group-hover:border-violet-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white"
                                    />
                                    <Calendar size={16} className="absolute right-3 text-slate-400 transition-colors duration-200 group-hover:text-violet-500 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="text-sm font-bold text-slate-700 ml-1">Макс. участников</label>
                            <input name="maxMembers" type="number" value={formData.maxMembers} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" />
                        </div>

                        <div className="form-group">
                            <label className="text-sm font-bold text-slate-700 ml-1">Теги</label>
                            <TagsInput tags={formData.selectedTags} availableTags={availableTags} onChange={handleTagsChange} />
                        </div>

                        {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

                        <Button type="submit" isLoading={isSubmitting} className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-2xl py-4 font-bold shadow-lg shadow-violet-200">
                            Создать команду
                        </Button>
                    </div>
                </form>
            )}

            <ProfileModal
                profile={selectedProfile}
                onClose={() => setSelectedProfile(null)}
            />
        </div>
    );
};
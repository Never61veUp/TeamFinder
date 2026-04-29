import React, {useState, useEffect, useMemo} from 'react';
import { TagsInput } from './TagsInput';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Section } from '../ui/Section';
import { Header } from '../ui/Header/Header';
import { httpClient } from '../../lib/http-client';
import { teamService } from '../../types/api';
import type { Team, Tag, CreateTeamRequest } from '../../types/api';
import { LogOut, Trash2, Loader2 } from 'lucide-react';
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

    const isCreator = useMemo(() => {
        if (!currentTeam) return false;
        if (currentTeam.currentMembers === 1) return true;

        const myBackendId = myProfile?.id?.toString();
        const ownerId = (currentTeam as any)?.ownerId?.toString();
        const firstMemberId = currentTeam?.members?.[0]?.toString();

        return myBackendId === ownerId || myBackendId === firstMemberId;
    }, [currentTeam, myProfile]);

    useEffect(() => {
        const initPage = async () => {
            try {
                const results = await Promise.allSettled([
                    httpClient.get<Tag[]>('/teams/event-tags'),
                    teamService.getMyTeam()
                ]);

                const [tagsRes, myTeamRes] = results;

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
                    } else {
                        setCurrentTeam(null);
                    }
                } else {
                    setCurrentTeam(null);
                }

            } catch (err) {
                console.warn('Инициализация завершена в штатном режиме (команда не найдена или отсутствует)');
            } finally {
                setIsLoading(false);
            }
        };
        initPage();
    }, []);

    const today = new Date().toISOString().split('T')[0];
    const maxDate = "2100-12-31";

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

        console.log("ОТПРАВЛЯЕМЫЕ ТЕГИ:", formData.selectedTags);

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

            console.log("PAYLOAD ДЛЯ СЕРВЕРА:", payload);

            await httpClient.post('/teams', payload);
            const freshTeamRes = await teamService.getMyTeam();

            if (freshTeamRes) {
                setCurrentTeam(freshTeamRes);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Ошибка при создании');
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

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin text-violet-600" />
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
        <div className="team-page">
            <Header
                title={currentTeam ? "Моя команда" : "Создать команду"}
                onNotificationClick={onOpenNotif}
            />

            {currentTeam ? (
                <div className="team-view-container">
                    <div className="view-card">
                        <div className="view-card-header">
                            <h2 className="view-team-name">{currentTeam.name}</h2>
                            {currentTeam.eventDetails?.title && (
                                <p className="view-team-event">
                                    {currentTeam.eventDetails.title}
                                </p>
                            )}
                        </div>

                        {currentTeam.eventDetails?.period && (
                            <div className="view-dates-panel">
                                <div className="view-date-item">
                                    <span className="date-label">Начало</span>
                                    <span className="date-value">
                            {formatDate(currentTeam.eventDetails.period.start)}
                        </span>
                                </div>
                                <div className="view-date-item">
                                    <span className="date-label">Конец</span>
                                    <span className="date-value">
                            {formatDate(currentTeam.eventDetails.period.end)}
                        </span>
                                </div>
                            </div>
                        )}

                        <Section title="О проекте">
                            <p className="text-slate-600 leading-relaxed text-center">
                                {currentTeam.description}
                            </p>
                        </Section>

                        <Section title="Направления">
                            <div className="view-tags-list">
                                {currentTeam.eventDetails?.tags && currentTeam.eventDetails.tags.length > 0 ? (
                                    currentTeam.eventDetails?.tags.map((profile: any) => (
                                        <Badge key={profile.id} className="badge">
                                            {profile.name}
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-slate-400 text-sm italic">Направления не указаны</p>
                                )}
                            </div>
                        </Section>

                        <div className="view-card-footer">
                            <span className="view-capacity-label">Состав:</span>
                            <span className="view-capacity-value">
                    {currentTeam.currentMembers || (currentTeam.members?.length) || 1} / {currentTeam.maxMembers}
                </span>
                        </div>

                        <div className="team-actions">
                            {isCreator ? (
                                <Button
                                    onClick={handleInactivate}
                                    variant="secondary"
                                    className="w-full mt-4 text-red-500! bg-red-50! border-red-200"
                                    isLoading={isSubmitting}
                                >
                                    <Trash2 size={18} className="mr-2" /> Удалить команду
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleLeave}
                                    variant="ghost"
                                    className="w-full mt-4 border border-slate-200"
                                    isLoading={isSubmitting}
                                >
                                    <LogOut size={18} className="mr-2" /> Покинуть команду
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="team-form">
                    <div className="form-group">
                        <label className="form-label">Название команды</label>
                        <input name="name" type="text" placeholder="Прим: InnovatorsHub" value={formData.name} onChange={handleChange} className="form-input" required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Описание</label>
                        <textarea name="description" placeholder="Расскажите о проекте и кого ищете..." value={formData.description} onChange={handleChange} className="form-textarea" required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Хакатон (необязательно)</label>
                        <input name="event" type="text" placeholder="Прим: AI Hackathon 2026" value={formData.event} onChange={handleChange} className="form-input" />
                    </div>

                    <div className="flex-row-gap">
                        <div className="form-group flex-1">
                            <label className="form-label">Начало</label>
                            <div className="date-input-container">
                                <input name="startDate" type="date" min={today} max={maxDate} value={formData.startDate} onChange={handleChange} className="form-input custom-date-input" />
                            </div>
                        </div>
                        <div className="form-group flex-1">
                            <label className="form-label">Конец</label>
                            <div className="date-input-container">
                                <input name="endDate" type="date" min={formData.startDate || today} max={maxDate} value={formData.endDate} onChange={handleChange} className="form-input custom-date-input" />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Максимум участников</label>
                        <input name="maxMembers" type="number" placeholder="4" value={formData.maxMembers} onChange={handleChange} className="form-input" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Технологии и направления</label>
                        <TagsInput tags={formData.selectedTags} availableTags={availableTags} onChange={handleTagsChange} />
                    </div>

                    {error && <p className="error-text">{error}</p>}

                    <div className="submit-btn-wrapper">
                        <Button type="submit" isLoading={isSubmitting} className="team-submit-btn" size="lg">
                            Создать команду
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
};
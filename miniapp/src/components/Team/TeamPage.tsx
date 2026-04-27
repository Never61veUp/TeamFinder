import React, { useState, useEffect } from 'react';
import { TagsInput } from './TagsInput';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Section } from '../ui/Section';
import { httpClient } from '../../lib/http-client';
import type { Team, Tag, CreateTeamRequest } from '../../types/api';
import './team.css';

export const TeamPage = () => {
    const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Даты для валидации
    const today = new Date().toISOString().split('T')[0];
    const maxDate = "2100-12-31";

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

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await httpClient.get<Tag[]>('/teams/event-tags');
                const tagsData = Array.isArray(response) ? response : (response as any).data || [];
                setAvailableTags(tagsData);
            } catch (err) {
                console.error('Ошибка при загрузке тегов:', err);
                setError('Не удалось загрузить список направлений');
            }
        };
        fetchTags();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const nextData = { ...prev, [name]: value };

            // Логика: дата конца не может быть раньше даты начала
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

            const response = await httpClient.post<{ id: string | number }>('/teams', payload);

            const createdTeam: Team = {
                id: String(response?.id || Date.now()),
                name: formData.name,
                description: formData.description || '',
                event: formData.event || '',
                startDate: formData.startDate || '',
                endDate: formData.endDate || '',
                maxMembers: parseInt(formData.maxMembers, 10),
                currentMembers: 1,
                tags: formData.selectedTags,
                members: [{ id: 1, initials: 'Я' }]
            };

            setCurrentTeam(createdTeam);
        } catch (err: any) {
            const serverErrors = err.response?.data?.errors;
            if (serverErrors) {
                const messages = Object.values(serverErrors).flat().join('. ');
                setError(messages);
            } else {
                setError(err.message || 'Ошибка при создании команды');
            }
            console.error('Submit error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (currentTeam) {
        return (
            <div className="team-page">
                <header className="team-header">
                    <div className="team-header-content">
                        <h1 className="team-title">Моя команда</h1>
                    </div>
                </header>

                <div className="team-view-container">
                    <div className="view-card">
                        <div className="view-card-header">
                            <h2 className="view-team-name">{currentTeam.name}</h2>
                            {currentTeam.event && (
                                <p className="view-team-event">
                                    {currentTeam.event}
                                </p>
                            )}
                        </div>

                        <Section title="О проекте">
                            <p className="text-slate-600 leading-relaxed text-center">
                                {currentTeam.description}
                            </p>
                        </Section>

                        <Section title="Направления">
                            <div className="view-tags-list">
                                {currentTeam.tags.map(tag => (
                                    <Badge key={tag.id} className="badge">
                                        {tag.name}
                                    </Badge>
                                ))}
                            </div>
                        </Section>

                        <div className="view-card-footer">
                            <span className="view-capacity-label">Состав:</span>
                            <span className="view-capacity-value">
                                {currentTeam.currentMembers} / {currentTeam.maxMembers}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="team-page">
            <header className="team-header">
                <div className="team-header-content">
                    <h1 className="team-title">Создать команду</h1>
                </div>
            </header>

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
                            <input
                                name="startDate"
                                type="date"
                                min={today}
                                max={maxDate}
                                value={formData.startDate}
                                onChange={handleChange}
                                className="form-input custom-date-input"
                            />
                        </div>
                    </div>
                    <div className="form-group flex-1">
                        <label className="form-label">Конец</label>
                        <div className="date-input-container">
                            <input
                                name="endDate"
                                type="date"
                                min={formData.startDate || today}
                                max={maxDate}
                                value={formData.endDate}
                                onChange={handleChange}
                                className="form-input custom-date-input"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Максимум участников</label>
                    <input name="maxMembers" type="number" placeholder="4" value={formData.maxMembers} onChange={handleChange} className="form-input" />
                </div>

                <div className="form-group">
                    <label className="form-label">Технологии и направления</label>
                    <TagsInput
                        tags={formData.selectedTags}
                        availableTags={availableTags}
                        onChange={handleTagsChange}
                    />
                </div>

                {error && <p className="error-text">{error}</p>}

                <div className="submit-btn-wrapper">
                    <Button type="submit" isLoading={isSubmitting} className="team-submit-btn" size="lg">
                        Создать команду
                    </Button>
                </div>
            </form>
        </div>
    );
};
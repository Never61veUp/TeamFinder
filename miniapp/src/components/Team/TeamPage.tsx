import React, { useState } from 'react';
import { TagsInput } from './TagsInput';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Section } from '../ui/Section';
import { httpClient } from '../../lib/http-client';
import type {Team, Tag, CreateTeamRequest} from '../../types/api';
import './Team.css';

export const TeamPage = () => {
    const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        event: '',
        startDate: '',
        endDate: '',
        maxMembers: '4',
        selectedTags: [] as Tag[]
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTagsChange = (newTags: Tag[]) => {
        setFormData(prev => ({ ...prev, selectedTags: newTags }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const payload: { request: CreateTeamRequest } = {
                request: {
                    teamName: formData.name,
                    maxMembers: parseInt(formData.maxMembers, 10),
                    description: formData.description || null,
                    eventName: formData.event || null,
                    eventStart: formData.startDate || null,
                    eventEnd: formData.endDate || null,
                    tags: formData.selectedTags.map(t => t.id) // Отправляем ID чисел
                }
            };

            const response = await httpClient.post<{ id: string | number }>('/teams', payload);

            const createdTeam: Team = {
                // 5. Берем id напрямую из ответа, так как там нет поля .data
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
            const serverError = err.response?.data?.errors;
            const errorMessage = serverError
                ? Object.entries(serverError).map(([k, v]) => `${k}: ${v}`).join(', ')
                : err.message;

            setError(errorMessage || 'Ошибка при создании команды');
            console.error('Submit error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Весь остальной рендеринг (return) остается таким же, как в твоем исходном коде
    if (currentTeam) {
        return (
            <div className="team-page">
                <header className="team-header">
                    <div className="team-header-content">
                        <h1 className="team-title">Моя команда</h1>
                    </div>
                </header>
                <div className="team-view-container">
                    <div className="team-card bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col gap-5">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-slate-900">{currentTeam.name}</h2>
                            {currentTeam.event && (
                                <p className="text-[#a03af0] font-semibold text-sm mt-1 uppercase tracking-wide">
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
                            <div className="flex flex-wrap justify-center gap-2">
                                {currentTeam.tags.map(tag => (
                                    <Badge key={tag.id} variant="primary">
                                        {tag.title}
                                    </Badge>
                                ))}
                            </div>
                        </Section>
                        <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                            <span className="text-slate-400 text-sm font-medium">Состав:</span>
                            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
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
                    <input name="name" type="text" value={formData.name} onChange={handleChange} className="form-input" required />
                </div>
                <div className="form-group">
                    <label className="form-label">Описание</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="form-textarea" required />
                </div>
                <div className="form-group">
                    <label className="form-label">Хакатон</label>
                    <input name="event" type="text" value={formData.event} onChange={handleChange} className="form-input" />
                </div>
                <div className="flex gap-4">
                    <div className="form-group flex-1">
                        <label className="form-label">Начало</label>
                        <input name="startDate" type="date" value={formData.startDate} onChange={handleChange} className="form-input" />
                    </div>
                    <div className="form-group flex-1">
                        <label className="form-label">Конец</label>
                        <input name="endDate" type="date" value={formData.endDate} onChange={handleChange} className="form-input" />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Количество участников</label>
                    <input name="maxMembers" type="number" value={formData.maxMembers} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group">
                    <label className="form-label">Направления проекта</label>
                    <TagsInput tags={formData.selectedTags} onChange={handleTagsChange} />
                </div>
                {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
                <div className="submit-btn-wrapper">
                    <Button type="submit" isLoading={isSubmitting} className="team-submit-btn" size="lg">
                        Подтвердить создание
                    </Button>
                </div>
            </form>
        </div>
    );
};
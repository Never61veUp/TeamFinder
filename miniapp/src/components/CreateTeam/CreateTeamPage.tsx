import React, { useState } from 'react';
import { TagsInput } from './TagsInput';
import { Button } from '../ui/Button';
import './CreateTeam.css';

export const CreateTeamPage = () => {
    const [formData, setFormData] = useState({
        name: 'InnovatorsHub',
        description: '',
        hackathon: 'AI Hackathon 2026',
        maxMembers: '4',
        tags: ['React', 'Python', 'AI', 'Mobile', 'Blockchain', 'Node.js', 'UI/UX', 'Web3']
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTagsChange = (newTags: string[]) => {
        setFormData(prev => ({ ...prev, tags: newTags }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            console.log('Данные для отправки:', formData);
            // Имитация запроса к API
            await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (error) {
            console.error('Ошибка при создании команды', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="create-team-page">
            <header className="create-team-header">
                <h1 className="create-team-title">Создать команду</h1>
            </header>

            <form onSubmit={handleSubmit} className="create-team-form">

                <div className="form-group">
                    <label htmlFor="name" className="form-label">Название команды</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-input"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description" className="form-label">Описание</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Расскажите о вашем проекте и кого вы ищете..."
                        rows={5}
                        className="form-textarea"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="hackathon" className="form-label">Хакатон (опционально)</label>
                    <input
                        id="hackathon"
                        name="hackathon"
                        type="text"
                        value={formData.hackathon}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="maxMembers" className="form-label">Максимум участников</label>
                    <input
                        id="maxMembers"
                        name="maxMembers"
                        type="number"
                        min="1"
                        max="50"
                        value={formData.maxMembers}
                        onChange={handleChange}
                        className="form-input"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Технологии и теги</label>
                    <TagsInput tags={formData.tags} onChange={handleTagsChange} />
                </div>

                <div className="submit-btn-wrapper">
                    <Button
                        type="submit"
                        isLoading={isSubmitting}
                        className="create-team-submit-btn"
                        size="lg"
                    >
                        Создать команду
                    </Button>
                </div>

            </form>
        </div>
    );
};
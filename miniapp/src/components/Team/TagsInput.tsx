import React, { useState, type KeyboardEvent } from 'react';
import { Plus, X } from 'lucide-react';
import './Team.css';
import type { Tag } from "../../types/api";

interface TagsInputProps {
    tags: Tag[];
    onChange: (tags: Tag[]) => void;
}

export const TagsInput: React.FC<TagsInputProps> = ({ tags, onChange }) => {
    const [inputValue, setInputValue] = useState('');

    const handleAdd = () => {
        const val = inputValue.trim();
        if (!val) return;

        // Проверяем дубликаты по свойству title
        const isDuplicate = tags.some(t => t.title.toLowerCase() === val.toLowerCase());

        if (!isDuplicate) {
            const newTag: Tag = {
                id: Date.now(), // Генерируем числовой id для интерфейса Tag
                title: val
            };
            onChange([...tags, newTag]);
        }
        setInputValue('');
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    const handleRemove = (tagToRemove: Tag) => {
        onChange(tags.filter(t => t.id !== tagToRemove.id));
    };

    return (
        <div className="tags-container">
            {tags.length > 0 && (
                <div className="tags-list">
                    {tags.map((tag) => (
                        <span key={tag.id} className="tag-item">
                            {/* Выводим свойство title, а не весь объект */}
                            {tag.title}
                            <button
                                type="button"
                                onClick={() => handleRemove(tag)}
                                className="tag-remove-btn"
                            >
                                <X size={14} strokeWidth={2.5} />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            <div className="tags-input-row">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Добавить направление..."
                    className="form-input"
                />
                <button
                    type="button"
                    onClick={handleAdd}
                    className="tag-add-btn"
                >
                    <Plus size={24} />
                </button>
            </div>
        </div>
    );
};
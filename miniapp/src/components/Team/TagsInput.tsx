import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import './team.css';
import type { Tag } from "../../types/api";

interface TagsInputProps {
    tags: Tag[];
    availableTags: Tag[];
    onChange: (tags: Tag[]) => void;
}

export const TagsInput: React.FC<TagsInputProps> = ({ tags, availableTags, onChange }) => {
    const [selectedTagId, setSelectedTagId] = useState<string>('');

    const handleAdd = () => {
        if (!selectedTagId) return;
        const tagToAdd = availableTags.find(t => t.id === Number(selectedTagId));
        const isDuplicate = tags.some(t => t.id === tagToAdd?.id);
        if (tagToAdd && !isDuplicate) {
            onChange([...tags, tagToAdd]);
        }
        setSelectedTagId('');
    };

    const handleRemove = (tagToRemove: Tag) => {
        onChange(tags.filter(t => t.id !== tagToRemove.id));
    };

    return (
        <div className="tags-container">
            <div className="tags-input-row">
                <select
                    value={selectedTagId}
                    onChange={(e) => setSelectedTagId(e.target.value)}
                    className="form-input"
                >
                    <option value="" disabled>Добавить тег...</option>
                    {availableTags.map((tag) => (
                        <option key={tag.id} value={tag.id}>
                            {tag.name}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={handleAdd}
                    className="tag-add-btn"
                >
                    <Plus size={24} />
                </button>
            </div>

            {tags.length > 0 && (
                <div className="tags-list">
                    {tags.map((tag) => (
                        <span key={tag.id} className="tag-item">
                            {tag.name}
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
        </div>
    );
};
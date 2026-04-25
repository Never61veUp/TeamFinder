import React, { useState, type KeyboardEvent } from 'react';
import { Plus, X } from 'lucide-react';
import './CreateTeam.css';

interface TagsInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
}

export const TagsInput: React.FC<TagsInputProps> = ({ tags, onChange }) => {
    const [inputValue, setInputValue] = useState('');

    const handleAdd = () => {
        const val = inputValue.trim();
        if (val && !tags.includes(val)) {
            onChange([...tags, val]);
        }
        setInputValue('');
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    const handleRemove = (tagToRemove: string) => {
        onChange(tags.filter(t => t !== tagToRemove));
    };

    return (
        <div className="tags-container">
            {tags.length > 0 && (
                <div className="tags-list">
                    {tags.map((tag) => (
                        <span key={tag} className="tag-item">
                            {tag}
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
                    placeholder="Свой тег..."
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
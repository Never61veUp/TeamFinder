import React, { useEffect, useState } from 'react';
import { HARD_SKILLS } from '../../../constants/hard-skills';
import '../profile.css';

interface Props {
    initialSelectedIds: string[];
    onSave: (selectedIds: string[]) => void;
    onClose: () => void;
}

export const SkillsEditor: React.FC<Props> = ({ initialSelectedIds, onSave, onClose }) => {
    const [selected, setSelected] = useState<Record<string, boolean>>({});
    useEffect(() => {
        // инициализация: отмечаем те, что в initialSelectedIds
        const map: Record<string, boolean> = {};
        HARD_SKILLS.forEach(name => {
            map[name] = initialSelectedIds.includes(name);
        });
        setSelected(map);
    }, [initialSelectedIds]);

    const toggle = (name: string) => {
        setSelected(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const handleSave = () => {
        const selectedIds = Object.keys(selected).filter(k => selected[k]);
        // лог для отладки — убедимся, что кнопка работает
        console.log('SkillsEditor: saving', selectedIds);
        onSave(selectedIds);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-40" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl p-6 w-[90%] max-w-lg shadow-lg">
                <h3 className="font-bold text-lg mb-3">Выберите навыки</h3>

                <div className="max-h-64 overflow-auto skills-grid">
                    {HARD_SKILLS.map(name => (
                        <label key={name} className="flex items-center gap-2 p-2 border rounded-md cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!selected[name]}
                                onChange={() => toggle(name)}
                            />
                            <span className="text-sm">{name}</span>
                        </label>
                    ))}
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <button className="px-4 py-2 rounded-md bg-gray-100" onClick={onClose}>Отмена</button>
                    <button
                        className="px-4 py-2 rounded-md bg-violet-600 text-white"
                        onClick={handleSave}
                        data-testid="skills-save-btn"
                    >
                        Сохранить
                    </button>
                </div>
            </div>
        </div>
    );
};

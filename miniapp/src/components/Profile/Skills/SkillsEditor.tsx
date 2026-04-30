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
        const map: Record<string, boolean> = {};
        HARD_SKILLS.forEach(skill => {
            map[skill.id] = initialSelectedIds.includes(skill.id);
        });
        setSelected(map);
    }, [initialSelectedIds]);

    const toggle = (id: string) => {
        setSelected(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleSave = () => {
        const selectedIds = Object.keys(selected).filter(k => selected[k]);
        onSave(selectedIds);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-left justify-center">
            <div className="absolute inset-0 bg-black opacity-40" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl p-6 w-[90%] max-w-lg shadow-lg">
                <h3 className="font-bold text-lg mb-3 text-slate-800">Выберите навыки</h3>

                <div className="max-h-64 overflow-auto grid grid-cols-2 gap-2 pr-2">
                    {HARD_SKILLS.map(skill => (
                        <label key={skill.id} className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-colors ${selected[skill.id] ? 'border-violet-500 bg-violet-50' : 'border-gray-100'}`}>
                            <input
                                type="checkbox"
                                className="w-4 h-4 accent-violet-600"
                                checked={!!selected[skill.id]}
                                onChange={() => toggle(skill.id)}
                            />
                            <span className="text-sm font-medium text-slate-700">{skill.name}</span>
                        </label>
                    ))}
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button className="px-4 py-2 rounded-xl bg-gray-100 font-semibold text-gray-600" onClick={onClose}>Отмена</button>
                    <button
                        className="px-6 py-2 rounded-xl bg-violet-600 text-white font-bold"
                        onClick={handleSave}
                    >
                        Сохранить
                    </button>
                </div>
            </div>
        </div>
    );
};
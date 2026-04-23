import React from 'react';

interface AchievementsProps {
    achievements: {
        hackathons: number;
        wins: number;
        projects: number;
    };
    isEditing?: boolean;
    onChange?: (key: 'hackathons' | 'wins' | 'projects', value: number) => void;
}

export const AchievementsGrid: React.FC<AchievementsProps> = ({ achievements, isEditing, onChange }) => {
    const items = [
        { label: 'Хакатоны', value: achievements.hackathons, key: 'hackathons' as const },
        { label: 'Победы', value: achievements.wins, key: 'wins' as const },
        { label: 'Проекты', value: achievements.projects, key: 'projects' as const },
    ];

    // --- РЕЖИМ РЕДАКТИРОВАНИЯ ---
    if (isEditing) {
        return (
            <div className="w-full text-left bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <label className="text-[16px] text-gray-400 font-black uppercase mb-4 block tracking-widest text-center">
                    Достижения
                </label>
                <div className="flex flex-col gap-4">
                    {items.map((item) => (
                        <div key={item.key} className="flex flex-col">
                            <label className="text-sm font-bold text-gray-500 mb-1 ml-1">{item.label}</label>
                            {/* Поле ввода стилизовано точно так же, как textarea в "Обо мне" */}
                            <input
                                type="number"
                                className="w-full p-3 border-2 border-violet-100 rounded-xl outline-none focus:border-violet-500 bg-white"
                                value={item.value}
                                onChange={(e) => onChange?.(item.key, parseInt(e.target.value) || 0)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // --- РЕЖИМ ПРОСМОТРА ---
    return (
        <div className="w-full flex flex-col items-center">
            <h2 className="text-[16px] text-gray-800 font-bold mb-4">Достижения</h2>
            <div className="flex w-full justify-between gap-3">
                {items.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center justify-center bg-white py-4 px-2 rounded-2xl border border-gray-100 shadow-sm">
                        <span className="text-2xl font-bold text-violet-600 mb-1">{item.value}</span>
                        <span className="text-[11px] uppercase font-black text-gray-400">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
import { Section } from "../../ui/Section";
import type { Skill } from "../../../types/api";
import { Badge } from "../../ui/Badge";
import '../profile.css';

interface Props {
    skills: Skill[];
    isEditing?: boolean;
    onOpenEditor?: () => void;
    selectedSkillIds?: string[];
}

export function SkillsList({ skills, isEditing, onOpenEditor, selectedSkillIds }: Props) {
    return (
        <Section title="Навыки">
            <div className="flex flex-wrap gap-2 items-center">
                {skills.length > 0 ? (
                    skills.map(skill => (
                        <Badge key={skill.id} className={selectedSkillIds?.includes(skill.id) ? 'ring-2 ring-violet-200' : ''}>
                            {skill.name}
                        </Badge>
                    ))
                ) : (
                    <span className="text-sm text-slate-400">Нет навыков</span>
                )}

                {isEditing && (
                    <button onClick={onOpenEditor} className="ml-2 text-sm text-violet-600 font-bold">
                        Изменить
                    </button>
                )}
            </div>
        </Section>
    );
}

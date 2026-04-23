import { Section } from "../../ui/Section";
import type {Skill} from "../../../types/api.ts";
import {Badge} from "../../ui/Badge.tsx";


export function SkillsList({ skills }: { skills: Skill[] }) {
    return (
        <Section title="Навыки">
            <div className="flex flex-wrap justify-center gap-2">
                {skills.length > 0 ? (
                    skills.map(skill => <Badge key={skill.id}>{skill.name}</Badge>)
                ) : (
                    <span className="text-sm text-slate-400">Нет навыков</span>
                )}
            </div>
        </Section>
    )
}

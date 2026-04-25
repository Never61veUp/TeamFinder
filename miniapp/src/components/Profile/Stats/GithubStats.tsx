import { Section } from "../../ui/Section.tsx";
import type { GithubInfo } from "../../../types/api.ts";
import { Button } from "../../ui/Button.tsx";
import { Folder, Star, CodeXml } from 'lucide-react';

interface GithubStatsSectionProps {
    githubInfo?: GithubInfo | null
    isConnecting?: boolean
    onConnect: () => void
}

export function GithubStatsSection({ githubInfo, isConnecting, onConnect }: GithubStatsSectionProps) {
    if (!githubInfo) {
        return (
            <Section title="GitHub">
                <Button variant="secondary" isLoading={isConnecting} onClick={onConnect} className="w-full">
                    Подключить GitHub
                </Button>
            </Section>
        )
    }

    const stats = [
        { label: 'Репозитории', value: githubInfo.repositoriesCount, icon: Folder },
        { label: 'Звёзды', value: githubInfo.totalStars, icon: Star },
        { label: 'Топ язык', value: githubInfo.topLanguage || 'N/A', icon: CodeXml },
    ]

    return (
        <Section>
            <div className="grid grid-cols-1 gap-3">
                {stats.map((stat) => (
                    <div key={stat.label} className="flex flex-col items-start rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-1 text-gray-500">
                            <stat.icon size={16} strokeWidth={1.5} className="text-gray-400" />
                            <span className="text-sm font-medium">{stat.label}</span>
                        </div>
                        <span className="text-2xl font-bold text-violet-600">{stat.value}</span>
                    </div>
                ))}
            </div>
        </Section>
    )
}
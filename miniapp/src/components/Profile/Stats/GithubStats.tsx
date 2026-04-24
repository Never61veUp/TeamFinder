import {Section} from "../../ui/Section.tsx";
import type {GithubInfo} from "../../../types/api.ts";
import {Button} from "../../ui/Button.tsx";

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
        { label: 'Repos', value: githubInfo.repositoriesCount },
        { label: 'Stars', value: githubInfo.totalStars },
        { label: 'Top', value: githubInfo.topLanguage || 'N/A' },
    ]

    return (
        <Section>
            <div className="grid grid-cols-3 gap-2">
                {stats.map(stat => (
                    <div key={stat.label} className="flex flex-col items-center rounded-xl bg-gray-50 p-3 shadow-sm">
                        <span className="text-xs uppercase font-bold text-gray-400">{stat.label}</span>
                        <span className="text-xl font-bold text-violet-600">{stat.value}</span>
                    </div>
                ))}
            </div>
        </Section>
    )
}

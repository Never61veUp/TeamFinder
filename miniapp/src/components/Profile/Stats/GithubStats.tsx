import {Section} from "../../ui/Section.tsx";
import type {GithubInfo} from "../../../types/api.ts";
import {Button} from "../../ui/Button.tsx";
import '../profile.css';

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
        <Section title="GitHub">
            <div className="grid grid-cols-3 gap-2">
                {stats.map(stat => (
                    <div key={stat.label} className="flex flex-col items-center rounded-xl bg-gray-50 p-3 shadow-sm">
                        <span className="text-xs text-black">{stat.label}</span>
                        <span className="font-bold text-black">{stat.value}</span>
                    </div>
                ))}
            </div>
        </Section>
    )
}

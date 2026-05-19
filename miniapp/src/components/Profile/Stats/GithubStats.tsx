import { Section } from "../../ui/Section.tsx";
import type { GithubInfo } from "../../../types/api.ts";
import { Button } from "../../ui/Button.tsx";
import {Folder, Star, CodeXml, ChevronRight, Laptop} from 'lucide-react';
import '../profile.css';

interface GithubStatsSectionProps {
    githubInfo?: GithubInfo | null
    isConnecting?: boolean
    onConnect: () => void
}

export function GithubStatsSection({ githubInfo, isConnecting, onConnect }: GithubStatsSectionProps) {
    if (!githubInfo) {
        return (
            <Section>
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

    const handleGithubClick = () => {
        if (!githubInfo.username) return;

        const url = githubInfo.profileUrl;
        const webapp = window.Telegram?.WebApp;

        if (webapp?.openLink) {
            webapp.openLink(url);
        } else {
            window.open(url, '_blank');
        }
    };

    return (
        <Section>
            {githubInfo.username && (
                <button
                    onClick={handleGithubClick}
                    className="w-full flex items-center justify-between p-4 bg-linear-to-r from-slate-900 to-slate-800 text-white rounded-2xl border border-slate-700/50 shadow-sm active:scale-[0.98] transition-all duration-150 text-left mb-3 "
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-xl text-emerald-400">
                            <Laptop size={20} />
                        </div>
                        <div>
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Открыть профиль</div>
                            <div className="text-base font-bold text-white">github.com/{githubInfo.username}</div>
                        </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-400" />
                </button>
            )}

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
import React, {useEffect, useState} from 'react';
import {httpClient} from '../../../lib/http-client';
import {ReviewModal} from './ReviewModal';
import {Button} from '../../ui/Button';

interface TeamHistoryProps {
    currentUserId: string;
}

export const TeamHistory: React.FC<TeamHistoryProps> = ({ currentUserId }) => {
    const [pastTeams, setPastTeams] = useState<any[]>([]);
    const [profilesData, setProfilesData] = useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [reviewData, setReviewData] = useState<{teamId: string, targetId: string} | null>(null);

    useEffect(() => {
        const fetchEverything = async () => {
            setIsLoading(true);
            try {
                const res = await httpClient.get('/teams/my-team?status=0');
                const teamsArray = Array.isArray(res) ? res : (res as any).data || [];
                setPastTeams(teamsArray);

                const allMemberIds = teamsArray.flatMap((team: any) => team.members || []);
                const uniqueIds = Array.from(new Set(allMemberIds))
                    .filter(id => id && id !== currentUserId) as string[];

                const profileMap: Record<string, any> = {};

                await Promise.all(
                    uniqueIds.map(async (id) => {
                        try {
                            const p = await httpClient.get(`/profiles/${id}`);
                            profileMap[id] = (p as any).data || p;
                        } catch (err) {
                            console.error(`Не удалось загрузить профиль ${id}`, err);
                        }
                    })
                );

                setProfilesData(profileMap);
            } catch (error) {
                console.error("Ошибка загрузки истории:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEverything();
    }, [currentUserId]);

    if (isLoading) return <div className="text-sm text-gray-400 py-4 italic">Загружаем историю...</div>;
    if (pastTeams.length === 0) return null;

    return (
        <section className="w-full mt-6">
            <h2 className="font-bold text-[#333] mb-4 text-[16px] tracking-widest uppercase">
                История команд
            </h2>

            <div className="space-y-3">
                {pastTeams.map(team => (
                    <div key={team.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                        <h3 className="font-bold text-slate-800">{team.name}</h3>

                        <div className="space-y-2 pt-2 border-t border-gray-50 mt-2">
                            <p className="text-[11px] text-gray-400 font-bold uppercase">Сокомандники:</p>
                            {team.members?.map((memberId: string) => {
                                if (memberId === currentUserId) return null;

                                const profile = profilesData[memberId];

                                const name = profile?.telegramUser?.firstName ||
                                    profile?.firstName ||
                                    profile?.telegramUser?.username ||
                                    profile?.username ||
                                    profile?.name;

                                const displayName = name ? name : `ID: ${memberId.slice(0, 6)}`;

                                return (
                                    <div key={memberId} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-700">
                                                {displayName}
                                            </span>
                                            {profile?.telegramUser?.username && name !== profile.telegramUser.username && (
                                                <span className="text-[10px] text-gray-400">@{profile.telegramUser.username}</span>
                                            )}
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="text-xs h-8 px-4"
                                            onClick={() => setReviewData({ teamId: team.id, targetId: memberId })}
                                        >
                                            Оценить
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {reviewData && (
                <ReviewModal
                    teamId={reviewData.teamId}
                    targetProfileId={reviewData.targetId}
                    onClose={() => setReviewData(null)}
                />
            )}
        </section>
    );
};
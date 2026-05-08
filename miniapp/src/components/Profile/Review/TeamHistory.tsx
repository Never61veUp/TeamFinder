import React, { useEffect, useState } from 'react';
import { httpClient } from '../../../lib/http-client';
import { reviewService } from '../../../services/reviewService';
import { ReviewModal } from './ReviewModal';
import { Button } from '../../ui/Button';

interface TeamHistoryProps {
    currentUserId: string;
}

export const TeamHistory: React.FC<TeamHistoryProps> = ({ currentUserId }) => {
    const [pastTeams, setPastTeams] = useState<any[]>([]);
    const [profilesData, setProfilesData] = useState<Record<string, any>>({});
    const [ratedIds, setRatedIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [reviewData, setReviewData] = useState<{ teamId: string, targetId: string } | null>(null);

    useEffect(() => {
        const fetchEverything = async () => {
            setIsLoading(true);
            try {
                const [teamsRes, myReviewsRes] = await Promise.all([
                    httpClient.get('/teams/my-team-list?status=0'),
                    reviewService.getMy()
                ]);

                const teamsArray = Array.isArray(teamsRes) ? teamsRes : (teamsRes as any).data || [];
                const reviews = Array.isArray(myReviewsRes) ? myReviewsRes : (myReviewsRes as any).data || [];

                const ratedSet = new Set<string>();
                reviews.forEach((r: any) => {
                    const id = r.targetProfileId || r.targetId || r.target?.id || r.profileId;
                    if (id) {
                        ratedSet.add(String(id));
                    } else if (r.reviewerId && r.reviewerId !== currentUserId) {
                        ratedSet.add(String(r.reviewerId));
                    }
                });

                setRatedIds(ratedSet);
                setPastTeams(teamsArray);

                const allMemberIds = teamsArray.flatMap((team: any) =>
                    team.members?.map((m: any) => typeof m === 'object' ? (m.profileId || m.id) : m) || []
                );
                const uniqueIds = Array.from(new Set(allMemberIds)).filter(id => id && id !== currentUserId) as string[];

                const profileMap: Record<string, any> = {};
                await Promise.all(uniqueIds.map(async (id) => {
                    try {
                        const p = await httpClient.get(`/profiles/${id}`);
                        profileMap[id] = (p as any).data || p;
                    } catch (err) {
                        console.error(`Ошибка загрузки профиля ${id}`, err);
                    }
                }));
                setProfilesData(profileMap);

            } catch (error) {
                console.error("Ошибка загрузки истории:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEverything();
    }, [currentUserId]);

    const handleReviewSuccess = (targetId: string) => {
        setRatedIds(prev => new Set(prev).add(targetId));
        setReviewData(null);
    };

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

                            {team.members?.map((memberObj: any) => {
                                const memberId = typeof memberObj === 'object' ? (memberObj.profileId || memberObj.id) : memberObj;

                                if (memberId === currentUserId) return null;

                                const profile = profilesData[memberId];
                                const isAlreadyRated = ratedIds.has(memberId);

                                const name = profile?.telegramUser?.firstName ||
                                    profile?.firstName ||
                                    profile?.telegramUser?.username ||
                                    profile?.username ||
                                    profile?.name;

                                const displayName = name ? name : `ID: ${memberId?.slice(0, 6)}`;

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
                                            variant={isAlreadyRated ? "ghost" : "secondary"}
                                            className={`text-xs h-8 px-4 ${isAlreadyRated ? 'text-gray-400 cursor-default' : ''}`}
                                            onClick={() => !isAlreadyRated && setReviewData({ teamId: team.id, targetId: memberId })}
                                            disabled={isAlreadyRated}
                                        >
                                            {isAlreadyRated ? 'Оценено' : 'Оценить'}
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
                    onSuccess={handleReviewSuccess}
                />
            )}
        </section>
    );
};
import React, { useEffect, useState } from 'react';
import { ReviewModal } from './ReviewModal';
import { Button } from '../../ui/Button';
import { reviewService } from '../../../services/reviewService';
import type { Team, Profile, Review } from '../../../types/api';
import {teamService} from "../../../services/team.service.ts";
import {profileService} from "../../../services";

interface TeamHistoryProps {
    currentUserId: string;
}

export const TeamHistory: React.FC<TeamHistoryProps> = ({ currentUserId }) => {
    const [pastTeams, setPastTeams] = useState<Team[]>([]);
    const [profilesData, setProfilesData] = useState<Record<string, Profile>>({});
    const [ratedKeySet, setRatedKeySet] = useState<Set<string>>(new Set());

    const [isLoading, setIsLoading] = useState(true);

    const [reviewData, setReviewData] = useState<{
        teamId: string;
        targetId: string;
    } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                const [teams, reviews] = await Promise.all([
                    teamService.getMyHistory(),
                    reviewService.getByMe()
                ]);

                setPastTeams(teams);

                const ratedKeys = new Set<string>();

                reviews.forEach((review: Review) => {
                    ratedKeys.add(
                        `${review.teamId}:${review.targetProfileId}`
                    );
                });

                setRatedKeySet(ratedKeys);

                const memberIds = teams.flatMap(team =>
                    team.members.map(member =>
                        member.profileId || member.id
                    )
                );

                const uniqueIds = Array.from(new Set(memberIds))
                    .filter(id => id !== currentUserId);

                const profiles = await Promise.all(
                    uniqueIds.map(async id => {
                        try {
                            const profile = await profileService.getById(id);

                            return [id, profile] as const;
                        } catch (e) {
                            console.error(`Ошибка загрузки профиля ${id}`, e);

                            return null;
                        }
                    })
                );

                const validProfiles = profiles.filter(
                    (item): item is [string, Profile] => item !== null
                );

                const profileMap = Object.fromEntries(validProfiles);

                setProfilesData(profileMap);
            } catch (error) {
                console.error('Ошибка загрузки истории:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [currentUserId]);

    const handleReviewSuccess = (
        teamId: string,
        targetId: string
    ) => {
        setRatedKeySet(prev => {
            const updated = new Set(prev);

            updated.add(`${teamId}:${targetId}`);

            return updated;
        });

        setReviewData(null);
    };

    if (isLoading) {
        return (
            <div className="text-sm text-gray-400 py-4 italic">
                Загружаем историю...
            </div>
        );
    }

    if (pastTeams.length === 0) {
        return null;
    }

    return (
        <section className="w-full mt-6">
            <h2 className="font-bold text-[#333] mb-4 text-[16px] tracking-widest uppercase">
                История команд
            </h2>

            <div className="space-y-3">
                {pastTeams.map(team => (
                    <div
                        key={team.id}
                        className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
                    >
                        <h3 className="font-bold text-slate-800">
                            {team.name}
                        </h3>

                        <div className="space-y-2 pt-2 border-t border-gray-50 mt-2">
                            <p className="text-[11px] text-gray-400 font-bold uppercase">
                                Сокомандники:
                            </p>

                            {team.members.map(member => {
                                const memberId =
                                    member.profileId || member.id;

                                if (memberId === currentUserId) {
                                    return null;
                                }

                                const profile = profilesData[memberId];

                                const reviewKey = `${team.id}:${memberId}`;

                                const isAlreadyRated =
                                    ratedKeySet.has(reviewKey);

                                const displayName =
                                    profile?.name ||
                                    profile?.userName ||
                                    `ID: ${memberId.slice(0, 6)}`;

                                return (
                                    <div
                                        key={memberId}
                                        className="flex items-center justify-between bg-slate-50 p-3 rounded-xl"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-700">
                                                {displayName}
                                            </span>

                                            {profile?.userName && (
                                                <span className="text-[10px] text-gray-400">
                                                    @{profile.userName}
                                                </span>
                                            )}
                                        </div>

                                        <Button
                                            size="sm"
                                            variant={
                                                isAlreadyRated
                                                    ? 'ghost'
                                                    : 'secondary'
                                            }
                                            className={`text-xs h-8 px-4 ${
                                                isAlreadyRated
                                                    ? 'text-gray-400 cursor-default'
                                                    : ''
                                            }`}
                                            onClick={() => {
                                                if (isAlreadyRated) {
                                                    return;
                                                }

                                                setReviewData({
                                                    teamId: team.id,
                                                    targetId: memberId
                                                });
                                            }}
                                            disabled={isAlreadyRated}
                                        >
                                            {isAlreadyRated
                                                ? 'Оценено'
                                                : 'Оценить'}
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
                    onSuccess={(targetId: string) =>
                        handleReviewSuccess(
                            reviewData.teamId,
                            targetId
                        )
                    }
                />
            )}
        </section>
    );
};
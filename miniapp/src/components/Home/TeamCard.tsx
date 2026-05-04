import { useState, useEffect } from 'react'
import type { Team } from '../../types/api'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { feedService } from '../../services/feed.service'
import { httpClient } from '../../lib/http-client'
import { ProfilePreviewModal } from './ProfilePreviewModal';
import { RatingStars } from '../ui/RatingStars';
import './home.css'

interface TeamCardProps {
    team: Team
    myProfileId?: string;
    onOpenProfile?: (profileId: string) => void;
}

export function TeamCard({ team, myProfileId}: TeamCardProps) {
    const [showDetails, setShowDetails] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [alreadyJoined, setAlreadyJoined] = useState(false);

    const [membersData, setMembersData] = useState<Record<string, any>>({});
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);
    const [previewProfileId, setPreviewProfileId] = useState<string | null>(null);

    const storageKey = `req_sent_${team.id}`;

    useEffect(() => {
        const isMember = team.members?.some(m => String(m) === String(myProfileId));
        const hasLocalRecord = localStorage.getItem(storageKey) === 'true';

        if (isMember || hasLocalRecord) {
            setAlreadyJoined(true);
        }
    }, [team.members, myProfileId, storageKey]);

    useEffect(() => {
        if (showDetails && team.members && team.members.length > 0) {
            const fetchMembers = async () => {
                setIsLoadingMembers(true);
                try {
                    const uniqueIds = team.members
                        .map(m => typeof m === 'string' ? m : (m.profileId || m.id))
                        .filter(id => id && !membersData[String(id)]);

                    if (uniqueIds.length === 0) {
                        setIsLoadingMembers(false);
                        return;
                    }

                    const profileMap: Record<string, any> = { ...membersData };

                    await Promise.all(
                        uniqueIds.map(async (id) => {
                            try {
                                const res = await httpClient.get(`/profiles/${id}`);
                                profileMap[String(id)] = (res as any).data || res;
                            } catch (err) {
                                console.error(`Ошибка загрузки профиля ${id}`, err);
                            }
                        })
                    );

                    setMembersData(profileMap);
                } catch (error) {
                    console.error("Ошибка при загрузке участников:", error);
                } finally {
                    setIsLoadingMembers(false);
                }
            };

            fetchMembers();
        }
    }, [showDetails, team.members]);

    const handleJoin = async () => {
        setIsJoining(true);
        try {
            await feedService.requestJoin(team.id);
            localStorage.setItem(storageKey, 'true');
            setAlreadyJoined(true);
            alert('Заявка успешно отправлена!');
            setShowDetails(false);
        } catch (e: any) {
            alert('Ошибка при отправке заявки.');
        } finally {
            setIsJoining(false);
        }
    };


    const currentCount = team.currentMembers || team.members?.length || 1;
    const description = team.description || 'Описание отсутствует';
    const eventTitle = team.eventDetails?.title;
    const period = team.eventDetails?.period;
    const teamTags = team.eventDetails?.tags || [];

    return (
        <div className="team-card">
            <div className="team-card-header">
                <div className="team-info-group">
                    <h2 className="team-name">{team.name}</h2>
                    {eventTitle && <p className="team-event">{eventTitle}</p>}
                </div>
                <div className="team-capacity">
                    {currentCount} / {team.maxMembers}
                </div>
                <RatingStars rating={team.averageRating || 0} />
            </div>

            <p className="team-desc-short">
                {description.length > 80 ? description.slice(0, 80) + '...' : description}
            </p>

            <div className="skills-list">
                {teamTags.length > 0 ? (
                    teamTags.map((tag: any) => (
                        <Badge key={tag.id} variant="primary">
                            {tag.name}
                        </Badge>
                    ))
                ) : (
                    <span className="text-slate-500 text-xs italic">Направления не указаны</span>
                )}
            </div>

            <Button
                size="lg"
                variant="primary"
                className="team-card-btn"
                onClick={() => setShowDetails(true)}
                disabled={alreadyJoined}
            >
                {alreadyJoined ? 'Заявка подана' : 'Подробнее'}
            </Button>

            {showDetails && (
                <div className="modal-overlay" onClick={() => setShowDetails(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{team.name}</h2>
                            <span className="modal-capacity">{currentCount} / {team.maxMembers} чел.</span>
                        </div>

                        <div className="modal-body">
                            {(eventTitle || period) && (
                                <div className="modal-info-panel">
                                    {eventTitle && (
                                        <div className="info-item">
                                            <span className="info-label">Хакатон:</span>
                                            <span className="info-value">{eventTitle}</span>
                                        </div>
                                    )}
                                    {period?.start && (
                                        <div className="info-item">
                                            <span className="info-label">Даты:</span>
                                            <span className="info-value">
                                                {new Date(period.start).toLocaleDateString('ru-RU')}
                                                {' — '}
                                                {new Date(period.end).toLocaleDateString('ru-RU')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="modal-section">
                                <h3 className="text-[16px] font-bold text-slate-900 mb-2">О проекте:</h3>
                                <p className="full-desc">{team.description}</p>
                            </div>

                            {teamTags.length > 0 && (
                                <div className="modal-section mt-4">
                                    <h3 className="text-[16px] font-bold text-slate-900 mb-2">Направления:</h3>
                                    <div className="view-tags-list flex flex-wrap gap-2">
                                        {teamTags.map((tag: any) => (
                                            <Badge key={tag.id} className="badge">
                                                {tag.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {team.members && team.members.length > 0 && (
                                <div className="modal-section mt-6 mb-4">
                                    <h3 className="text-[16px] font-bold text-slate-900 mb-3">Участники</h3>
                                    {isLoadingMembers && Object.keys(membersData).length === 0 ? (
                                        <div className="text-sm text-gray-400 italic">Загрузка участников...</div>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            {team.members.map((member: any) => {
                                                const profileId = String(typeof member === 'string' ? member : (member.profileId || member.id));
                                                const data = membersData[profileId];

                                                const name = data?.telegramUser?.firstName || data?.firstName || data?.name || "Участник";
                                                const username = data?.telegramUser?.username || data?.username || "user";
                                                const initial = name !== "Участник" ? name[0].toUpperCase() : "?";

                                                return (
                                                    <div key={profileId} className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-violet-600 font-bold shadow-sm text-lg">
                                                                {initial}
                                                            </div>
                                                            <div className="flex flex-col text-left">
                                                                <span className="text-sm font-bold text-slate-900">{name}</span>
                                                                <span className="text-xs text-slate-400">@{username}</span>
                                                                <RatingStars rating={data?.rating || 0} size={12} />
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-violet-600 font-semibold"
                                                            onClick={() => setPreviewProfileId(profileId)}
                                                        >
                                                            Подробнее
                                                        </Button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="modal-actions mt-2">
                            <div className="mb-4">
                                <Button
                                    variant="primary"
                                    onClick={handleJoin}
                                    isLoading={isJoining}
                                    className="w-full"
                                    disabled={alreadyJoined}
                                >
                                    {alreadyJoined ? 'Заявка уже отправлена' : 'Подать заявку'}
                                </Button>
                            </div>
                            <Button variant="ghost" onClick={() => setShowDetails(false)}>
                                Закрыть
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {previewProfileId && (
                <ProfilePreviewModal
                    profileId={previewProfileId}
                    onClose={() => setPreviewProfileId(null)}
                />
            )}
        </div>
    )
}
import React, { useState, useEffect } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { Header } from '../ui/Header/Header';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { searchService } from '../../services/search.service';
import { invitationsService } from '../../services/invitations.service';
import { type Skill, teamService } from '../../types/api';
import type { Profile, Team } from '../../types/api';
import { RatingStars } from '../ui/RatingStars';
import './search.css';
import { profileService } from "../../services";
import { ProfileModal } from '../ui/ProfileModal/ProfileModal';

interface SearchPageProps {
    onOpenNotif: () => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onOpenNotif }) => {
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [myTeam, setMyTeam] = useState<Team | null>(null);
    const [invitingId, setInvitingId] = useState<string | null>(null);
    const [sentInvitations, setSentInvitations] = useState<string[]>([]);
    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
    const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);

    const [from, setFrom] = useState(0);
    const [count] = useState(5);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const getInviteKey = (profileId: string) => `invite_sent_${profileId}`;

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const team = await teamService.getMyTeam().catch(() => null);
                setMyTeam(team);

                const skills = await profileService.getAllSkills();
                setAvailableSkills(skills);

                if (team) {
                    const allInvites = await invitationsService.getInvitations(0);

                    const apiSentIds = allInvites
                        .filter((inv: any) => inv.senderTeamId === team.id)
                        .map((inv: any) => String(inv.receiverId));

                    const localSentIds = profiles
                        .map(p => p.id)
                        .filter(id => localStorage.getItem(getInviteKey(id)) === 'true');

                    const combined = Array.from(new Set([...apiSentIds, ...localSentIds]));

                    setSentInvitations(combined);
                }
            } catch (error) {
                console.error('❌ Ошибка инициализации:', error);
            }
        };

        loadInitialData();
    }, []);

    useEffect(() => {
        const localSentIds = profiles
            .map(p => p.id)
            .filter(id => localStorage.getItem(getInviteKey(id)) === 'true');

        if (localSentIds.length > 0) {
            setSentInvitations(prev =>
                Array.from(new Set([...prev, ...localSentIds]))
            );
        }
    }, [profiles]);

    useEffect(() => {
        const loadProfiles = async () => {
            setIsLoading(true);

            try {
                const res = await profileService.getAllProfiles(0, count);

                let data: Profile[];

                if (!res) {
                    data = [];
                } else if (Array.isArray(res)) {
                    data = res;
                } else if ((res as any).items) {
                    data = (res as any).items;
                } else {
                    console.warn('Неожиданный формат API:', res);
                    data = [];
                }

                setProfiles(data);
                setFrom(count);

                if (data.length < count) {
                    setHasMore(false);
                }

            } catch (e) {
                console.error('Ошибка загрузки профилей:', e);
                setProfiles([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadProfiles();
    }, []);

    useEffect(() => {
        const performSearch = async () => {

            if (!searchQuery && selectedSkills.length === 0) {
                return;
            }

            setIsLoading(true);

            try {
                let combinedResults: Profile[] = [];

                if (searchQuery) {
                    try {
                        const res = await searchService.findProfileByName(searchQuery);
                        if (res) combinedResults.push(res);
                    } catch {
                        console.log('По имени не нашли');
                    }
                }

                if (selectedSkills.length > 0) {
                    const skillResults = await Promise.all(
                        selectedSkills.map(async (skillId) => {
                            try {
                                return await searchService.getProfilesBySkill(skillId);
                            } catch {
                                return [];
                            }
                        })
                    );

                    combinedResults = [...combinedResults, ...skillResults.flat()];
                }

                const unique = Array.from(
                    new Map(combinedResults.map(p => [p.id, p])).values()
                );

                setProfiles(unique);

                setHasMore(false);

            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(performSearch, 400);
        return () => clearTimeout(timer);

    }, [searchQuery, selectedSkills]);

    useEffect(() => {
        if (!searchQuery && selectedSkills.length === 0) {
            const reload = async () => {
                setIsLoading(true);
                try {
                    const data = await profileService.getAllProfiles(0, count);
                    setProfiles(data);
                    setFrom(count);
                    setHasMore(true);
                } finally {
                    setIsLoading(false);
                }
            };

            reload();
        }
    }, [searchQuery, selectedSkills]);

    const handleLoadMore = async () => {
        setIsLoadingMore(true);

        try {
            const data = await profileService.getAllProfiles(from, count);

            setProfiles(prev => [...prev, ...data]);
            setFrom(prev => prev + count);

            if (data.length < count) {
                setHasMore(false);
            }
        } catch (e) {
            console.error('Ошибка подгрузки:', e);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleInvite = async (profileId: string) => {
        if (!myTeam) {
            alert('Сначала создайте команду!');
            return;
        }

        setInvitingId(profileId);

        try {
            await invitationsService.inviteToTeam(myTeam.id, profileId);
            localStorage.setItem(getInviteKey(profileId), 'true');

            setSentInvitations(prev =>
                prev.includes(profileId) ? prev : [...prev, profileId]
            );
        }
        catch (error: any) {
            const message =
                error?.response?.data ||
                error?.response?.body ||
                error?.message;

            if (typeof message === 'string' && message.includes("Invitation already sent")) {
                localStorage.setItem(getInviteKey(profileId), 'true');

                setSentInvitations(prev =>
                    prev.includes(profileId) ? prev : [...prev, profileId]
                );
            } else {
                console.error('Invite error:', error);
                alert('Не удалось отправить приглашение');
            }
        }
        finally {
            setInvitingId(null);
        }
    };

    const toggleSkill = (skillId: string) => {
        setSelectedSkills(prev =>
            prev.includes(skillId)
                ? prev.filter(id => id !== skillId)
                : [...prev, skillId]
        );
    };

    return (
        <div className="search-page">
            <Header title="Поиск участников" onNotificationClick={onOpenNotif} />

            <div className="search-input-container">
                <Search size={20} color="#94a3b8" />
                <input
                    type="text"
                    placeholder="Поиск по никнейму..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="search-filters-section">
                <h3 className="section-title">Выберите навыки для поиска</h3>

                <div className="selected-badges-row">
                    {selectedSkills.map((id) => {
                        const skill = availableSkills.find(s => s.id === id);

                        return (
                            <Badge key={id} className="skill-badge-active">
                                {skill?.name || '...'}
                                <X size={14} onClick={() => toggleSkill(id)} />
                            </Badge>
                        );
                    })}

                    <button className="add-filter-btn" onClick={() => setIsEditorOpen(true)}>
                        <Plus size={16} />
                        {selectedSkills.length ? 'Изменить' : 'Добавить'}
                    </button>
                </div>
            </div>

            <div className="profiles-list">
                {isLoading ? (
                    <div className="empty-state">Загрузка...</div>
                ) : profiles.length === 0 ? (
                    <div className="empty-state">Никого не нашли...</div>
                ) : (
                    <>
                        {profiles.map((profile) => (
                            <div key={profile.id} className="profile-card">
                                <div className="profile-card-header">
                                    <div>
                                        <h3 className="search-profile-name">{profile.name}</h3>
                                        <p className="search-profile-username">@{profile.username || 'user'}</p>
                                        <RatingStars rating={profile.rating || 0} />
                                    </div>

                                    <Button variant="secondary" className="detail-btn" onClick={() => setSelectedProfile(profile)}>
                                        Подробнее
                                    </Button>
                                </div>

                                <div className="profile-skills-row">
                                    {profile.skills?.map((s: any, i) => (
                                        <span key={i} className="profile-tag">
                                            #{typeof s === 'string' ? s : s.name}
                                        </span>
                                    ))}
                                </div>

                                <Button className="invite-btn-full"
                                    disabled={invitingId === profile.id || sentInvitations.includes(profile.id)}
                                    onClick={() => handleInvite(profile.id)}
                                >
                                    {invitingId === profile.id
                                        ? 'Отправка...'
                                        : sentInvitations.includes(profile.id)
                                            ? 'Заявка отправлена'
                                            : 'Пригласить'}
                                </Button>
                            </div>
                        ))}

                        {hasMore && !searchQuery && selectedSkills.length === 0 && (
                            <Button onClick={handleLoadMore} disabled={isLoadingMore}>
                                {isLoadingMore ? 'Загрузка...' : 'Показать ещё'}
                            </Button>
                        )}
                    </>
                )}
            </div>

            <ProfileModal
                profile={selectedProfile}
                onClose={() => setSelectedProfile(null)}
            />

            {isEditorOpen && (
                <div className="modal-overlay centered" onClick={() => setIsEditorOpen(false)}>
                    <div className="modal-content skills-modal" onClick={e => e.stopPropagation()}>
                        <h3 className="modal-title">Навыки</h3>

                        <div className="skills-selection-grid">
                            {availableSkills.map(skill => (
                                <div
                                    key={skill.id}
                                    className={`skill-label ${selectedSkills.includes(skill.id) ? 'active' : ''}`}
                                    onClick={() => toggleSkill(skill.id)}
                                >
                                    {skill.name}
                                </div>
                            ))}
                        </div>

                        <Button className="modal-close-btn" onClick={() => setIsEditorOpen(false)}>Готово</Button>
                    </div>
                </div>
            )}
        </div>
    );
};
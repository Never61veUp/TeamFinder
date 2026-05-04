import React, { useState, useEffect } from 'react';
import {
    Search, Plus, X, Trophy, Layout, Target,
    Folder, Star, CodeXml
} from 'lucide-react';
import { Header } from '../ui/Header/Header';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { searchService } from '../../services/search.service';
import { invitationsService } from '../../services/invitations.service';
import {type Skill, teamService} from '../../types/api';
import type { Profile, Team, ProfileWithGithub } from '../../types/api';
import './search.css';
import {profileService} from "../../services";

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

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const team = await teamService.getMyTeam().catch(() => null);
                setMyTeam(team);

                const skills = await profileService.getAllSkills();
                setAvailableSkills(skills);

                if (team) {
                    const allInvites = await invitationsService.getInvitations(0);
                    const sentIds = allInvites
                        .filter((inv: any) => inv.senderTeamId === team.id)
                        .map((inv: any) => inv.receiverId);
                    setSentInvitations(sentIds);
                }
            } catch (error) {
                console.error('❌ Ошибка инициализации:', error);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        const performSearch = async () => {
            if (!searchQuery && selectedSkills.length === 0) {
                setProfiles([]);
                return;
            }
            setIsLoading(true);
            try {
                let combinedResults: Profile[] = [];
                if (searchQuery) {
                    try {
                        const res = await searchService.findProfileByName(searchQuery);
                        if (res) combinedResults.push(res);
                    } catch (e) { console.log('По имени не нашли'); }
                }
                if (selectedSkills.length > 0) {
                    const skillResults = await Promise.all(
                        selectedSkills.map(async (skillId) => {
                            try { return await searchService.getProfilesBySkill(skillId); }
                            catch (err) { return []; }
                        })
                    );
                    combinedResults = [...combinedResults, ...skillResults.flat()];
                }
                const unique = Array.from(new Map(combinedResults.map(p => [p.id, p])).values());
                setProfiles(unique);
            } finally {
                setIsLoading(false);
            }
        };
        const timer = setTimeout(performSearch, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, selectedSkills]);

    const handleInvite = async (profileId: string) => {
        if (!myTeam) {
            alert('Сначала создайте команду!');
            return;
        }
        setInvitingId(profileId);
        try {
            await invitationsService.inviteToTeam(myTeam.id, profileId);
            setSentInvitations(prev => [...prev, profileId]);
        } catch (error: any) {
            if (error.response?.data === "Invitation already sent") {
                setSentInvitations(prev => [...prev, profileId]);
            } else {
                alert('Не удалось отправить приглашение');
            }
        } finally {
            setInvitingId(null);
        }
    };

    const toggleSkill = (skillId: string) => {
        setSelectedSkills(prev =>
            prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
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
                            <Badge key={`sel-${id}`} className="skill-badge-active">
                                {skill?.name || 'Загрузка...'}
                                <X size={14} onClick={() => toggleSkill(id)} className="badge-close-icon" />
                            </Badge>
                        );
                    })}
                    <button className="add-filter-btn" onClick={() => setIsEditorOpen(true)}>
                        <Plus size={16} /> {selectedSkills.length > 0 ? 'Изменить' : 'Добавить'}
                    </button>
                </div>
            </div>

            <div className="profiles-list">
                {isLoading ? (
                    <div className="empty-state">Загрузка...</div>
                ) : profiles.length === 0 && (searchQuery || selectedSkills.length > 0) ? (
                    <div className="empty-state">Никого не нашли...</div>
                ) : profiles.map((profile) => (
                    <div key={profile.id} className="profile-card">
                        <div className="profile-card-header">
                            <div>
                                <h3 className="search-profile-name">{profile.name}</h3>
                                <p className="search-profile-username">@{profile.username || 'user'}</p>
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star
                                            key={star}
                                            size={14}
                                            className={star <= profile.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}
                                        />
                                    ))}
                                </div>
                            </div>
                            <Button variant="secondary" className="detail-btn" onClick={() => setSelectedProfile(profile)}>
                                Подробнее
                            </Button>
                        </div>

                        <div className="profile-skills-row">
                            {profile.skills?.map((s: any, idx) => (
                                <span key={idx} className="profile-tag">
                                    #{typeof s === 'string' ? s : s.name}
                                </span>
                            ))}
                        </div>

                        <Button
                            className="invite-btn-full"
                            variant={sentInvitations.includes(profile.id) ? "secondary" : "primary"}
                            disabled={invitingId === profile.id || sentInvitations.includes(profile.id)}
                            onClick={() => handleInvite(profile.id)}
                        >
                            {invitingId === profile.id ? 'Отправка...' :
                                sentInvitations.includes(profile.id) ? 'Заявка отправлена' : 'Пригласить'}
                        </Button>
                    </div>
                ))}
            </div>

            {isEditorOpen && (
                <div className="modal-overlay centered" onClick={() => setIsEditorOpen(false)}>
                    <div className="modal-content skills-modal" onClick={e => e.stopPropagation()}>
                        <h3 className="modal-title">Навыки</h3>
                        <div className="skills-selection-grid">
                            {availableSkills.map((skill) => (
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

            {selectedProfile && (
                <div className="modal-overlay bottom" onClick={() => setSelectedProfile(null)}>
                    <div className="modal-content-bottom profile-detail-modal animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="modal-drag-handle" onClick={() => setSelectedProfile(null)} />

                        <div className="profile-detail-header">
                            <div className="detail-avatar">
                                {selectedProfile.name[0]}
                            </div>
                            <div>
                                <h2 className="detail-name">{selectedProfile.name}</h2>
                                <p className="detail-username">@{selectedProfile.username}</p>
                            </div>
                        </div>

                        <div className="detail-scroll-area">
                            <section className="detail-section">
                                <h4 className="detail-section-title">О себе</h4>
                                <p className="detail-description">
                                    {selectedProfile.description || "Пользователь пока не добавил описание."}
                                </p>
                            </section>

                            <div className="stats-grid">
                                <div className="stat-box">
                                    <Target className="stat-icon text-blue-500" />
                                    <div className="stat-value">{selectedProfile.hackathons || 0}</div>
                                    <div className="stat-label">Хакатоны</div>
                                </div>
                                <div className="stat-box">
                                    <Trophy className="stat-icon text-amber-500" />
                                    <div className="stat-value">{selectedProfile.wins || 0}</div>
                                    <div className="stat-label">Победы</div>
                                </div>
                                <div className="stat-box">
                                    <Layout className="stat-icon text-emerald-500" />
                                    <div className="stat-value">{selectedProfile.projects || 0}</div>
                                    <div className="stat-label">Проекты</div>
                                </div>
                            </div>

                            {(selectedProfile as ProfileWithGithub).githubInfo && (
                                <section className="github-card">
                                    <div className="github-header">
                                        <div className="github-icon-wrapper">
                                            <CodeXml size={18} />
                                        </div>
                                        <span className="github-title">GitHub</span>
                                    </div>
                                    <div className="github-stats-row">
                                        <div className="github-stat-item">
                                            <CodeXml className="text-slate-500 mb-1" size={14} />
                                            <div className="github-stat-label">Язык</div>
                                            <div className="github-stat-value">{(selectedProfile as ProfileWithGithub).githubInfo?.topLanguage || '—'}</div>
                                        </div>
                                        <div className="github-stat-item border-x">
                                            <Folder className="text-slate-500 mb-1" size={14} />
                                            <div className="github-stat-label">Репо</div>
                                            <div className="github-stat-value">{(selectedProfile as ProfileWithGithub).githubInfo?.repositoriesCount || 0}</div>
                                        </div>
                                        <div className="github-stat-item">
                                            <Star className="text-amber-400 mb-1" size={14} />
                                            <div className="github-stat-label">Звезды</div>
                                            <div className="github-stat-value">{(selectedProfile as ProfileWithGithub).githubInfo?.totalStars || 0}</div>
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>

                        <Button className="detail-close-btn" onClick={() => setSelectedProfile(null)}>
                            Закрыть
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
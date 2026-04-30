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
import { teamService } from '../../types/api';
import type { Profile, Team, ProfileWithGithub } from '../../types/api';
import { HARD_SKILLS } from '../../constants/hard-skills';
import './search.css';

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

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const team = await teamService.getMyTeam().catch(() => null);
                setMyTeam(team);

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
        <div className="search-page pb-20">
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
                <h3 className="section-title text-[10px] tracking-widest text-slate-400 font-bold uppercase mb-3">Выберите навыки для поиска</h3>
                <div className="selected-badges-row flex flex-wrap gap-2">
                    {selectedSkills.map((id) => {
                        const skill = HARD_SKILLS.find(s => s.id === id);
                        return (
                            <Badge key={`sel-${id}`} className="bg-violet-50 text-violet-600 border-violet-100 px-3 py-1.5 rounded-xl flex items-center gap-1 font-medium">
                                {skill?.name || 'Unknown'}
                                <X size={14} onClick={() => toggleSkill(id)} className="ml-1 cursor-pointer hover:text-violet-800" />
                            </Badge>
                        );
                    })}
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-dashed border-slate-300 text-slate-500 text-sm font-medium hover:bg-slate-50 transition-colors" onClick={() => setIsEditorOpen(true)}>
                        <Plus size={16} /> {selectedSkills.length > 0 ? 'Изменить' : 'Добавить'}
                    </button>
                </div>
            </div>

            <div className="profiles-list px-4 space-y-4 mt-6">
                {isLoading ? (
                    <div className="text-center py-10 text-slate-500">Загрузка...</div>
                ) : profiles.length === 0 && (searchQuery || selectedSkills.length > 0) ? (
                    <div className="text-center py-10 text-slate-400 text-sm">Никого не нашли...</div>
                ) : profiles.map((profile) => (
                    <div key={profile.id} className="bg-white border border-slate-100 rounded-4xl p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-xl text-slate-800 leading-tight">{profile.name}</h3>
                                <p className="text-violet-500 text-sm font-medium">@{profile.username || 'user'}</p>
                            </div>
                            <Button variant="secondary" className="rounded-2xl px-4 py-2 text-xs" onClick={() => setSelectedProfile(profile)}>
                                Подробнее
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {profile.skills?.map((s: any, idx) => (
                                <span key={idx} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[11px] font-bold uppercase tracking-wider">
                                    #{typeof s === 'string' ? s : s.name}
                                </span>
                            ))}
                        </div>

                        <Button
                            className="w-full rounded-2xl h-12 font-bold transition-all"
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
                <div className="fixed inset-0 z-1000 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setIsEditorOpen(false)}>
                    <div className="bg-white rounded-4xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="font-bold text-xl mb-4 text-slate-800">Навыки</h3>
                        <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-2">
                            {HARD_SKILLS.map((skill) => (
                                <div
                                    key={skill.id}
                                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer text-sm font-bold ${selectedSkills.includes(skill.id) ? 'border-violet-500 bg-violet-50 text-violet-600' : 'border-slate-100 text-slate-400'}`}
                                    onClick={() => toggleSkill(skill.id)}
                                >
                                    {skill.name}
                                </div>
                            ))}
                        </div>
                        <Button className="w-full mt-6 rounded-2xl h-12" onClick={() => setIsEditorOpen(false)}>Готово</Button>
                    </div>
                </div>
            )}

            {selectedProfile && (
                <div className="fixed inset-0 z-1000 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSelectedProfile(null)}>
                    <div className="bg-white rounded-t-[40px] p-8 w-full max-w-lg shadow-2xl animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" onClick={() => setSelectedProfile(null)} />

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-20 h-20 bg-violet-100 rounded-[28px] flex items-center justify-center text-violet-500 font-bold text-3xl">
                                {selectedProfile.name[0]}
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 leading-tight">{selectedProfile.name}</h2>
                                <p className="text-slate-400 font-medium">@{selectedProfile.username}</p>
                            </div>
                        </div>

                        <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2">
                            <section>
                                <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3">О себе</h4>
                                <p className="text-slate-600 leading-relaxed text-sm font-medium">
                                    {selectedProfile.description || "Пользователь пока не добавил описание."}
                                </p>
                            </section>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-slate-50 p-4 rounded-3xl text-center">
                                    <Target className="w-5 h-5 mx-auto mb-2 text-blue-500" />
                                    <div className="text-lg font-black text-slate-800">{selectedProfile.hackathons || 0}</div>
                                    <div className="text-[8px] text-slate-400 uppercase font-black tracking-wider">Хакатоны</div>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-3xl text-center">
                                    <Trophy className="w-5 h-5 mx-auto mb-2 text-amber-500" />
                                    <div className="text-lg font-black text-slate-800">{selectedProfile.wins || 0}</div>
                                    <div className="text-[8px] text-slate-400 uppercase font-black tracking-wider">Победы</div>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-3xl text-center">
                                    <Layout className="w-5 h-5 mx-auto mb-2 text-emerald-500" />
                                    <div className="text-lg font-black text-slate-800">{selectedProfile.projects || 0}</div>
                                    <div className="text-[8px] text-slate-400 uppercase font-black tracking-wider">Проекты</div>
                                </div>
                            </div>

                            {(selectedProfile as ProfileWithGithub).githubInfo && (
                                <section className="bg-slate-900 rounded-4xl p-6 text-white shadow-xl shadow-slate-200">
                                    <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                                        <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center text-white">
                                            <CodeXml size={18} />
                                        </div>
                                        <span className="font-black text-xs uppercase tracking-widest">Разработка</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="flex flex-col items-center">
                                            <CodeXml className="text-slate-500 mb-2" size={16} />
                                            <div className="text-[9px] text-slate-500 uppercase font-black mb-1">Язык</div>
                                            <div className="font-bold text-xs">{(selectedProfile as ProfileWithGithub).githubInfo?.topLanguage || '—'}</div>
                                        </div>
                                        <div className="flex flex-col items-center border-x border-white/5">
                                            <Folder className="text-slate-500 mb-2" size={16} />
                                            <div className="text-[9px] text-slate-500 uppercase font-black mb-1">Репо</div>
                                            <div className="font-bold text-xs">{(selectedProfile as ProfileWithGithub).githubInfo?.repositoriesCount || 0}</div>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <Star className="text-amber-400 mb-2" size={16} />
                                            <div className="text-[9px] text-slate-500 uppercase font-black mb-1">Звезды</div>
                                            <div className="font-bold text-xs">{(selectedProfile as ProfileWithGithub).githubInfo?.totalStars || 0}</div>
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>

                        <Button className="w-full mt-8 rounded-2xl h-14 font-black" onClick={() => setSelectedProfile(null)}>
                            Закрыть
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
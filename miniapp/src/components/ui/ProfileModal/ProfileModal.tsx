import React, { useState, useRef, useEffect } from 'react';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Computer, CodeXml, Folder, Star } from 'lucide-react';
import type { ProfileWithGithub, Skill } from '../../../types/api';
import { ReviewList } from '../Review/ReviewList';
import './profile-modal.css';

interface ProfileModalProps {
    profile: ProfileWithGithub | null;
    onClose: () => void;
    isLoading?: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ profile, onClose, isLoading }) => {
    const [transformY, setTransformY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [isAnimateReturn, setIsAnimateReturn] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const startYRef = useRef(0);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (profile) {
            setIsClosing(false);
            setIsAnimateReturn(false);
            setIsDragging(false);
            setTransformY(0);

            requestAnimationFrame(() => {
                setIsMounted(true);
            });
        } else {
            setIsMounted(false);
        }
    }, [profile]);

    if (isLoading) {
        return (
            <div className="modal-overlay bottom" onClick={onClose}>
                <div className="modal-content-bottom flex items-center justify-center min-h-75" onClick={e => e.stopPropagation()}>
                    <div className="font-bold text-violet-600 animate-pulse">Загрузка профиля...</div>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    const name = profile.name || "Пользователь";
    const initial = name[0]?.toUpperCase() || "?";

    const handleGithubClick = (profileUrl: string) => {
        const url = profileUrl;
        const webapp = window.Telegram?.WebApp;

        if (webapp?.openLink) {
            webapp.openLink(url);
        } else {
            window.open(url, '_blank');
        }
    };

    const triggerSmoothClose = () => {
        setIsClosing(true);
        setIsAnimateReturn(true);
        setIsDragging(false);
        const modalHeight = modalRef.current?.offsetHeight || window.innerHeight;
        setTransformY(modalHeight);

        setTimeout(() => {
            onClose();
        }, 250);
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (isClosing) return;
        setIsAnimateReturn(false);
        startYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (isClosing) return;
        const currentY = e.touches[0].clientY;
        const deltaY = currentY - startYRef.current;

        if (deltaY > 0) {
            if (scrollAreaRef.current && scrollAreaRef.current.contains(e.target as Node)) {
                if (scrollAreaRef.current.scrollTop > 0) {
                    return;
                }
            }

            setIsDragging(true);
            setTransformY(deltaY);

            if (e.cancelable) e.preventDefault();
        }
    };

    const handleTouchEnd = () => {
        if (isClosing || !isDragging) return;

        if (transformY > 120) {
            triggerSmoothClose();
        } else {
            setIsDragging(false);
            setIsAnimateReturn(true);

            setTimeout(() => {
                setTransformY(0);
            }, 0);

            setTimeout(() => {
                setIsAnimateReturn(false);
            }, 550);
        }
    };

    const getModalStyle = () => {
        const style: React.CSSProperties = {};

        if (isClosing || transformY > 0) {
            style.transform = `translateY(${transformY}px)`;
        } else if (!isMounted) {
            style.transform = 'translateY(100%)';
        } else {
            style.transform = 'translateY(0)';
        }

        if (isClosing) {
            style.transition = 'transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)';
        } else if (isAnimateReturn) {
            style.transition = 'transform 0.5s cubic-bezier(0.19, 1, 0.22, 1)';
        } else if (isDragging) {
            style.transition = 'none';
        } else {
            style.transition = 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)';
        }

        return style;
    };

    return (
        <div className={`modal-overlay bottom ${isClosing ? 'fade-out' : ''} ${isMounted ? 'fade-in' : ''}`} onClick={triggerSmoothClose}>
            <div
                ref={modalRef}
                className="modal-content-bottom profile-detail-modal"
                onClick={e => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={getModalStyle()}
            >
                <div className="modal-drag-handle" onClick={triggerSmoothClose} />

                <div className="profile-detail-header">
                    <div className="detail-avatar">{initial}</div>
                    <div>
                        <h2 className="detail-name">{name}</h2>
                        <p className="detail-username">@{profile.userName || 'user'}</p>
                    </div>
                </div>

                <div className="detail-scroll-area" ref={scrollAreaRef}>
                    <section className="detail-section mb-8">
                        <h4 className="detail-section-title">Навыки</h4>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills && profile.skills.length > 0 ? (
                                profile.skills.map((skill: Skill) => (
                                    <Badge key={skill.id} variant="secondary" className="px-3 py-1 font-bold">
                                        {skill.name}
                                    </Badge>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 italic">Навыки не указаны</p>
                            )}
                        </div>
                    </section>

                    <section className="detail-section mb-6">
                        <h4 className="detail-section-title">О себе</h4>
                        <p className="detail-description">{profile.description || "Нет описания."}</p>
                    </section>

                    {profile.githubInfo && (
                        <section className="github-card mb-6">
                            <div
                                className="flex items-center gap-2 mb-4 cursor-pointer hover:opacity-75 transition-opacity w-fit"
                                onClick={() => profile.githubInfo?.profileUrl && handleGithubClick(profile.githubInfo.profileUrl)}
                            >
                                <Computer size={18} className="text-emerald-400" />
                                <span className="font-bold text-sm underline decoration-emerald-400/50 underline-offset-4">
                                    GitHub: {profile.githubInfo.username}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-white/10 rounded-2xl p-3 text-center">
                                    <Folder size={15} className="mx-auto mb-1 opacity-50" />
                                    <div className="text-lg font-bold">{profile.githubInfo.repositoriesCount}</div>
                                    <div className="text-[10px] uppercase opacity-50 font-bold">Репо</div>
                                </div>
                                <div className="bg-white/10 rounded-2xl p-3 text-center">
                                    <Star size={15} className="mx-auto mb-1 text-amber-400" />
                                    <div className="text-lg font-bold">{profile.githubInfo.totalStars}</div>
                                    <div className="text-[10px] uppercase opacity-50 font-bold">Звезды</div>
                                </div>
                                <div className="bg-white/10 rounded-2xl p-3 items-center text-center flex flex-col justify-center min-h-20">
                                    <CodeXml size={15} className="mb-1 text-emerald-400" />
                                    <div className="text-emerald-400 text-[10px] font-bold truncate w-full px-1">
                                        {profile.githubInfo.topLanguage || '---'}
                                    </div>
                                    <div className="text-[10px] uppercase opacity-50 font-bold mt-1">Язык</div>
                                </div>
                            </div>
                        </section>
                    )}

                    <div className="mt-2 mb-6">
                        <ReviewList userId={profile.id} />
                    </div>
                </div>

                <Button variant="primary" className="detail-close-btn mt-auto" onClick={triggerSmoothClose}>
                    Закрыть
                </Button>
            </div>
        </div>
    );
};
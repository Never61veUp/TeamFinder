import React from 'react';
import { ProfileHeader } from './Header/ProfileHeader';
import { SkillTags } from './Skills/SkillTags';
import { GithubStats } from './Stats/GithubStats';
import { AboutMe } from './About/AboutMe';
import { AchievementsGrid } from './Achievements/AchievementsGrid';
import type { UserProfile } from '../../types/profile';
import './Profile.css'; // Òâîé îñíîâíîé ôàéë ñòèëåé

// Ïğèìåğ ìîêîâûõ äàííûõ
const mockUser: UserProfile = {
    name: 'Àëåêñàíäğ Ïåòğîâ',
    username: '@alexanderpetrov',
    skills: ['React', 'TypeScript', 'Node.js', 'Python', 'UI/UX Design'],
    about: 'Ôóëñòåê-ğàçğàáîò÷èê ñ îïûòîì ğàáîòû íàä âåá-ïğèëîæåíèÿìè. Ëşáëş ñîçäàâàòü èíòóèòèâíûå ïîëüçîâàòåëüñêèå èíòåğôåéñû è ó÷àñòâîâàòü â õàêàòîíàõ. Èùó êîìàíäó äëÿ ñîçäàíèÿ êğóòîãî ïğîåêòà!',
    githubStats: {
        repositories: 19,
        stars: 1,
        pullRequests: 45,
        topLanguage: 'Python',
        issues: 12,
        followers: 30,
    },
    achievements: {
        hackathons: 12,
        wins: 5,
        projects: 8,
    }
};

export const ProfilePage: React.FC = () => {
    return (
        <div className="profile-container">
            <ProfileHeader
                name={mockUser.name}
                username={mockUser.username}
                avatarUrl={mockUser.avatarUrl}
            />

            <div className="profile-content">
                <SkillTags skills={mockUser.skills} />
                <GithubStats stats={mockUser.githubStats} />
                <AboutMe text={mockUser.about} />
                <AchievementsGrid achievements={mockUser.achievements} />
            </div>
        </div>
    );
};
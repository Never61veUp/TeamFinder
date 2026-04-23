import {ProfileHeader} from './Header/ProfileHeader'
import {AboutMe} from './About/AboutMe'
import {AchievementsGrid} from './Achievements/AchievementsGrid'
import type {TelegramUser} from "../../types/api.ts";
import {useProfile} from "../hooks/useProfile.ts";
import {useGithub} from "../hooks/useGithub.ts";
import {GithubStatsSection} from "./Stats/GithubStats.tsx";
import {SkillsList} from "./Skills/SkillTags.tsx";
import {useState} from "react";

interface Props {
    user: TelegramUser
    onLogout: () => void
}

export const ProfilePage: React.FC<Props> = ({user, onLogout}) => {
    const { profile, skills, isLoading } = useProfile(user?.profileId);
    const { isConnecting, connect } = useGithub()
    if (isLoading) console.log("Loading"); //Создать экран загрузки

    const [achievements, setAchievements] = useState({
        hackathons: 0,
        wins: 0,
        projects: 0
    })

    let isEditing;
    return (
        <div className="profile-container pb-24 bg-white">

            <ProfileHeader
                name={user.username ?? 'User'}
                username={user.username ? `@${user.username}` : ''}
                avatarUrl={user.photoUrl}
            />
            <div className="profile-content px-4 space-y-4">
                <div className="flex justify-end pt-4">
                    'Сохранить' : 'Редактировать'
                </div>
                <SkillsList skills={skills}/>
                <AboutMe text={"dsa"}/>
                <AchievementsGrid
                    achievements={achievements}
                    isEditing={isEditing}
                    onChange={(k, v) =>
                        setAchievements(prev => ({...prev, [k]: v}))
                    }
                />
                <section className="w-full flex flex-col items-center">
                    <h2 className="font-bold text-[#333] mb-4 text-center text-[16px] uppercase tracking-widest">
                        GitHub Статистика
                    </h2>
                    <GithubStatsSection githubInfo={profile?.githubInfo} isConnecting={isConnecting} onConnect={connect} />
                </section>
                <div className="flex justify-center pt-8">
                    <button onClick={onLogout} className="text-red-400 text-sm font-bold">
                        Выйти
                    </button>
                </div>
            </div>
        </div>
    )
}
import {useCallback, useEffect, useState} from "react";
import type {ProfileWithGithub, Skill} from "../../types/api.ts";
import {profileService} from "../../services";

export function useProfile(profileId: string | undefined) {
    const [profile, setProfile] = useState<ProfileWithGithub | null>(null)
    const [skills, setSkills] = useState<Skill[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetch = useCallback(async () => {
        // Убрали проверку (!profileId), чтобы getMyProfile() мог вызваться
        setIsLoading(true)
        setError(null)
        try {
            // Если profileId передан, можно было бы запрашивать чужой профиль,
            // но так как у вас используется getMyProfile(), вызываем его.
            const data = await profileService.getMyProfile()
            setProfile(data)
            console.log("Данные профиля загружены:", data)
            setSkills(data.skills || [])
        } catch (e) {
            console.error("Ошибка загрузки профиля:", e)
            setError(e instanceof Error ? e.message : 'Failed to fetch profile')
        } finally {
            setIsLoading(false)
        }
    }, [profileId])

    useEffect(() => {
        fetch()
    }, [fetch])

    return { profile, skills, isLoading, error, refetch: fetch }
}
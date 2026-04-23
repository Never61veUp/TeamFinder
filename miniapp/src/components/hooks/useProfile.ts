import {useCallback, useEffect, useState} from "react";
import type {ProfileWithGithub, Skill} from "../../types/api.ts";
import {profileService} from "../../services";

export function useProfile(profileId: string | undefined) {
  const [profile, setProfile] = useState<ProfileWithGithub | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!profileId) return
    setIsLoading(true)
    setError(null)
    try {
      const [profileData, skillsData] = await Promise.all([
        profileService.getWithGithubStats(profileId),
        profileService.getSkills(profileId),
      ])
      setProfile(profileData)
      setSkills(skillsData)
    } catch (e) {
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
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

export const profileApi = {
    getProfile: async (profileId: string) => {
        const res = await axios.get(`${API_URL}/profiles/${profileId}/gitstats`)
        return res.data
    },

    updateProfile: async (userId: string, data: any) => {
        return axios.patch(`${API_URL}/profiles/${userId}`, data)
    }
}
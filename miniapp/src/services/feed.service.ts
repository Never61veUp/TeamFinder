import type {Team} from '../types/api'

const delay = (ms: number) => new Promise(res => setTimeout(res, ms))

export const feedService = {
    async getRecommendedTeams(): Promise<Team[]> {
        await delay(500) // Искусственная задержка для реалистичности
        return [
            {
                id: '1',
                name: 'InnovatorsHub',
                event: 'AI Hackathon 2026',
                description: 'Ищем фронтенд-разработчика для создания AI-powered приложения',
                currentMembers: 2,
                maxMembers: 4,
                skills: ['AI', 'React', 'Python'],
                members: [
                    { id: 'u1', initials: 'M' },
                    { id: 'u2', initials: 'Д' },
                ]
            },
            {
                id: '2',
                name: 'CodeCrafters',
                description: 'Создаём мобильное приложение для управления проектами',
                currentMembers: 1,
                maxMembers: 5,
                skills: ['Mobile', 'React Native', 'Node.js'],
                members: [
                    { id: 'u3', initials: 'A' }
                ]
            },
            {
                id: '3',
                name: 'BlockchainBros',
                description: 'Разрабатываем DeFi платформу на Ethereum',
                currentMembers: 2,
                maxMembers: 3,
                skills: ['Blockchain', 'Solidity', 'Web3'],
                members: [
                    { id: 'u4', initials: 'И' },
                    { id: 'u5', initials: 'E' }
                ]
            }
        ]
    }
}
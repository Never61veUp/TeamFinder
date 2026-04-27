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
                tags: [
                    { id: 1, title: 'AI' },
                    { id: 2, title: 'React' },
                    { id: 3, title: 'Python' }
                ],
                members: [
                    { id: 1, initials: 'M' },
                    { id: 2, initials: 'Д' },
                ]
            },
            {
                id: '2',
                name: 'CodeCrafters',
                description: 'Создаём мобильное приложение для управления проектами',
                currentMembers: 1,
                maxMembers: 5,
                tags: [
                    { id: 1, title: 'Mobile' },
                    { id: 2, title: 'React Native' },
                    { id: 3, title: 'Node.js' }
                ],
                members: [
                    { id: 3, initials: 'A' }
                ]
            },
            {
                id: '3',
                name: 'BlockchainBros',
                description: 'Разрабатываем DeFi платформу на Ethereum',
                currentMembers: 2,
                maxMembers: 3,
                tags: [
                    { id: 1, title: 'Blockchain' },
                    { id: 2, title: 'Solidity' },
                    { id: 3, title: 'Web3' }
                ],
                members: [
                    { id: 4, initials: 'И' },
                    { id: 5, initials: 'E' }
                ]
            }
        ]
    }
}
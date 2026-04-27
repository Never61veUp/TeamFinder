import type {Tag, Team} from '../types/api'
import {httpClient} from "../lib/http-client.ts";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms))


export const feedService = {
    async getEventTags(): Promise<Tag[]> {
        return await httpClient.get<Tag[]>('/teams/event-tags');
    },

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
                    { id: 1, name: 'AI' },
                    { id: 2, name: 'React' },
                    { id: 3, name: 'Python' }
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
                    { id: 1, name: 'Mobile' },
                    { id: 2, name: 'React Native' },
                    { id: 3, name: 'Node.js' }
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
                    { id: 1, name: 'Blockchain' },
                    { id: 2, name: 'Solidity' },
                    { id: 3, name: 'Web3' }
                ],
                members: [
                    { id: 4, initials: 'И' },
                    { id: 5, initials: 'E' }
                ]
            }
        ]
    }
}
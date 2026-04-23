import {config} from "./config.ts";

class HttpClient {
    private baseUrl: string
    private getToken: () => string | null

    constructor(baseUrl: string, getToken: () => string | null) {
        this.baseUrl = baseUrl
        this.getToken = getToken
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const token = this.getToken()
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...options.headers as Record<string, string>,
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers,
        })

        if (!response.ok) {
            const text = await response.text()
            throw new Error(text || `Request failed: ${response.status}`)
        }

        const contentType = response.headers.get('content-type')
        if (!contentType?.includes('application/json')) {
            return {} as T
        }

        return response.json()
    }

    get<T>(endpoint: string) {
        return this.request<T>(endpoint)
    }

    post<T>(endpoint: string, body?: unknown) {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        })
    }

    put<T>(endpoint: string, body?: unknown) {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        })
    }

    patch<T>(endpoint: string, body?: unknown) {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        })
    }

    delete<T>(endpoint: string) {
        return this.request<T>(endpoint, { method: 'DELETE' })
    }
}

export const tokenStorage = {
    get: () => localStorage.getItem(config.storage.tokenKey),
    set: (token: string) => localStorage.setItem(config.storage.tokenKey, token),
    remove: () => localStorage.removeItem(config.storage.tokenKey),
}

export const httpClient = new HttpClient(config.api.baseUrl, tokenStorage.get)

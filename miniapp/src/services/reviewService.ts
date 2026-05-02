import {httpClient} from "../lib/http-client.ts";
import type {Review} from "../types/api.ts";

export const reviewService = {
    getByProfileId(profileId: string) {
        return httpClient.get<Review[]>(`/reviews/${profileId}`);
    },
    getMy() {
        return httpClient.get<Review[]>(`/reviews/`);
    },
}
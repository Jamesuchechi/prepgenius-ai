import axios from '../axios';

export interface GamificationProfile {
    current_points: number;
    total_points_earned: number;
    current_level: number;
    current_xp: number;
    current_streak: number;
    longest_streak: number;
    user: {
        id: number;
        username: string;
        profile_picture: string | null;
    };
}

export interface Badge {
    id: number;
    name: string;
    slug: string;
    description: string;
    icon_name: string;
    points_award: number;
    category: string;
    earned: boolean;
    earned_at?: string;
}

export const gamificationApi = {
    getProfile: async () => {
        const response = await axios.get<GamificationProfile>('/v1/gamification/profile/');
        return response.data;
    },

    getBadges: async () => {
        const response = await axios.get<Badge[]>('/v1/gamification/badges/');
        return response.data;
    },

    getLeaderboard: async (period = 'weekly') => {
        const response = await axios.get<GamificationProfile[]>('/v1/gamification/leaderboard/', {
            params: { period }
        });
        return response.data;
    }
};

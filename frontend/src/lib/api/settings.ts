import axios from '../axios';
import { User } from '@/store/authStore';

export const settingsApi = {
    updateProfile: async (data: Partial<User>) => {
        // Use the multi-part parser supported endpoint if there are images, 
        // but for now we'll handle JSON partial updates.
        const response = await axios.patch<User>('/v1/accounts/users/update_profile/', data);
        return response.data;
    },
    changePassword: async (data: any) => {
        const response = await axios.post('/v1/accounts/users/change_password/', data);
        return response.data;
    }
};

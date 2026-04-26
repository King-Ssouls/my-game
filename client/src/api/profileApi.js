import http from './http.js';

const profileApi = {
    async getMe() {
        const response = await http.get('/api/profile/me');
        return response.data;
    },

    async updateMe(payload) {
        const response = await http.patch('/api/profile/me', payload);
        return response.data;
    }
};

export default profileApi;
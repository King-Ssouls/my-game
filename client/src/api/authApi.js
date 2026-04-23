import http from './http.js'

const  authApi = {
    async register(payload) {
        const result = await http.post('/api/auth/register', payload);
        return result.data;
    },

    async login(payload) {
        const result = await http.post('/api/auth/login', payload);
        return result.data;
    },

    async getMe(payload) {
        const result = await http.get('/api/auth/me', payload);
        return result.data;
    },
};

export default authApi;
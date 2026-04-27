import http from './http.js';


const levelsApi = {
    async getLevels() {
        const response = await http.get('/api/levels');
        return response.data;
    },

    async startLevel(levelNumber) {
        const response = await http.post(`/api/levels/${levelNumber}/start`, {});
        return response.data;
    }
};

export default levelsApi;
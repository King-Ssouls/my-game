import http from './http.js';


const recordsApi = {
    async getLevelRecords(levelNumber) {
        const response = await http.get(`/api/records/level/${levelNumber}`);
        return response.data;
    },

    async completeLevel(payload) {
        const response = await http.post('/api/records/complete', payload);
        return response.data;
    }
};

export default recordsApi;
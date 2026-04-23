import { getToken } from '../utils/auth.js';

const API_BASE_URL = 'http://localhost:5000';

async function request(path, method = 'GET', body = null){

    const token = getToken();

    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Ошибка запроса');
    }

    return data;
}

const http = {
    get(path) {
        return request(path, 'GET');
    },

    post(path, body) {
        return request(path, 'POST', body);
    }
};

export default http;
import { getToken } from '../utils/auth.js';

const API_BASE_URL = 'http://localhost:5000';


function normalizeErrorMessage(message, status) {
    if (message && MESSAGE_TRANSLATIONS[message]) {
        return MESSAGE_TRANSLATIONS[message];
    }

    if (message) {
        return message;
    }

    if (status === 400) {
        return 'Некорректный запрос';
    }

    if (status === 401) {
        return 'Требуется авторизация';
    }

    if (status === 404) {
        return 'Ресурс не найден';
    }

    if (status >= 500) {
        return 'Ошибка сервера';
    }

    return 'Не удалось выполнить запрос';
}

async function request(path, method = 'GET', body = null) {
    const token = getToken();

    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    let response;

    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null
        });
    } catch (error) {
        throw new Error('Не удалось подключиться к серверу');
    }

    let data = null;

    try {
        data = await response.json();
    } catch (error) {
        data = null;
    }

    if (!response.ok) {
        const baseMessage = normalizeErrorMessage(data?.message, response.status);
        const details = Array.isArray(data?.details) ? data.details.join(', ') : '';
        const finalMessage = details ? `${baseMessage}: ${details}` : baseMessage;

        throw new Error(finalMessage);
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

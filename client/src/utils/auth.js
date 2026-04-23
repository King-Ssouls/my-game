const ACCESS_TOKEN_KEY = 'glimmer_access_token';

export function saveToken(token) {
    if (!token) {
        return;
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export function getToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export function removeToken() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export function hasToken() {
    return Boolean(getToken());
};
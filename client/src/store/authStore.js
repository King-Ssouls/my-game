import { saveToken, getToken, removeToken } from '../utils/auth.js';


const state = {
    token: null,
    user: null,
    progress: null,
    isAuthenticated: false
};

const authStore = {
    hydrate() {
        const token = getToken();
        state.token = token;
        state.isAuthenticated = Boolean(token);
        return token;
    },
    setSession({ token, user, progress }) {
        if (token) {
            state.token = token;
            state.isAuthenticated = true;
            saveToken(token);
        }
        state.user = user || null;
        state.progress = progress || null;
    },
    clear(){
        state.token = null;
        state.user = null;
        state.progress = null;
        state.isAuthenticated = false;
        removeToken();
    },
    getState() {
        return {
            token: state.token,
            user: state.user,
            progress: state.progress,
            isAuthenticated: state.isAuthenticated,
        };
    },
    getToken() {
        return state.token;
    },
    getUser() {
        return state.user;
    },
    getProgress() {
        return state.progress;
    },
    isAuthenticated() {
        return state.isAuthenticated;
    },
    getIsAuthenticated() {
        return state.isAuthenticated;
    },
};
export default authStore;
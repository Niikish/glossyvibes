import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || '',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Response interceptor for API calls
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle common errors like 401 Unauthorized here if needed
        if (error.response && error.response.status === 401) {
            // Optional: Dispatch a clearUser/logout action or redirect to login
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

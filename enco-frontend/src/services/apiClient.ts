import axios from "axios"
import { getCachedAccessToken } from "../utils/tokenStorage"

export const apiClient = axios.create({
    baseURL : 'http://j14e104.p.ssafy.io/api/v1',
    timeout : 10000,
    headers : {
        'Content-Type' : 'application/json',
    }
});

apiClient.interceptors.request.use(
    async config =>{
        const token = await getCachedAccessToken();
        if(token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error),
);
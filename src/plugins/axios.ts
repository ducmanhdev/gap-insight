import axios, {AxiosRequestConfig} from "axios";
import {useUserStore} from "@/stores/user";

const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_PROD_URL || 'http://192.168.1.125:8000',
    // baseURL: 'https://gap-api-service.srv01.dtsmart.dev',
    paramsSerializer: {
        serialize: (params) => {
            const excludeElements = [null, undefined, ''];
            const newParams = Object.fromEntries(
                Object.entries(params).filter(([_, v]) => !excludeElements.includes(v))
            );
            return new URLSearchParams(newParams).toString();
        }
    }
});
instance.interceptors.request.use(function (config) {
    (config.headers as any).Authorization = `Bearer ${localStorage.getItem('access_token')}`;
    return config;
}, function (error) {
    return Promise.reject(error);
});
instance.interceptors.response.use(function (response) {
    if (!response.data.status) {
        return Promise.reject(response.data || 'Error');
    }
    return response;
}, function (error) {
    console.error(error);
    if(error.response.status === 401) {
        const userStore = useUserStore();
        userStore.logout();
    }
    return Promise.reject(error);
});

export default instance;
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/workspaces';
const axiosInstance = axios.create({ baseURL: API_URL });

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const getMembers = async (workspaceId: number) => {
    const response = await axiosInstance.get(`/${workspaceId}/members`);
    return response.data;
};

export const inviteMember = async (workspaceId: number, data: { email: string; role: string }) => {
    const response = await axiosInstance.post(`/${workspaceId}/members`, data);
    return response.data;
};

export const removeMember = async (workspaceId: number, userId: number) => {
    const response = await axiosInstance.delete(`/${workspaceId}/members/${userId}`);
    return response.data;
};
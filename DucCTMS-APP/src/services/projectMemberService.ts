import axios from 'axios';

const API_URL = 'http://localhost:8080/api/workspaces';
const axiosInstance = axios.create({ baseURL: API_URL });

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const getProjectMembers = async (workspaceId: number, projectId: number) => {
    const response = await axiosInstance.get(`/${workspaceId}/projects/${projectId}/members`);
    return response.data;
};

export const addProjectMember = async (workspaceId: number, projectId: number, data: { email: string; role: string }) => {
    const response = await axiosInstance.post(`/${workspaceId}/projects/${projectId}/members`, data);
    return response.data;
};

export const updateProjectMemberRole = async (workspaceId: number, projectId: number, userId: number, role: string) => {
    const response = await axiosInstance.put(`/${workspaceId}/projects/${projectId}/members/${userId}/role`, { role });
    return response.data;
};

export const removeProjectMember = async (workspaceId: number, projectId: number, userId: number) => {
    const response = await axiosInstance.delete(`/${workspaceId}/projects/${projectId}/members/${userId}`);
    return response.data;
};
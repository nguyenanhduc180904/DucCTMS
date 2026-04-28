import axios from 'axios';

const API_URL = 'http://localhost:8080/api/workspaces';

export const getProjectsByWorkspace = async (workspaceId: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/${workspaceId}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const createProject = async (workspaceId: string, data: { name: string; description: string; color: string }) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/${workspaceId}/projects`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const updateProject = async (workspaceId: string, projectId: number, data: any) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/${workspaceId}/projects/${projectId}`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const deleteProject = async (workspaceId: string, projectId: number) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/${workspaceId}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

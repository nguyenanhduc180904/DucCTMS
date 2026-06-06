import axios from 'axios';

const API_URL = 'http://localhost:8080/api/workspaces';

export const getProjectLabels = async (workspaceId: string, projectId: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/${workspaceId}/projects/${projectId}/labels`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const createLabel = async (workspaceId: string, projectId: string, data: { name: string; color: string }) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/${workspaceId}/projects/${projectId}/labels`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const updateLabel = async (workspaceId: string, projectId: string, labelId: number, data: { name: string; color: string }) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/${workspaceId}/projects/${projectId}/labels/${labelId}`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const deleteLabel = async (workspaceId: string, projectId: string, labelId: number) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/${workspaceId}/projects/${projectId}/labels/${labelId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};
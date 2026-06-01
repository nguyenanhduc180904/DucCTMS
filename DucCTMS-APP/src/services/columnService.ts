import axios from 'axios';

const API_URL = 'http://localhost:8080/api/workspaces';

export const createColumn = async (workspaceId: string, projectId: string, data: { name: string }) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/${workspaceId}/projects/${projectId}/columns`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};


export const updateColumn = async (workspaceId: string, projectId: string, columnId: number, data: { name: string }) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/${workspaceId}/projects/${projectId}/columns/${columnId}`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const deleteColumn = async (workspaceId: string, projectId: string, columnId: number) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/${workspaceId}/projects/${projectId}/columns/${columnId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

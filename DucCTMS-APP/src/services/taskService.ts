import axios from 'axios';

const API_URL = 'http://localhost:8080/api/workspaces';

export const createTask = async (workspaceId: string, projectId: string, data: any) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/${workspaceId}/projects/${projectId}/tasks`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const updateTask = async (workspaceId: string, projectId: string, taskId: number, data: any) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/${workspaceId}/projects/${projectId}/tasks/${taskId}`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const deleteTask = async (workspaceId: string, projectId: string, taskId: number) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/${workspaceId}/projects/${projectId}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const reorderTasks = async (workspaceId: string, projectId: string, payload: { id: number, columnId: number, position: number }[]) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/${workspaceId}/projects/${projectId}/tasks/reorder`, payload, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getTaskDetail = async (workspaceId: string, projectId: string, taskId: number) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/${workspaceId}/projects/${projectId}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const addAssigneeToTask = async (workspaceId: string, projectId: string, taskId: number, userId: number) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/${workspaceId}/projects/${projectId}/tasks/${taskId}/assignees?userId=${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const removeAssigneeFromTask = async (workspaceId: string, projectId: string, taskId: number, userId: number) => {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/${workspaceId}/projects/${projectId}/tasks/${taskId}/assignees/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
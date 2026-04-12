import axios from 'axios';
import type { Workspace } from '../types/workspace';

const API_URL = 'http://localhost:8080/api/workspaces';

export const workspaceService = {
    getMyWorkspaces: async (): Promise<Workspace[]> => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/mine`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};

export const createWorkspace = async (data: { name: string; description?: string }) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(API_URL, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
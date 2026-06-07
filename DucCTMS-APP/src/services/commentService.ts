import axios from 'axios';

const API_URL = 'http://localhost:8080/api/workspaces';

export const addCommentToTask = async (
    workspaceId: string,
    projectId: string,
    taskId: number,
    content: string
) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(
        `${API_URL}/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

export const deleteCommentFromTask = async (
    workspaceId: string,
    projectId: string,
    taskId: number,
    commentId: number
) => {
    const token = localStorage.getItem('token');
    const response = await axios.delete(
        `${API_URL}/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};
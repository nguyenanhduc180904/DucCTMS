import axios from 'axios';

const API_URL = 'http://localhost:8080/api/notifications';

export const getMyNotifications = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const markNotificationAsRead = async (id: number) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const markAllNotificationsAsRead = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

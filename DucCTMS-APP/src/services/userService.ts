import axios from 'axios';

export interface UserResponse {
    id: number;
    username: string;
    fullName: string;
    email: string;
    avatarUrl: string;
    isActive: boolean;
}

const API_URL = 'http://localhost:8080/api/users';

export const userService = {
    getMyProfile: async (): Promise<UserResponse> => {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    },
};

export const updateUserProfile = async (userId: number, values: any, file?: File) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();

    const updateData = {
        fullName: values.fullName,
        isActive: values.isActive,
        password: values.password,
    };
    formData.append('data', new Blob([JSON.stringify(updateData)], { type: 'application/json' }));

    if (file) {
        formData.append('avatar', file);
    }

    const response = await axios.put(`${API_URL}/profile/${userId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
        },
    });

    return response.data;
};
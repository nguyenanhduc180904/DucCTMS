import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loginApi, registerApi } from '../services/authService';
import { App } from 'antd';
import { useNavigate } from 'react-router-dom';

export const useLogin = () => {
    const { message } = App.useApp();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: loginApi,
        onSuccess: (data) => {
            localStorage.setItem('token', data.token);
            message.success('Đăng nhập thành công!');
            navigate('/');
        },
        onError: (error: any) => {
            const errorMsg = error.response?.data?.message || 'Tài khoản hoặc mật khẩu không đúng';
            message.error(errorMsg);
        }
    });
};

export const useRegister = () => {
    const { message } = App.useApp();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: registerApi,
        onSuccess: (data) => {
            message.success(data.message || 'Đăng ký tài khoản thành công!');
            navigate('/login');
        },
        onError: (error: any) => {
            const errorMsg = error.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại';
            message.error(errorMsg);
        }
    });
};

export const useLogout = () => {
    const navigate = useNavigate();
    const { message } = App.useApp();
    const queryClient = useQueryClient();

    const logout = () => {
        localStorage.removeItem('token');
        queryClient.clear();
        message.success('Đã đăng xuất!');
        navigate('/login', { replace: true });
    };

    return { logout };
};
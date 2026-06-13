import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/notificationService';

export const useNotifications = () => {
    return useQuery({
        queryKey: ['notifications'],
        queryFn: getMyNotifications,
    });
};

export const useMarkNotificationAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => markNotificationAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });
};

export const useMarkAllNotificationsAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => markAllNotificationsAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });
};

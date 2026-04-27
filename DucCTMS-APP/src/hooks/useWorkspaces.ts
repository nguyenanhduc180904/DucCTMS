import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createWorkspace, deleteWorkspace, updateWorkspace, workspaceService } from '../services/workspaceService';
import { message } from 'antd';

export const useWorkspaces = () => {
    return useQuery({
        queryKey: ['workspaces'],
        queryFn: workspaceService.getMyWorkspaces,
        staleTime: 5 * 60 * 1000,
    });
};

export const useCreateWorkspace = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createWorkspace,
        onSuccess: (newWorkspace) => {
            queryClient.setQueryData(['workspaces'], (oldData: any[]) => {
                return oldData ? [...oldData, newWorkspace] : [newWorkspace];
            });

            message.success('Tạo thành công!');
            queryClient.invalidateQueries({ queryKey: ['workspaces'] });
        },
    });
};

export const useUpdateWorkspace = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: { name: string; description?: string } }) =>
            updateWorkspace(id, data),

        onSuccess: () => {
            message.success('Cập nhật Workspace thành công!');

            queryClient.invalidateQueries({ queryKey: ['workspaces'] });
        },

        onError: (error: any) => {
            const errorMsg = error.response?.data || 'Có lỗi xảy ra khi cập nhật';
            message.error(errorMsg);
        }
    });
};

export const useDeleteWorkspace = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteWorkspace(id),
        onSuccess: () => {
            message.success('Đã xóa không gian làm việc');
            queryClient.invalidateQueries({ queryKey: ['workspaces'] });
        },
        onError: (err: any) => {
            message.error(err.response?.data?.message || 'Không thể xóa workspace');
        }
    });
};
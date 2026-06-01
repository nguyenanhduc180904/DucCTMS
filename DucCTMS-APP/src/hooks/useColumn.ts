// src/hooks/useColumn.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createColumn, deleteColumn, updateColumn } from '../services/columnService';
import { message } from 'antd';

export const useCreateColumn = (workspaceId: string | undefined, projectId: string | undefined) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { name: string }) => createColumn(workspaceId!, projectId!, data),
        onSuccess: () => {
            message.success('Thêm cột thành công!');
            // Khớp với queryKey của API getBoard bên useProject
            queryClient.invalidateQueries({ queryKey: ['projectBoard', workspaceId, projectId] });
        },
        onError: (error: any) => {
            message.error(error.response?.data || 'Không thể tạo cột mới');
        }
    });
};


export const useUpdateColumn = (workspaceId: string | undefined, projectId: string | undefined) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ columnId, data }: { columnId: number, data: { name: string } }) =>
            updateColumn(workspaceId!, projectId!, columnId, data),
        onSuccess: () => {
            message.success('Đổi tên cột thành công!');
            queryClient.invalidateQueries({ queryKey: ['projectBoard', workspaceId, projectId] });
        },
        onError: (error: any) => {
            message.error(error.response?.data || 'Không thể cập nhật cột');
        }
    });
};

export const useDeleteColumn = (workspaceId: string | undefined, projectId: string | undefined) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (columnId: number) => deleteColumn(workspaceId!, projectId!, columnId),
        onSuccess: () => {
            message.success('Đã xóa cột!');
            queryClient.invalidateQueries({ queryKey: ['projectBoard', workspaceId, projectId] });
        },
        onError: (error: any) => {
            message.error(error.response?.data || 'Không thể xóa cột, hãy xóa hết các thẻ bên trong trước.');
        }
    });
};
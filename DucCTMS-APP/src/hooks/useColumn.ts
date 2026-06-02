// src/hooks/useColumn.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createColumn, deleteColumn, reorderColumns, updateColumn } from '../services/columnService';
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

export const useReorderColumns = (workspaceId: string | undefined, projectId: string | undefined) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: { id: number, position: number }[]) =>
            reorderColumns(workspaceId!, projectId!, payload),
        onSuccess: () => {
            // Không nhất thiết phải hiển thị message success vì kéo thả liên tục sẽ gây spam thông báo.
            // Cứ để nó chạy ngầm im lặng cho mượt.
        },
        onError: (error: any) => {
            message.error(error.response?.data || 'Không thể lưu vị trí cột mới. Hệ thống sẽ khôi phục lại trạng thái cũ.');
            // Quan trọng: Nếu lỗi mạng hoặc server lỗi, phải gọi lại data để kéo UI về vị trí đúng trên DB
            queryClient.invalidateQueries({ queryKey: ['projectBoard', workspaceId, projectId] });
        }
    });
};
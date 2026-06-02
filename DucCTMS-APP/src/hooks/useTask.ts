import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { createTask, deleteTask, reorderTasks, updateTask } from '../services/taskService';

export const useCreateTask = (workspaceId: string | undefined, projectId: string | undefined) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => createTask(workspaceId!, projectId!, data),
        onSuccess: () => {
            message.success('Đã thêm nhiệm vụ mới!');
            // Làm mới lại Kanban Board để task hiện ra ngay lập tức
            queryClient.invalidateQueries({ queryKey: ['projectBoard', workspaceId, projectId] });
        },
        onError: (error: any) => {
            message.error(error.response?.data || 'Không thể tạo nhiệm vụ');
        }
    });
};

export const useUpdateTask = (workspaceId: string | undefined, projectId: string | undefined) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ taskId, data }: { taskId: number, data: any }) => updateTask(workspaceId!, projectId!, taskId, data),
        onSuccess: () => {
            message.success('Cập nhật nhiệm vụ thành công!');
            queryClient.invalidateQueries({ queryKey: ['projectBoard', workspaceId, projectId] });
        }
    });
};

export const useDeleteTask = (workspaceId: string | undefined, projectId: string | undefined) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (taskId: number) => deleteTask(workspaceId!, projectId!, taskId),
        onSuccess: () => {
            message.success('Đã xóa nhiệm vụ!');
            queryClient.invalidateQueries({ queryKey: ['projectBoard', workspaceId, projectId] });
        }
    });
};

export const useReorderTasks = (workspaceId: string | undefined, projectId: string | undefined) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: { id: number, columnId: number, position: number }[]) =>
            reorderTasks(workspaceId!, projectId!, payload),
        onSuccess: () => {
            // Chạy ngầm, không cần báo success để tránh phiền người dùng
        },
        onError: (error: any) => {
            message.error(error.response?.data || 'Lỗi đồng bộ vị trí công việc. Khôi phục trạng thái cũ.');
            // Revert lại data thật từ server nếu API có lỗi
            queryClient.invalidateQueries({ queryKey: ['projectBoard', workspaceId, projectId] });
        }
    });
};
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { addAssigneeToTask, createTask, deleteTask, getTaskDetail, removeAssigneeFromTask, reorderTasks, updateTask } from '../services/taskService';

export interface LabelDTO {
    id: number;
    name: string;
    color: string;
}

export interface AssigneeDTO {
    id: number;
    full_name: string;
    avatar_url: string | null;
}

export interface CommentDTO {
    id: number;
    user: string;
    content: string;
    created_at: string;
}

export interface TaskDetailDTO {
    id: number;
    title: string;
    description: string | null;
    priority: string;
    due_date: string | null;
    column_name: string;
    labels: LabelDTO[];
    assignees: AssigneeDTO[];
    comments: CommentDTO[];
}

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

export const useTaskDetail = (workspaceId: string | undefined, projectId: string | undefined, taskId: number | null) => {
    return useQuery<TaskDetailDTO>({
        // Thêm taskId vào queryKey để React Query tự động lấy lại data khi đổi task
        queryKey: ['taskDetail', workspaceId, projectId, taskId],
        queryFn: () => getTaskDetail(workspaceId!, projectId!, taskId!),
        // Chỉ gọi API khi đã có đầy đủ 3 tham số
        enabled: !!workspaceId && !!projectId && !!taskId,
    });
};

export const useAddAssignee = (workspaceId: string | undefined, projectId: string | undefined, taskId: number | null) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: number) => addAssigneeToTask(workspaceId!, projectId!, taskId!, userId),
        onSuccess: () => {
            message.success('Đã phân công thành viên vào công việc!');
            // Kích hoạt cập nhật lại Drawer chi tiết công việc và Kanban Board
            queryClient.invalidateQueries({ queryKey: ['taskDetail', workspaceId, projectId, taskId] });
            queryClient.invalidateQueries({ queryKey: ['projectBoard', workspaceId, projectId] });
        },
        onError: (error: any) => message.error(error.response?.data || 'Lỗi khi phân công thành viên')
    });
};

export const useRemoveAssignee = (workspaceId: string | undefined, projectId: string | undefined, taskId: number | null) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: number) => removeAssigneeFromTask(workspaceId!, projectId!, taskId!, userId),
        onSuccess: () => {
            message.success('Đã gỡ thành viên khỏi công việc');
            queryClient.invalidateQueries({ queryKey: ['taskDetail', workspaceId, projectId, taskId] });
            queryClient.invalidateQueries({ queryKey: ['projectBoard', workspaceId, projectId] });
        },
        onError: (error: any) => message.error(error.response?.data || 'Lỗi khi gỡ thành viên')
    });
};
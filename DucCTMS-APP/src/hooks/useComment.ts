import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { addCommentToTask, deleteCommentFromTask } from '../services/commentService';

export const useAddComment = (
    workspaceId: string | undefined,
    projectId: string | undefined,
    taskId: number | null
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (content: string) => addCommentToTask(workspaceId!, projectId!, taskId!, content),
        onSuccess: () => {
            message.success('Đã gửi bình luận thành công');
            // Làm mới dữ liệu chi tiết Task để cập nhật danh sách comment mới lập tức
            queryClient.invalidateQueries({ queryKey: ['taskDetail', workspaceId, projectId, taskId] });
        },
        onError: (error: any) => {
            message.error(error.response?.data || 'Không thể gửi bình luận');
        }
    });
};

export const useDeleteComment = (
    workspaceId: string | undefined,
    projectId: string | undefined,
    taskId: number | null
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (commentId: number) => deleteCommentFromTask(workspaceId!, projectId!, taskId!, commentId),
        onSuccess: () => {
            message.success('Đã xóa bình luận thành công');
            // Làm mới dữ liệu chi tiết Task sau khi xóa thành công
            queryClient.invalidateQueries({ queryKey: ['taskDetail', workspaceId, projectId, taskId] });
        },
        onError: (error: any) => {
            message.error(error.response?.data || 'Không thể xóa bình luận');
        }
    });
};
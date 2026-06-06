import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { createLabel, deleteLabel, getProjectLabels, updateLabel } from '../services/labelService';

export interface LabelDTO {
    id: number;
    name: string;
    color: string;
    createdAt: string;
}

export const useProjectLabels = (workspaceId: string | undefined, projectId: string | undefined) => {
    return useQuery<LabelDTO[]>({
        queryKey: ['labels', workspaceId, projectId],
        queryFn: () => getProjectLabels(workspaceId!, projectId!),
        enabled: !!workspaceId && !!projectId,
    });
};

export const useCreateLabel = (workspaceId: string | undefined, projectId: string | undefined) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { name: string; color: string }) =>
            createLabel(workspaceId!, projectId!, data),
        onSuccess: () => {
            message.success('Tạo nhãn mới thành công!');
            queryClient.invalidateQueries({ queryKey: ['labels', workspaceId, projectId] });
        },
        onError: (error: any) => {
            message.error(error.response?.data || 'Không thể tạo nhãn');
        }
    });
};

export const useUpdateLabel = (workspaceId: string | undefined, projectId: string | undefined) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ labelId, data }: { labelId: number, data: { name: string; color: string } }) =>
            updateLabel(workspaceId!, projectId!, labelId, data),
        onSuccess: () => {
            message.success('Cập nhật nhãn thành công!');
            queryClient.invalidateQueries({ queryKey: ['labels', workspaceId, projectId] });
        },
        onError: (error: any) => {
            message.error(error.response?.data || 'Không thể cập nhật nhãn');
        }
    });
};

export const useDeleteLabel = (workspaceId: string | undefined, projectId: string | undefined) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (labelId: number) => deleteLabel(workspaceId!, projectId!, labelId),
        onSuccess: () => {
            message.success('Xóa nhãn thành công');
            queryClient.invalidateQueries({ queryKey: ['labels', workspaceId, projectId] });
        },
        onError: (error: any) => {
            message.error(error.response?.data || 'Không thể xóa nhãn');
        }
    });
};
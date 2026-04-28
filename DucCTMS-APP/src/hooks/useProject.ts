import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProject, deleteProject, getProjectsByWorkspace, updateProject } from '../services/projectService';
import { message } from 'antd';

export interface ProjectDTO {
    id: number;
    name: string;
    description: string;
    color: string;
    taskCount: number;
}

export const useProjects = (workspaceId: string | undefined) => {
    return useQuery<ProjectDTO[]>({
        queryKey: ['projects', workspaceId],
        queryFn: () => getProjectsByWorkspace(workspaceId!),
        enabled: !!workspaceId,
    });
};


export const useCreateProject = (workspaceId: string | undefined) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { name: string; description: string; color: string }) =>
            createProject(workspaceId!, data),
        onSuccess: () => {
            message.success('Tạo dự án mới thành công!');
            queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
        },
        onError: (error: any) => {
            message.error(error.response?.data || 'Không thể tạo dự án');
        }
    });
};

export const useUpdateProject = (workspaceId: string | undefined) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ projectId, data }: { projectId: number, data: any }) =>
            updateProject(workspaceId!, projectId, data),
        onSuccess: () => {
            message.success('Cập nhật dự án thành công!');
            queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
        },
        onError: (error: any) => {
            message.error(error.response?.data || 'Không thể cập nhật dự án');
        }
    });
};

export const useDeleteProject = (workspaceId: string | undefined) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (projectId: number) => deleteProject(workspaceId!, projectId),
        onSuccess: () => {
            message.success('Xóa dự án thành công');
            queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
        },
        onError: (error: any) => message.error(error.response?.data || 'Không thể xóa dự án')
    });
};
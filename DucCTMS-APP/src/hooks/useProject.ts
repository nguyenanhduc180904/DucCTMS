import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProject, deleteProject, getProjectBoard, getProjectDetail, getProjectsByWorkspace, updateProject } from '../services/projectService';
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

export const useProjectDetail = (workspaceId: string | undefined, projectId: string | undefined) => {
    return useQuery<ProjectDTO>({
        queryKey: ['projectDetail', workspaceId, projectId],
        queryFn: () => getProjectDetail(workspaceId!, projectId!),
        enabled: !!workspaceId && !!projectId,
    });
};

// chi tiết dự án
export const useProjectBoard = (workspaceId: string | undefined, projectId: string | undefined) => {
    return useQuery({
        // Sử dụng mảng queryKey có chứa id để React Query tự động cache và phân biệt các project khác nhau
        queryKey: ['projectBoard', workspaceId, projectId],
        queryFn: () => getProjectBoard(workspaceId!, projectId!),
        // Chỉ gọi API khi đã có đủ workspaceId và projectId từ URL
        enabled: !!workspaceId && !!projectId,
    });
};
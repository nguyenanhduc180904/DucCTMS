import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addProjectMember, getProjectMembers, removeProjectMember, updateProjectMemberRole } from '../services/projectMemberService';
import message from 'antd/es/message';

export interface ProjectMember {
    userId: number;
    fullName: string;
    email: string;
    avatarUrl: string | null;
    role: 'MANAGER' | 'MEMBER';
    joinedAt: string;
}

export const useProjectMembers = (workspaceId: string | undefined, projectId: string | undefined) => {
    return useQuery<ProjectMember[]>({
        queryKey: ['project-members', workspaceId, projectId],
        queryFn: () => getProjectMembers(Number(workspaceId), Number(projectId)),
        enabled: !!workspaceId && !!projectId,
        staleTime: 5 * 60 * 1000,
    });
};

export const useAddProjectMember = (workspaceId: string | undefined, projectId: string | undefined) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { email: string; role: string }) =>
            addProjectMember(Number(workspaceId), Number(projectId), data),
        onSuccess: () => {
            message.success('Đã thêm thành viên vào dự án!');
            queryClient.invalidateQueries({ queryKey: ['project-members', workspaceId, projectId] });
        },
        onError: (error: any) => {
            message.error(error.response?.data || 'Không thể thêm thành viên');
        }
    });
};

export const useUpdateProjectRole = (workspaceId: string | undefined, projectId: string | undefined) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, role }: { userId: number; role: string }) =>
            updateProjectMemberRole(Number(workspaceId), Number(projectId), userId, role),
        onSuccess: () => {
            message.success('Cập nhật vai trò dự án thành công!');
            queryClient.invalidateQueries({ queryKey: ['project-members', workspaceId, projectId] });
        },
        onError: (error: any) => {
            message.error(error.response?.data || 'Không thể cập nhật vai trò');
        }
    });
};

export const useRemoveProjectMember = (workspaceId: string | undefined, projectId: string | undefined) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: number) =>
            removeProjectMember(Number(workspaceId), Number(projectId), userId),
        onSuccess: () => {
            message.success('Đã gỡ thành viên khỏi dự án');
            queryClient.invalidateQueries({ queryKey: ['project-members', workspaceId, projectId] });
        },
        onError: (error: any) => {
            message.error(error.response?.data || 'Không thể gỡ thành viên');
        }
    });
};
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMembers, inviteMember, removeMember } from '../services/workspaceMemberService';
import message from 'antd/es/message';

export interface Member {
    userId: number;
    fullName: string;
    email: string;
    avatarUrl: string | null;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    joinedAt: string;
}

export const useMembers = (workspaceId: string | undefined) => {
    return useQuery<Member[]>({
        queryKey: ['members', workspaceId],
        queryFn: () => getMembers(Number(workspaceId)),
        enabled: !!workspaceId,
        staleTime: 5 * 60 * 1000,
    });
};

export const useInviteMember = (workspaceId: string | undefined) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { email: string; role: string }) =>
            inviteMember(Number(workspaceId), data),

        onSuccess: () => {
            message.success('Đã mời thành viên thành công!');
            queryClient.invalidateQueries({ queryKey: ['members', workspaceId] });
        },

        onError: (error: any) => {
            const errorMsg = error.response?.data || 'Có lỗi xảy ra khi mời thành viên';
            message.error(errorMsg);
        }
    });
};

export const useRemoveMember = (workspaceId: string | undefined) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: number) =>
            removeMember(Number(workspaceId), userId),
        onSuccess: () => {
            message.success('Đã gỡ thành viên thành công');
            queryClient.invalidateQueries({ queryKey: ['members', workspaceId] });
        },
        onError: (error: any) => {
            message.error(error.response?.data || 'Không thể gỡ thành viên');
        }
    });
};
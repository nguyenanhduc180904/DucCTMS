import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createWorkspace, workspaceService } from '../services/workspaceService';
import { message } from 'antd';

export const useWorkspaces = () => {
    return useQuery({
        queryKey: ['workspaces'],
        queryFn: workspaceService.getMyWorkspaces,
        staleTime: 5 * 60 * 1000,
    });
};

export const useCreateWorkspace = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createWorkspace,
        onSuccess: (newWorkspace) => {
            queryClient.setQueryData(['workspaces'], (oldData: any[]) => {
                return oldData ? [...oldData, newWorkspace] : [newWorkspace];
            });

            message.success('Tạo thành công!');
            queryClient.invalidateQueries({ queryKey: ['workspaces'] });
        },
    });
};
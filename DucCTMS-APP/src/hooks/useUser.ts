import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { updateUserProfile, userService } from '../services/userService';

export const useMyProfile = () => {
    return useQuery({
        queryKey: ['my-profile'],
        queryFn: userService.getMyProfile,
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, values, file }: { userId: number; values: any; file?: File }) =>
            updateUserProfile(userId, values, file),
        onSuccess: () => {
            // Làm mới cache 'myProfile' để giao diện cập nhật ảnh và thông tin mới ngay lập tức
            queryClient.invalidateQueries({ queryKey: ['my-profile'] });
        },
    });
};
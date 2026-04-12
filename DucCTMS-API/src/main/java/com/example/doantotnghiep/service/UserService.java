package com.example.doantotnghiep.service;

import com.example.doantotnghiep.dto.request.UserUpdateRequest;
import com.example.doantotnghiep.dto.response.UserResponse;
import com.example.doantotnghiep.entity.User;
import com.example.doantotnghiep.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;

    public UserResponse getMyProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .isActive(user.getIsActive())
                .build();
    }

    public User updateProfile(Long userId, UserUpdateRequest request, MultipartFile avatarFile) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Cập nhật các field cơ bản
        user.setFullName(request.getFullName());
        user.setIsActive(request.getIsActive());

        // Nếu có password mới thì hash và lưu
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
             user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        // Xử lý upload ảnh
        if (avatarFile != null && !avatarFile.isEmpty()) {
            String imagePath = fileStorageService.saveFile(avatarFile);
            user.setAvatarUrl(imagePath);
        }

        return userRepository.save(user);
    }
}
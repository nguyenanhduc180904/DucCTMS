package com.example.doantotnghiep.service;

import com.example.doantotnghiep.dto.response.NotificationResponseDTO;
import com.example.doantotnghiep.entity.Notification;
import com.example.doantotnghiep.entity.User;
import com.example.doantotnghiep.repository.NotificationRepository;
import com.example.doantotnghiep.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public List<NotificationResponseDTO> getMyNotifications() {
        User user = getCurrentUser();
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        
        return notifications.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        User user = getCurrentUser();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo"));
                
        if (notification.getUser().getId().equals(user.getId())) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        } else {
            throw new RuntimeException("Không có quyền cập nhật thông báo này");
        }
    }

    @Transactional
    public void markAllAsRead() {
        User user = getCurrentUser();
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalse(user.getId());
        
        unreadNotifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    /**
     * Hàm dùng chung để tạo thông báo từ các chức năng khác (Task, Comment, Project...)
     */
    @Transactional
    public void createNotification(User receiver, User actor, String type, Long entityId, String entityType, String content) {
        // Tránh tự gửi thông báo cho chính mình (VD: mình tự comment vào task của mình)
        if (receiver == null || (actor != null && receiver.getId().equals(actor.getId()))) {
            return;
        }

        Notification notification = new Notification();
        notification.setUser(receiver);
        notification.setActor(actor);
        notification.setType(type);
        notification.setEntityId(entityId);
        notification.setEntityType(entityType);
        notification.setContent(content);
        notification.setIsRead(false);

        notificationRepository.save(notification);
        
        // Đẩy Real-time qua WebSocket cho receiver
        messagingTemplate.convertAndSend(
            "/topic/notifications/" + receiver.getId(),
            mapToDTO(notification)
        );
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }

    private NotificationResponseDTO mapToDTO(Notification notification) {
        NotificationResponseDTO dto = new NotificationResponseDTO();
        dto.setId(notification.getId());
        dto.setUserId(notification.getUser() != null ? notification.getUser().getId() : null);
        
        if (notification.getActor() != null) {
            dto.setActorId(notification.getActor().getId());
            dto.setActorName(notification.getActor().getFullName() != null ? notification.getActor().getFullName() : notification.getActor().getUsername());
            dto.setActorAvatar(notification.getActor().getAvatarUrl());
        }
        
        dto.setType(notification.getType());
        dto.setEntityId(notification.getEntityId());
        dto.setEntityType(notification.getEntityType());
        dto.setContent(notification.getContent());
        dto.setIsRead(notification.getIsRead());
        dto.setCreatedAt(notification.getCreatedAt());
        
        return dto;
    }
}

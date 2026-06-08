package com.example.doantotnghiep.service;

import com.example.doantotnghiep.event.ActivityLogEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class LogHelperService {

    private final ApplicationEventPublisher eventPublisher;

    /**
     * Hàm gọi chung để lưu log
     */
    public void logActivity(Long projectId, Long taskId, String action, Map<String, Object> details) {
        // Tự động lấy tên người đang đăng nhập
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();

        // Đóng gói thành Event và ném ra cho Hệ thống
        ActivityLogEvent event = ActivityLogEvent.builder()
                .actorUsername(currentUsername)
                .projectId(projectId)
                .taskId(taskId)
                .action(action)
                .details(details)
                .build();

        // Phát sự kiện (Listener bên kia sẽ chộp lấy và lưu DB ngầm)
        eventPublisher.publishEvent(event);
    }
}

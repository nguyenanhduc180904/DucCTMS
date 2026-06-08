package com.example.doantotnghiep.service;

import com.example.doantotnghiep.entity.ActivityLog;
import com.example.doantotnghiep.entity.Project;
import com.example.doantotnghiep.entity.Task;
import com.example.doantotnghiep.entity.User;
import com.example.doantotnghiep.event.ActivityLogEvent;
import com.example.doantotnghiep.repository.ActivityLogRepository;
import com.example.doantotnghiep.repository.ProjectRepository;
import com.example.doantotnghiep.repository.TaskRepository;
import com.example.doantotnghiep.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityLogListener {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    @Async
    @EventListener
    public void handleActivityLogEvent(ActivityLogEvent event) {
        try {
            // 1. Tìm các đối tượng Entity
            User actor = userRepository.findByUsername(event.getActorUsername()).orElse(null);
            Project project = projectRepository.findById(event.getProjectId()).orElse(null);

            Task task = null;
            if (event.getTaskId() != null) {
                task = taskRepository.findById(event.getTaskId()).orElse(null);
            }

            // 2. Map dữ liệu vào ActivityLog
            ActivityLog logEntry = new ActivityLog();
            logEntry.setUser(actor);
            logEntry.setProject(project);
            logEntry.setTask(task);
            logEntry.setAction(event.getAction());

            // CHỈ CẦN 1 DÒNG NÀY (Không cần ObjectMapper nữa)
            logEntry.setDetails(event.getDetails());

            // 3. Lưu vào DB
            activityLogRepository.save(logEntry);
            log.info("Lưu log thành công: Action={}, TaskId={}", event.getAction(), event.getTaskId());

        } catch (Exception e) {
            log.error("Lỗi khi lưu Activity Log ngầm: ", e);
        }
    }
}
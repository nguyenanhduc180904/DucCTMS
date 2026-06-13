package com.example.doantotnghiep.service;

import com.example.doantotnghiep.dto.response.CommentResponseDTO;
import com.example.doantotnghiep.entity.Comment;
import com.example.doantotnghiep.entity.Task;
import com.example.doantotnghiep.entity.User;
import com.example.doantotnghiep.repository.CommentRepository;
import com.example.doantotnghiep.repository.TaskRepository;
import com.example.doantotnghiep.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final SimpMessagingTemplate messagingTemplate;
    private final LogHelperService logHelper;
    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public CommentResponseDTO addComment(Long taskId, String content) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        Task task = taskRepository.findById(taskId)
                .filter(t -> t.getDeletedAt() == null)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhiệm vụ"));

        Comment comment = new Comment();
        comment.setTask(task);
        comment.setUser(currentUser);
        comment.setContent(content);
        comment.setCreatedAt(OffsetDateTime.now());

        Comment savedComment = commentRepository.save(comment);

        logHelper.logActivity(
                task.getColumn().getProject().getId(),
                taskId,
                "ADD_COMMENT",
                Map.of("comment_content", content) // Lưu nội dung comment vào cột JSON
        );

        // PHÁT TÍN HIỆU WEBSOCKET
        Long projectId = comment.getTask().getColumn().getProject().getId();
        messagingTemplate.convertAndSend("/topic/projects/" + projectId, "BOARD_UPDATED");

        // GỬI THÔNG BÁO CHO CÁC THÀNH VIÊN ĐƯỢC GÁN VÀO TASK
        if (task.getAssignees() != null) {
            task.getAssignees().forEach(assignee -> {
                notificationService.createNotification(
                    assignee,
                    currentUser,
                    "TASK_COMMENT",
                    task.getId(),
                    "TASK",
                    "đã bình luận trong nhiệm vụ \"" + task.getTitle() + "\""
                );
            });
        }

        return new CommentResponseDTO(
                savedComment.getId(),
                currentUser.getFullName(),
                savedComment.getContent(),
                savedComment.getCreatedAt().toString()
        );
    }

    @Transactional
    public void deleteComment(Long commentId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        Comment comment = commentRepository.findById(commentId)
                .filter(c -> c.getDeletedAt() == null)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bình luận"));

        // Chỉ người tạo bình luận mới có quyền xóa
        if (!comment.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Bạn không có quyền xóa bình luận này");
        }

        comment.setDeletedAt(OffsetDateTime.now());
        commentRepository.save(comment);

        logHelper.logActivity(
                comment.getTask().getColumn().getProject().getId(),
                comment.getTask().getId(),
                "DELETE_COMMENT",
                Map.of("message", "đã xóa một bình luận")
        );

        // PHÁT TÍN HIỆU WEBSOCKET
        Long projectId = comment.getTask().getColumn().getProject().getId();
        messagingTemplate.convertAndSend("/topic/projects/" + projectId, "BOARD_UPDATED");
    }
}
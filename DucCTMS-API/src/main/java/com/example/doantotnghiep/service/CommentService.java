package com.example.doantotnghiep.service;

import com.example.doantotnghiep.dto.response.CommentResponseDTO;
import com.example.doantotnghiep.entity.Comment;
import com.example.doantotnghiep.entity.Task;
import com.example.doantotnghiep.entity.User;
import com.example.doantotnghiep.repository.CommentRepository;
import com.example.doantotnghiep.repository.TaskRepository;
import com.example.doantotnghiep.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

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
    }
}
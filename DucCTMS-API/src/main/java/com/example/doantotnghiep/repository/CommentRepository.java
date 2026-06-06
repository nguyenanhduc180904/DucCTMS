package com.example.doantotnghiep.repository;

import com.example.doantotnghiep.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    int countByTaskId(Long taskId);

    // Lấy comment theo taskId, bỏ qua comment đã xóa, sắp xếp mới nhất lên trên
    List<Comment> findByTask_IdAndDeletedAtIsNullOrderByCreatedAtDesc(Long taskId);
}
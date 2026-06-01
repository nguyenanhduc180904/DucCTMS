package com.example.doantotnghiep.repository;

import com.example.doantotnghiep.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    int countByTaskId(Long taskId);
}
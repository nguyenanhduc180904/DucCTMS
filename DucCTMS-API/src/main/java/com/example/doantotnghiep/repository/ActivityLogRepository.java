package com.example.doantotnghiep.repository;

import com.example.doantotnghiep.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    // Tìm log của 1 task chưa bị xóa mềm, sắp xếp theo thời gian giảm dần
    List<ActivityLog> findByTask_IdAndDeletedAtIsNullOrderByCreatedAtDesc(Long taskId);
}
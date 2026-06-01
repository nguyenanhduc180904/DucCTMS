package com.example.doantotnghiep.repository;

import com.example.doantotnghiep.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    // Lấy tất cả task trong một mảng columnIds, sắp xếp theo vị trí
    List<Task> findByColumn_IdInAndDeletedAtIsNullOrderByPositionAsc(List<Long> columnIds);

    // Hàm tìm position lớn nhất trong 1 cột
    @Query("SELECT COALESCE(MAX(t.position), 0) FROM Task t WHERE t.column.id = :columnId AND t.deletedAt IS NULL")
    Integer findMaxPositionByColumnId(@Param("columnId") Long columnId);
}
package com.example.doantotnghiep.repository;

import com.example.doantotnghiep.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    // Lấy tất cả task trong một mảng columnIds, sắp xếp theo vị trí
    List<Task> findByColumn_IdInOrderByPositionAsc(List<Long> columnIds);
}
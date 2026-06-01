package com.example.doantotnghiep.repository;

import com.example.doantotnghiep.entity.ColumnEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ColumnRepository extends JpaRepository<ColumnEntity, Long> {
    // Lấy các cột của dự án, sắp xếp theo thứ tự hiển thị (position)
    List<ColumnEntity> findByProject_IdAndDeletedAtIsNullOrderByPositionAsc(Long projectId);

    // Lấy position lớn nhất
    @Query("SELECT COALESCE(MAX(c.position), 0) FROM ColumnEntity c WHERE c.project.id = :projectId")
    Integer findMaxPositionByProjectId(@Param("projectId") Long projectId);
}
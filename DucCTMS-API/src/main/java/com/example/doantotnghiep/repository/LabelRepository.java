package com.example.doantotnghiep.repository;

import com.example.doantotnghiep.entity.Label;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LabelRepository extends JpaRepository<Label, Long> {
    // Lấy danh sách nhãn của dự án chưa bị xóa
    List<Label> findByProject_IdAndDeletedAtIsNullOrderByIdDesc(Long projectId);

    // Tìm chi tiết 1 nhãn chưa bị xóa
    Optional<Label> findByIdAndProject_IdAndDeletedAtIsNull(Long id, Long projectId);
}
package com.example.doantotnghiep.service;

import com.example.doantotnghiep.dto.request.ColumnReorderRequest;
import com.example.doantotnghiep.dto.request.ColumnRequestDTO;
import com.example.doantotnghiep.dto.response.ColumnDTO;
import com.example.doantotnghiep.entity.ColumnEntity;
import com.example.doantotnghiep.entity.Project;
import com.example.doantotnghiep.repository.ColumnRepository;
import com.example.doantotnghiep.repository.ProjectRepository;
import com.example.doantotnghiep.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ColumnService {

    private final ColumnRepository columnRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    @Transactional
    public ColumnDTO createColumn(Long projectId, ColumnRequestDTO request) {
        // 1. Kiểm tra Project có tồn tại không
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án với ID: " + projectId));

        // 2. Tính toán vị trí hiển thị (nằm ở cuối cùng)
        Integer maxPosition = columnRepository.findMaxPositionByProjectId(projectId);
        Integer newPosition = maxPosition + 1;

        // 3. Khởi tạo dữ liệu
        ColumnEntity column = new ColumnEntity();
        column.setProject(project);
        column.setName(request.getName());
        column.setPosition(newPosition);

        // 4. Lưu Database
        ColumnEntity savedColumn = columnRepository.save(column);

        // 5. Trả về DTO
        ColumnDTO response = new ColumnDTO();
        response.setId(savedColumn.getId());
        response.setName(savedColumn.getName());
        response.setTasks(new ArrayList<>()); // Cột mới chưa có task

        return response;
    }

    // Hàm Sửa tên cột
    @Transactional
    public ColumnDTO updateColumnName(Long columnId, ColumnRequestDTO request) {
        ColumnEntity column = columnRepository.findById(columnId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cột với ID: " + columnId));

        column.setName(request.getName());
        ColumnEntity updatedColumn = columnRepository.save(column);

        ColumnDTO response = new ColumnDTO();
        response.setId(updatedColumn.getId());
        response.setName(updatedColumn.getName());
        return response;
    }

    // Hàm Xóa cột
    @Transactional
    public void deleteColumn(Long columnId) {
        ColumnEntity column = columnRepository.findById(columnId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cột với ID: " + columnId));

        column.setDeletedAt(OffsetDateTime.now());
        columnRepository.save(column);
    }

    @Transactional
    public void reorderColumns(Long projectId, List<ColumnReorderRequest> requests) {
        // 1. Lấy tất cả các cột của dự án hiện tại lên
        List<ColumnEntity> existingColumns = columnRepository.findByProjectIdAndDeletedAtIsNull(projectId);

        // Chuyển thành Map để tra cứu nhanh theo ID
        Map<Long, ColumnEntity> columnMap = existingColumns.stream()
                .collect(Collectors.toMap(ColumnEntity::getId, Function.identity()));

        // 2. Duyệt qua danh sách yêu cầu từ FE và cập nhật position
        for (ColumnReorderRequest req : requests) {
            ColumnEntity column = columnMap.get(req.getId());

            // Nếu cột tồn tại và thuộc về project này thì mới update
            if (column != null) {
                column.setPosition(req.getPosition());
            }
        }

        // 3. Lưu lại vào DB.
        columnRepository.saveAll(existingColumns);
    }
}
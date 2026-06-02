package com.example.doantotnghiep.service;

import com.example.doantotnghiep.dto.request.TaskReorderRequest;
import com.example.doantotnghiep.dto.request.TaskRequestDTO;
import com.example.doantotnghiep.dto.response.TaskDTO;
import com.example.doantotnghiep.entity.ColumnEntity;
import com.example.doantotnghiep.entity.Task;
import com.example.doantotnghiep.repository.ColumnRepository;
import com.example.doantotnghiep.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ColumnRepository columnRepository;

    @Transactional
    public TaskDTO createTask(TaskRequestDTO request) {
        // 1. Kiểm tra cột có tồn tại không
        ColumnEntity column = columnRepository.findById(request.getColumnId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cột đích!"));

        // 2. Tính toán vị trí (nằm cuối cùng trong cột)
        Integer maxPosition = taskRepository.findMaxPositionByColumnId(column.getId());
        Integer newPosition = maxPosition + 1;

        // 3. Gán dữ liệu vào Entity
        Task task = new Task();
        task.setColumn(column);
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPosition(newPosition);

        // Xử lý Enum Priority
        if (request.getPriority() != null) {
            task.setPriority(Task.Priority.valueOf(request.getPriority().toUpperCase()));
        }

        // Xử lý Ngày tháng (Ép kiểu chuỗi ISO từ React sang OffsetDateTime)
        if (request.getDueDate() != null && !request.getDueDate().isEmpty()) {
            task.setDueDate(OffsetDateTime.parse(request.getDueDate()));
        }

        // 4. Lưu vào Database
        Task savedTask = taskRepository.save(task);

        // 5. Build DTO trả về cho React hiển thị ngay lập tức
        TaskDTO dto = new TaskDTO();
        dto.setId(savedTask.getId());
        dto.setColumnId(column.getId());
        dto.setTitle(savedTask.getTitle());
        dto.setDescription(savedTask.getDescription());
        dto.setPriority(savedTask.getPriority().name());

        if (savedTask.getDueDate() != null) {
            dto.setDueDate(savedTask.getDueDate().toString());
        }

        dto.setCommentCount(0);
        dto.setLabels(new ArrayList<>());
        dto.setAssignees(new ArrayList<>());

        return dto;
    }

    //  Sửa Task
    @Transactional
    public TaskDTO updateTask(Long taskId, TaskRequestDTO request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhiệm vụ!"));

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());

        if (request.getPriority() != null) {
            task.setPriority(Task.Priority.valueOf(request.getPriority().toUpperCase()));
        }
        if (request.getDueDate() != null && !request.getDueDate().isEmpty()) {
            task.setDueDate(OffsetDateTime.parse(request.getDueDate()));
        }

        Task updatedTask = taskRepository.save(task);

        // Map sang DTO trả về (giản lược)
        TaskDTO dto = new TaskDTO();
        dto.setId(updatedTask.getId());
        dto.setTitle(updatedTask.getTitle());
        // ... set các trường khác tương tự lúc create
        return dto;
    }

    //  Xóa mềm Task
    @Transactional
    public void deleteTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhiệm vụ!"));

        task.setDeletedAt(OffsetDateTime.now()); // Xóa mềm
        taskRepository.save(task);
    }

    @Transactional
    public void reorderTasks(List<TaskReorderRequest> requests) {
        // 1. Chuyển List request thành Map để tra cứu theo ID cho nhanh
        Map<Long, TaskReorderRequest> requestMap = requests.stream()
                .collect(Collectors.toMap(TaskReorderRequest::getId, req -> req));

        // 2. Lấy tất cả các task cần update từ DB lên
        List<Task> tasksToUpdate = taskRepository.findAllById(requestMap.keySet());

        // 3. Cập nhật column và position mới
        for (Task task : tasksToUpdate) {
            TaskReorderRequest req = requestMap.get(task.getId());

            if (req != null) {
                // Cập nhật vị trí
                task.setPosition(req.getPosition());

                // Kiểm tra xem task có bị chuyển sang cột khác không
                // Nếu cột hiện tại khác với cột Frontend gửi lên -> Cập nhật cột mới
                if (task.getColumn() == null || !task.getColumn().getId().equals(req.getColumnId())) {

                    // Sử dụng getReferenceById để tạo Proxy object (Không query database)
                    // Rất tối ưu hiệu năng khi chỉ cần set khóa ngoại
                    ColumnEntity newColumn = columnRepository.getReferenceById(req.getColumnId());
                    task.setColumn(newColumn);
                }
            }
        }

        // 4. Lưu lại vào DB
        taskRepository.saveAll(tasksToUpdate);
    }
}
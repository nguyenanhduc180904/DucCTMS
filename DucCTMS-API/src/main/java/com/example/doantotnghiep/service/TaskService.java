package com.example.doantotnghiep.service;

import com.example.doantotnghiep.dto.request.TaskReorderRequest;
import com.example.doantotnghiep.dto.request.TaskRequestDTO;
import com.example.doantotnghiep.dto.response.*;
import com.example.doantotnghiep.entity.ColumnEntity;
import com.example.doantotnghiep.entity.Comment;
import com.example.doantotnghiep.entity.Task;
import com.example.doantotnghiep.entity.User;
import com.example.doantotnghiep.repository.ColumnRepository;
import com.example.doantotnghiep.repository.CommentRepository;
import com.example.doantotnghiep.repository.TaskRepository;
import com.example.doantotnghiep.repository.UserRepository;
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
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

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

    @Transactional(readOnly = true)
    public TaskDetailResponseDTO getTaskDetail(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .filter(t -> t.getDeletedAt() == null)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhiệm vụ hoặc nhiệm vụ đã bị xóa!"));

        TaskDetailResponseDTO dto = new TaskDetailResponseDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setPriority(task.getPriority() != null ? task.getPriority().name() : null);

        if (task.getDueDate() != null) {
            dto.setDueDate(task.getDueDate().toString());
        }

        // Lấy tên cột hiện tại
        if (task.getColumn() != null) {
            dto.setColumnName(task.getColumn().getName());
        }

        // Lấy danh sách nhãn (Labels)
        if (task.getLabels() != null) {
            dto.setLabels(task.getLabels().stream()
                    .map(label -> new LabelDTO(label.getId(), label.getName(), label.getColor()))
                    .collect(Collectors.toList()));
        } else {
            dto.setLabels(new ArrayList<>());
        }

        // Lấy danh sách người thực hiện (Assignees)
        if (task.getAssignees() != null) {
            dto.setAssignees(task.getAssignees().stream()
                    .map(user -> new AssigneeResponseDTO(user.getId(), user.getFullName(), user.getAvatarUrl()))
                    .collect(Collectors.toList()));
        } else {
            dto.setAssignees(new ArrayList<>());
        }

        // Lấy danh sách bình luận (Comments)
        List<Comment> comments = commentRepository.findByTask_IdAndDeletedAtIsNullOrderByCreatedAtDesc(taskId);
        dto.setComments(comments.stream()
                .map(c -> new CommentResponseDTO(
                        c.getId(),
                        c.getUser().getFullName(), // Lấy tên người bình luận
                        c.getContent(),
                        c.getCreatedAt() != null ? c.getCreatedAt().toString() : ""
                ))
                .collect(Collectors.toList()));

        return dto;
    }

    @Transactional
    public void addAssignee(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .filter(t -> t.getDeletedAt() == null)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhiệm vụ"));

        User user = userRepository.findById(userId)
                .filter(u -> u.getIsActive())
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại hoặc đã bị khóa"));

        // Kiểm tra xem người dùng đã được giao nhiệm vụ này chưa (tránh trùng lặp)
        if (task.getAssignees().stream().anyMatch(u -> u.getId().equals(userId))) {
            throw new RuntimeException("Thành viên này đã được phân công nhiệm vụ này rồi");
        }

        task.getAssignees().add(user);
        taskRepository.save(task);
    }

    @Transactional
    public void removeAssignee(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .filter(t -> t.getDeletedAt() == null)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhiệm vụ"));

        // Xóa user khỏi danh sách assignees dựa vào ID
        boolean removed = task.getAssignees().removeIf(user -> user.getId().equals(userId));

        if (!removed) {
            throw new RuntimeException("Thành viên này chưa được phân công nhiệm vụ này");
        }

        taskRepository.save(task);
    }
}
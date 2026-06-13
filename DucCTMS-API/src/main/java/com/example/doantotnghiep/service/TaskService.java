package com.example.doantotnghiep.service;

import com.example.doantotnghiep.dto.request.TaskReorderRequest;
import com.example.doantotnghiep.dto.request.TaskRequestDTO;
import com.example.doantotnghiep.dto.response.*;
import com.example.doantotnghiep.entity.*;
import com.example.doantotnghiep.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
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

    private final SimpMessagingTemplate messagingTemplate;
    private final LogHelperService logHelper;
    private final TaskRepository taskRepository;
    private final ColumnRepository columnRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final LabelRepository labelRepository;
    private final ActivityLogRepository activityLogRepository;
    private final NotificationService notificationService;

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

        logHelper.logActivity(
                savedTask.getColumn().getProject().getId(), // projectId
                savedTask.getId(), // taskId
                "CREATE_TASK", // action
                Map.of(
                        "title", savedTask.getTitle(),
                        "priority", savedTask.getPriority()) // details (JSON)
        );

        // PHÁT TÍN HIỆU WEBSOCKET (THÊM MỚI)
        Long projectId = savedTask.getColumn().getProject().getId();
        messagingTemplate.convertAndSend("/topic/projects/" + projectId, "BOARD_UPDATED");

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

    // Sửa Task
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

        logHelper.logActivity(
                task.getColumn().getProject().getId(),
                taskId,
                "UPDATE_TASK",
                Map.of("message", "đã cập nhật thông tin nhiệm vụ"));

        // PHÁT TÍN HIỆU WEBSOCKET
        Long projectId = updatedTask.getColumn().getProject().getId();
        messagingTemplate.convertAndSend("/topic/projects/" + projectId, "BOARD_UPDATED");

        // Map sang DTO trả về (giản lược)
        TaskDTO dto = new TaskDTO();
        dto.setId(updatedTask.getId());
        dto.setTitle(updatedTask.getTitle());
        // ... set các trường khác tương tự lúc create
        return dto;
    }

    // Xóa mềm Task
    @Transactional
    public void deleteTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhiệm vụ!"));

        task.setDeletedAt(OffsetDateTime.now()); // Xóa mềm
        taskRepository.save(task);

        // PHÁT TÍN HIỆU WEBSOCKET
        Long projectId = task.getColumn().getProject().getId();
        messagingTemplate.convertAndSend("/topic/projects/" + projectId, "BOARD_UPDATED");
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

                // Nếu task bị kéo sang một cột mới (khác ID cột hiện tại)
                if (task.getColumn() == null || !task.getColumn().getId().equals(req.getColumnId())) {

                    // Lưu lại tên cột cũ để ghi log
                    String oldColumnName = task.getColumn() != null ? task.getColumn().getName() : "Không xác định";

                    // Tìm cột mới (Dùng findById để lấy được Tên cột)
                    ColumnEntity newColumn = columnRepository.findById(req.getColumnId())
                            .orElseThrow(() -> new RuntimeException("Cột không tồn tại"));

                    task.setColumn(newColumn);

                    // GHI LOG: Chuyển cột
                    logHelper.logActivity(
                            newColumn.getProject().getId(),
                            task.getId(),
                            "MOVE_TASK",
                            Map.of(
                                    "from_column", oldColumnName,
                                    "to_column", newColumn.getName()));
                    
                    // GỬI THÔNG BÁO CHO CÁC THÀNH VIÊN ĐƯỢC GÁN
                    String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
                    User actor = userRepository.findByUsername(username).orElse(null);
                    if (actor != null && task.getAssignees() != null) {
                        task.getAssignees().forEach(assignee -> {
                            notificationService.createNotification(
                                assignee,
                                actor,
                                "TASK_MOVED",
                                task.getId(),
                                "TASK",
                                "đã chuyển nhiệm vụ \"" + task.getTitle() + "\" sang cột \"" + newColumn.getName() + "\""
                            );
                        });
                    }
                }
            }
        }

        // 4. Lưu lại vào DB
        taskRepository.saveAll(tasksToUpdate);

        if (!tasksToUpdate.isEmpty()) {
            Long projectId = tasksToUpdate.get(0).getColumn().getProject().getId();
            messagingTemplate.convertAndSend("/topic/projects/" + projectId, "BOARD_UPDATED");
        }
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
                        c.getCreatedAt() != null ? c.getCreatedAt().toString() : ""))
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

        logHelper.logActivity(
                task.getColumn().getProject().getId(),
                taskId,
                "ADD_ASSIGNEE",
                Map.of("user_name", user.getFullName()) // user là người vừa được gán
        );

        // PHÁT TÍN HIỆU WEBSOCKET
        Long projectId = task.getColumn().getProject().getId();
        messagingTemplate.convertAndSend("/topic/projects/" + projectId, "BOARD_UPDATED");

        // GỬI THÔNG BÁO
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        userRepository.findByUsername(username).ifPresent(actor -> {
            notificationService.createNotification(
                user, // user is the assignee
                actor,
                "TASK_ASSIGNED",
                task.getId(),
                "TASK",
                "đã giao cho bạn nhiệm vụ \"" + task.getTitle() + "\""
            );
        });
    }

    @Transactional
    public void removeAssignee(Long taskId, Long userId) {
        User user = userRepository.findById(userId)
                .filter(u -> u.getIsActive())
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại hoặc đã bị khóa"));

        Task task = taskRepository.findById(taskId)
                .filter(t -> t.getDeletedAt() == null)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhiệm vụ"));

        // Xóa user khỏi danh sách assignees dựa vào ID
        boolean removed = task.getAssignees().removeIf(u -> u.getId().equals(userId));

        if (!removed) {
            throw new RuntimeException("Thành viên này chưa được phân công nhiệm vụ này");
        }

        taskRepository.save(task);

        logHelper.logActivity(
                task.getColumn().getProject().getId(),
                taskId,
                "REMOVE_ASSIGNEE",
                Map.of("user_name", user.getFullName()) // user là người vừa bị gỡ
        );

        // PHÁT TÍN HIỆU WEBSOCKET
        Long projectId = task.getColumn().getProject().getId();
        messagingTemplate.convertAndSend("/topic/projects/" + projectId, "BOARD_UPDATED");
    }

    @Transactional
    public void addLabelToTask(Long taskId, Long labelId) {
        // 1. Kiểm tra Task có tồn tại và chưa bị xóa mềm không
        Task task = taskRepository.findById(taskId)
                .filter(t -> t.getDeletedAt() == null)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhiệm vụ!"));

        // 2. Kiểm tra Nhãn có tồn tại và chưa bị xóa mềm không
        Label label = labelRepository.findById(labelId)
                .filter(l -> l.getDeletedAt() == null)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhãn hoặc nhãn đã bị xóa!"));

        // 3. Kiểm tra xem Nhãn đã được gán cho Task này chưa (tránh trùng lặp dữ liệu)
        if (task.getLabels().stream().anyMatch(l -> l.getId().equals(labelId))) {
            throw new RuntimeException("Nhiệm vụ này đã được gán nhãn này từ trước!");
        }

        // 4. Thực hiện gán nhãn (Hibernate sẽ tự động chèn 1 bản ghi vào bảng
        // task_labels)
        task.getLabels().add(label);
        taskRepository.save(task);

        logHelper.logActivity(
                task.getColumn().getProject().getId(),
                taskId,
                "ADD_LABEL",
                Map.of("label_name", label.getName(), "label_color", label.getColor()));

        // PHÁT TÍN HIỆU WEBSOCKET
        Long projectId = task.getColumn().getProject().getId();
        messagingTemplate.convertAndSend("/topic/projects/" + projectId, "BOARD_UPDATED");
    }

    @Transactional
    public void removeLabelFromTask(Long taskId, Long labelId) {
        Label label = labelRepository.findById(labelId)
                .filter(l -> l.getDeletedAt() == null)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhãn hoặc nhãn đã bị xóa!"));

        // 1. Kiểm tra Task có tồn tại không
        Task task = taskRepository.findById(taskId)
                .filter(t -> t.getDeletedAt() == null)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhiệm vụ!"));

        // 2. Xóa nhãn khỏi danh sách của Task dựa vào ID nhãn
        boolean removed = task.getLabels().removeIf(l -> l.getId().equals(labelId));

        if (!removed) {
            throw new RuntimeException("Nhiệm vụ này hiện chưa được gán nhãn này!");
        }

        // 3. Lưu lại thay đổi (Hibernate sẽ tự động xóa bản ghi tương ứng trong bảng
        // task_labels)
        taskRepository.save(task);
        logHelper.logActivity(
                task.getColumn().getProject().getId(),
                taskId,
                "REMOVE_LABEL",
                Map.of("label_name", label.getName(), "label_color", label.getColor()));

        // PHÁT TÍN HIỆU WEBSOCKET
        Long projectId = task.getColumn().getProject().getId();
        messagingTemplate.convertAndSend("/topic/projects/" + projectId, "BOARD_UPDATED");

    }

    // Danh sách log task
    @Transactional(readOnly = true)
    public List<ActivityLogResponseDTO> getTaskActivities(Long taskId) {
        // Kiểm tra task tồn tại
        taskRepository.findById(taskId)
                .filter(t -> t.getDeletedAt() == null)
                .orElseThrow(() -> new RuntimeException("Nhiệm vụ không tồn tại"));

        List<ActivityLog> logs = activityLogRepository.findByTask_IdAndDeletedAtIsNullOrderByCreatedAtDesc(taskId);

        return logs.stream().map(log -> new ActivityLogResponseDTO(
                log.getId(),
                log.getUser() != null ? log.getUser().getFullName() : "Hệ thống",
                log.getAction(),
                log.getDetails(),
                log.getCreatedAt().toString())).collect(Collectors.toList());
    }
}
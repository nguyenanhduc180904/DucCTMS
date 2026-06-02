package com.example.doantotnghiep.controller;

import com.example.doantotnghiep.dto.request.TaskReorderRequest;
import com.example.doantotnghiep.dto.request.TaskRequestDTO;
import com.example.doantotnghiep.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/projects/{projectId}/tasks")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<?> createTask(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @RequestBody TaskRequestDTO request) {
        try {
            if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Tiêu đề nhiệm vụ không được để trống!");
            }
            if (request.getColumnId() == null) {
                return ResponseEntity.badRequest().body("Phải chỉ định cột để thêm nhiệm vụ!");
            }

            return ResponseEntity.ok(taskService.createTask(request));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi khi tạo nhiệm vụ: " + e.getMessage());
        }
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<?> updateTask(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @RequestBody TaskRequestDTO request) {
        try {
            return ResponseEntity.ok(taskService.updateTask(taskId, request));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi khi cập nhật nhiệm vụ: " + e.getMessage());
        }
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<?> deleteTask(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long taskId) {
        try {
            taskService.deleteTask(taskId);
            return ResponseEntity.ok("Xóa nhiệm vụ thành công");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi khi xóa nhiệm vụ: " + e.getMessage());
        }
    }

    @PutMapping("/reorder")
    public ResponseEntity<Void> reorderTasks(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @RequestBody List<TaskReorderRequest> requests
    ) {
        taskService.reorderTasks(requests);
        return ResponseEntity.ok().build();
    }
}
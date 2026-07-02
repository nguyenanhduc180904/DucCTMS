package com.example.doantotnghiep.controller;

import com.example.doantotnghiep.dto.request.ColumnReorderRequest;
import com.example.doantotnghiep.dto.request.ColumnRequestDTO;
import com.example.doantotnghiep.dto.response.ColumnDTO;
import com.example.doantotnghiep.service.ColumnService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/projects/{projectId}/columns")
@RequiredArgsConstructor
public class ColumnController {

    private final ColumnService columnService;

    @PostMapping
    public ResponseEntity<?> createColumn(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @RequestBody ColumnRequestDTO request) {
        try {
            if (request.getName() == null || request.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Tên cột không được để trống");
            }

            ColumnDTO newColumn = columnService.createColumn(projectId, request);
            return ResponseEntity.ok(newColumn);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi khi tạo cột mới: " + e.getMessage());
        }
    }

    @PutMapping("/{columnId}")
    public ResponseEntity<?> updateColumn(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long columnId,
            @RequestBody ColumnRequestDTO request) {
        try {
            if (request.getName() == null || request.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Tên cột không được để trống");
            }
            return ResponseEntity.ok(columnService.updateColumnName(columnId, request));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi khi cập nhật cột: " + e.getMessage());
        }
    }

    @DeleteMapping("/{columnId}")
    public ResponseEntity<?> deleteColumn(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long columnId) {
        try {
            columnService.deleteColumn(columnId);
            return ResponseEntity.ok("Xóa cột thành công");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi khi xóa cột: " + e.getMessage());
        }
    }

    @PutMapping("/reorder")
    public ResponseEntity<Void> reorderColumns(
            @PathVariable Long workspaceId, // Có thể dùng để check quyền (nếu cần)
            @PathVariable Long projectId,
            @RequestBody List<ColumnReorderRequest> requests
    ) {
        columnService.reorderColumns(projectId, requests);
        return ResponseEntity.ok().build();
    }
}
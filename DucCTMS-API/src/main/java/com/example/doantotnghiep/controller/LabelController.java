package com.example.doantotnghiep.controller;

import com.example.doantotnghiep.dto.request.LabelRequest;
import com.example.doantotnghiep.dto.response.LabelResponse;
import com.example.doantotnghiep.service.LabelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/projects/{projectId}/labels")
@RequiredArgsConstructor
public class LabelController {

    private final LabelService labelService;

    @GetMapping
    public ResponseEntity<?> getLabels(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId
    ) {
        try {
            List<LabelResponse> labels = labelService.getProjectLabels(projectId);
            return ResponseEntity.ok(labels);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createLabel(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @RequestBody LabelRequest request
    ) {
        try {
            LabelResponse newLabel = labelService.createLabel(projectId, request);
            return ResponseEntity.ok(newLabel);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{labelId}")
    public ResponseEntity<?> updateLabel(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long labelId,
            @RequestBody LabelRequest request
    ) {
        try {
            LabelResponse updatedLabel = labelService.updateLabel(projectId, labelId, request);
            return ResponseEntity.ok(updatedLabel);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{labelId}")
    public ResponseEntity<?> deleteLabel(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long labelId
    ) {
        try {
            labelService.deleteLabel(projectId, labelId);
            return ResponseEntity.ok("Đã xóa nhãn thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
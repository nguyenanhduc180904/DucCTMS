package com.example.doantotnghiep.controller;

import com.example.doantotnghiep.dto.request.CreateProjectRequest;
import com.example.doantotnghiep.dto.request.UpdateProjectRequest;
import com.example.doantotnghiep.dto.response.ProjectResponseDTO;
import com.example.doantotnghiep.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/projects")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<ProjectResponseDTO>> getProjects(
            @PathVariable Long workspaceId
    ) {
        return ResponseEntity.ok(projectService.getMyProjectsInWorkspace(workspaceId));
    }

    @PostMapping
    public ResponseEntity<?> createProject(
            @PathVariable Long workspaceId,
            @RequestBody CreateProjectRequest request
    ) {
        try {
            projectService.createProject(workspaceId, request);
            return ResponseEntity.ok("Tạo dự án thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{projectId}")
    public ResponseEntity<?> updateProject(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @RequestBody UpdateProjectRequest request
    ) {
        try {
            projectService.updateProject(workspaceId, projectId, request);
            return ResponseEntity.ok("Cập nhật dự án thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<?> deleteProject(@PathVariable Long workspaceId, @PathVariable Long projectId) {
        try {
            projectService.deleteProject(workspaceId, projectId);
            return ResponseEntity.ok("Đã xóa dự án");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
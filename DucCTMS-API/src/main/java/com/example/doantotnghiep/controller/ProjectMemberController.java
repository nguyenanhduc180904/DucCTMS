package com.example.doantotnghiep.controller;


import com.example.doantotnghiep.dto.request.AddProjectMemberRequest;
import com.example.doantotnghiep.dto.request.UpdateProjectRoleRequest;
import com.example.doantotnghiep.dto.response.ProjectMemberResponseDTO;
import com.example.doantotnghiep.service.ProjectMemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/projects/{projectId}/members")
@RequiredArgsConstructor
public class ProjectMemberController {
    private final ProjectMemberService projectMemberService;

    @GetMapping
    public ResponseEntity<List<ProjectMemberResponseDTO>> getMembers(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId
    ) {
        List<ProjectMemberResponseDTO> members = projectMemberService.getProjectMembers(workspaceId, projectId);
        return ResponseEntity.ok(members);
    }

    @PostMapping
    public ResponseEntity<String> addMember(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @Valid @RequestBody AddProjectMemberRequest request
    ) {
        try {
            projectMemberService.addMemberToProject(workspaceId, projectId, request);
            return ResponseEntity.ok("Thêm thành viên vào dự án thành công");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{userId}/role")
    public ResponseEntity<?> updateRole(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long userId,
            @Valid @RequestBody UpdateProjectRoleRequest request
    ) {
        try {
            projectMemberService.updateProjectMemberRole(workspaceId, projectId, userId, request.getRole());
            return ResponseEntity.ok("Cập nhật vai trò thành viên dự án thành công");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> removeMember(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long userId
    ) {
        try {
            projectMemberService.removeMemberFromProject(workspaceId, projectId, userId);
            return ResponseEntity.ok("Đã gỡ thành viên khỏi dự án thành công");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
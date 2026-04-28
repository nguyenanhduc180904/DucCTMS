package com.example.doantotnghiep.controller;

import com.example.doantotnghiep.dto.request.ChangeRoleRequest;
import com.example.doantotnghiep.dto.request.InviteMemberRequest;
import com.example.doantotnghiep.dto.response.WorkspaceMemberResponseDTO;
import com.example.doantotnghiep.service.WorkspaceMemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/members")
@RequiredArgsConstructor
public class WorkspaceMemberController {
    private final WorkspaceMemberService memberService;

    @GetMapping
    public ResponseEntity<List<WorkspaceMemberResponseDTO>> getMembers(
            @PathVariable Long workspaceId
    ) {
        List<WorkspaceMemberResponseDTO> members = memberService.getMembers(workspaceId);
        return ResponseEntity.ok(members);
    }

    @PostMapping
    public ResponseEntity<String> inviteMember(
            @PathVariable Long workspaceId,
            @Valid @RequestBody InviteMemberRequest request
    ) {
        try {
            memberService.addMember(workspaceId, request);
            return ResponseEntity.ok("Đã thêm thành viên thành công");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> removeMember(
            @PathVariable Long workspaceId,
            @PathVariable Long userId
    ) {
        try {
            memberService.removeMember(workspaceId, userId);
            return ResponseEntity.ok("Đã gỡ thành viên thành công");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{userId}/role")
    public ResponseEntity<?> changeRole(
            @PathVariable Long workspaceId,
            @PathVariable Long userId,
            @Valid @RequestBody ChangeRoleRequest request
    ) {
        try {
            memberService.updateRole(workspaceId, userId, request.getRole());
            return ResponseEntity.ok("Cập nhật vai trò thành công");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

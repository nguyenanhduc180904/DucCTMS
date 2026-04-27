package com.example.doantotnghiep.service;

import com.example.doantotnghiep.dto.request.WorkspaceRequestDTO;
import com.example.doantotnghiep.dto.response.WorkspaceResponseDTO;
import com.example.doantotnghiep.entity.User;
import com.example.doantotnghiep.entity.Workspace;
import com.example.doantotnghiep.entity.WorkspaceMember;
import com.example.doantotnghiep.entity.WorkspaceMemberId;
import com.example.doantotnghiep.repository.UserRepository;
import com.example.doantotnghiep.repository.WorkspaceMemberRepository;
import com.example.doantotnghiep.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;
    private final WorkspaceMemberRepository memberRepository;

    public List<WorkspaceResponseDTO> getMyWorkspaces() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        List<Workspace> workspaces = workspaceRepository.findAllByUserId(user.getId());

        return workspaces.stream()
                .map(ws -> {
                    String userRole = String.valueOf(ws.getMembers().stream()
                            .filter(m -> m.getUser().getId().equals(user.getId()))
                            .map(WorkspaceMember::getRole)
                            .findFirst()
                            .orElse(WorkspaceMember.Role.valueOf("MEMBER")));

                    return WorkspaceResponseDTO.builder()
                            .id(ws.getId())
                            .name(ws.getName())
                            .description(ws.getDescription())
                            .role(userRole)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public Workspace createWorkspace(WorkspaceRequestDTO dto) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Workspace workspace = Workspace.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .owner(user)
                .build();

        Workspace savedWorkspace = workspaceRepository.save(workspace);

        // 2. Lưu thông tin vào bảng workspace_members
        WorkspaceMemberId memberId = new WorkspaceMemberId();
        WorkspaceMember member = WorkspaceMember.builder()
                .id(memberId)
                .workspace(savedWorkspace)
                .user(user)
                .role(WorkspaceMember.Role.valueOf("OWNER"))
                .build();

        memberRepository.save(member);

        return savedWorkspace;
    }

    @Transactional
    public Workspace updateWorkspace(Long id, WorkspaceRequestDTO request) {
        Workspace workspace = workspaceRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Workspace hoặc đã bị xóa"));

        workspace.setName(request.getName());
        workspace.setDescription(request.getDescription());

        return workspaceRepository.save(workspace);
    }

    @Transactional
    public void deleteWorkspace(Long id) {
        Workspace workspace = workspaceRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("Workspace không tồn tại hoặc đã bị xóa trước đó"));

        workspace.setDeletedAt(OffsetDateTime.now());

        workspaceRepository.save(workspace);
    }
}
package com.example.doantotnghiep.service;

import com.example.doantotnghiep.dto.request.AddProjectMemberRequest;
import com.example.doantotnghiep.dto.response.ProjectMemberResponseDTO;
import com.example.doantotnghiep.entity.*;
import com.example.doantotnghiep.repository.ProjectMemberRepository;
import com.example.doantotnghiep.repository.ProjectRepository;
import com.example.doantotnghiep.repository.UserRepository;
import com.example.doantotnghiep.repository.WorkspaceMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectMemberService {
    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    public List<ProjectMemberResponseDTO> getProjectMembers(Long workspaceId, Long projectId) {
        Project project = projectRepository.findByIdAndWorkspaceIdAndDeletedAtIsNull(projectId, workspaceId)
                .orElseThrow(() -> new RuntimeException("Dự án không tồn tại hoặc không thuộc Không gian làm việc này"));

        List<ProjectMember> members = projectMemberRepository.findAllByProjectId(projectId);

        return members.stream()
                .map(member -> new ProjectMemberResponseDTO(
                        member.getUser().getId(),
                        member.getUser().getFullName(),
                        member.getUser().getEmail(),
                        member.getUser().getAvatarUrl(),
                        member.getRole() != null ? member.getRole().name() : null,
                        member.getJoinedAt()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public void addMemberToProject(Long workspaceId, Long projectId, AddProjectMemberRequest request) {
        Project project = projectRepository.findByIdAndWorkspaceIdAndDeletedAtIsNull(projectId, workspaceId)
                .orElseThrow(() -> new RuntimeException("Dự án không tồn tại hoặc không thuộc Không gian làm việc này"));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email này chưa đăng ký tài khoản hệ thống"));

        WorkspaceMemberId wmId = new WorkspaceMemberId(workspaceId, user.getId());
        if (!workspaceMemberRepository.existsById(wmId)) {
            throw new RuntimeException("Người dùng này chưa tham gia Không gian làm việc. Hãy mời họ vào Workspace trước.");
        }

        ProjectMemberId pmId = new ProjectMemberId(projectId, user.getId());
        if (projectMemberRepository.existsById(pmId)) {
            throw new RuntimeException("Người dùng đã là thành viên của dự án này rồi");
        }

        ProjectMember newMember = ProjectMember.builder()
                .id(pmId)
                .project(project)
                .user(user)
                .role(request.getRole())
                .joinedAt(OffsetDateTime.now())
                .build();

        projectMemberRepository.save(newMember);
    }

    @Transactional
    public void updateProjectMemberRole(Long workspaceId, Long projectId, Long userId, ProjectMember.Role newRole) {
        projectRepository.findByIdAndWorkspaceIdAndDeletedAtIsNull(projectId, workspaceId)
                .orElseThrow(() -> new RuntimeException("Dự án không tồn tại trong Không gian làm việc này"));

        ProjectMemberId memberId = new ProjectMemberId(projectId, userId);
        ProjectMember member = projectMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Thành viên không tồn tại trong dự án này"));

        member.setRole(newRole);
        projectMemberRepository.save(member);
    }

    @Transactional
    public void removeMemberFromProject(Long workspaceId, Long projectId, Long userId) {
        projectRepository.findByIdAndWorkspaceIdAndDeletedAtIsNull(projectId, workspaceId)
                .orElseThrow(() -> new RuntimeException("Dự án không tồn tại trong Không gian làm việc này"));

        ProjectMemberId memberId = new ProjectMemberId(projectId, userId);
        if (!projectMemberRepository.existsById(memberId)) {
            throw new RuntimeException("Thành viên không tồn tại trong dự án này");
        }

        projectMemberRepository.deleteById(memberId);
    }
}
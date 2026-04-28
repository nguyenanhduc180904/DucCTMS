package com.example.doantotnghiep.service;

import com.example.doantotnghiep.dto.request.CreateProjectRequest;
import com.example.doantotnghiep.dto.request.UpdateProjectRequest;
import com.example.doantotnghiep.dto.response.ProjectResponseDTO;
import com.example.doantotnghiep.entity.*;
import com.example.doantotnghiep.repository.ProjectMemberRepository;
import com.example.doantotnghiep.repository.ProjectRepository;
import com.example.doantotnghiep.repository.UserRepository;
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
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;
    private final ProjectMemberRepository projectMemberRepository;

    public List<ProjectResponseDTO> getMyProjectsInWorkspace(Long workspaceId ) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        List<Project> projects = projectRepository.findMyProjects(workspaceId, user.getId());

        return projects.stream()
                .map(p -> new ProjectResponseDTO(
                        p.getId(),
                        p.getName(),
                        p.getDescription(),
                        p.getColor(),
                        0
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public void createProject(Long workspaceId, CreateProjectRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace không tồn tại"));

        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setColor(request.getColor());
        project.setWorkspace(workspace);
        project.setCreatedBy(currentUser);

        Project savedProject = projectRepository.save(project);

        ProjectMemberId memberId = new ProjectMemberId(savedProject.getId(), currentUser.getId());
        ProjectMember member = new ProjectMember();
        member.setId(memberId);
        member.setProject(savedProject);
        member.setUser(currentUser);
        member.setRole(ProjectMember.Role.MANAGER);
        member.setJoinedAt(OffsetDateTime.now());

        projectMemberRepository.save(member);
    }

    @Transactional
    public void updateProject(Long workspaceId, Long projectId, UpdateProjectRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        Project project = projectRepository.findById(projectId)
                .filter(p -> p.getWorkspace().getId().equals(workspaceId))
                .filter(p -> p.getDeletedAt() == null)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án trong không gian này"));

        ProjectMemberId memberId = new ProjectMemberId(projectId, currentUser.getId());
        ProjectMember member = projectMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Bạn không phải là thành viên của dự án này"));

        if (member.getRole() != ProjectMember.Role.MANAGER) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa dự án này");
        }

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setColor(request.getColor());

        projectRepository.save(project);
    }

    @Transactional
    public void deleteProject(Long workspaceId, Long projectId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        Project project = projectRepository.findById(projectId)
                .filter(p -> p.getWorkspace().getId().equals(workspaceId))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));

        ProjectMemberId memberId = new ProjectMemberId(projectId, currentUser.getId());
        ProjectMember member = projectMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Bạn không phải thành viên dự án"));

        if (member.getRole() != ProjectMember.Role.MANAGER) {
            throw new RuntimeException("Chỉ quản lý dự án mới có quyền xóa");
        }

        project.setDeletedAt(OffsetDateTime.now());
        projectRepository.save(project);
    }
}
package com.example.doantotnghiep.service;

import com.example.doantotnghiep.dto.request.CreateProjectRequest;
import com.example.doantotnghiep.dto.request.UpdateProjectRequest;
import com.example.doantotnghiep.dto.response.*;
import com.example.doantotnghiep.entity.*;
import com.example.doantotnghiep.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;
    private final ProjectMemberRepository projectMemberRepository;

    private final ColumnRepository columnRepository;
    private final TaskRepository taskRepository;
    private final CommentRepository commentRepository;

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

    public ProjectResponseDTO getProjectDetail(Long workspaceId, Long projectId) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> p.getWorkspace().getId().equals(workspaceId))
                .filter(p -> p.getDeletedAt() == null)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));

        int taskCount = 0;
        return new ProjectResponseDTO(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getColor(),
                taskCount
        );
    }

    public List<ColumnDTO> getProjectBoard(Long projectId) {
        List<ColumnEntity> columns = columnRepository.findByProject_IdAndDeletedAtIsNullOrderByPositionAsc(projectId);
        if (columns.isEmpty()) {
            return new ArrayList<>();
        }

        List<Long> columnIds = columns.stream().map(ColumnEntity::getId).collect(Collectors.toList());

        // Lấy Task theo danh sách column ID
        List<Task> allTasks = taskRepository.findByColumn_IdInAndDeletedAtIsNullOrderByPositionAsc(columnIds);

        // Group tasks theo thuộc tính id của đối tượng column
        Map<Long, List<Task>> tasksByColumnId = allTasks.stream()
                .filter(task -> task.getColumn() != null) // Đảm bảo task có cột
                .collect(Collectors.groupingBy(task -> task.getColumn().getId()));

        return columns.stream().map(column -> {
            ColumnDTO columnDTO = new ColumnDTO();
            columnDTO.setId(column.getId());
            columnDTO.setName(column.getName());

            List<Task> columnTasks = tasksByColumnId.getOrDefault(column.getId(), new ArrayList<>());

            List<TaskDTO> taskDTOs = columnTasks.stream().map(task -> {
                TaskDTO taskDTO = new TaskDTO();
                taskDTO.setId(task.getId()); // Lấy từ BaseEntity

                // Trích xuất columnId từ đối tượng ColumnEntity
                taskDTO.setColumnId(task.getColumn().getId());

                taskDTO.setTitle(task.getTitle());
                taskDTO.setDescription(task.getDescription());

                // Ép kiểu Enum sang String ("HIGH", "MEDIUM", "LOW")
                if (task.getPriority() != null) {
                    taskDTO.setPriority(task.getPriority().name());
                }

                // Chuyển OffsetDateTime thành String để Frontend hiển thị dễ dàng
                if (task.getDueDate() != null) {
                    taskDTO.setDueDate(task.getDueDate().toString());
                }

                // Map Labels
                if (task.getLabels() != null) {
                    taskDTO.setLabels(task.getLabels().stream()
                            .map(label -> new LabelDTO(label.getId(), label.getName(), label.getColor()))
                            .collect(Collectors.toList()));
                }

                // Map Assignees
                if (task.getAssignees() != null) {
                    taskDTO.setAssignees(task.getAssignees().stream()
                            .map(user -> new AssigneeDTO(user.getId(), user.getFullName(), user.getAvatarUrl()))
                            .collect(Collectors.toList()));
                }

                taskDTO.setCommentCount(commentRepository.countByTaskId(task.getId()));

                return taskDTO;
            }).collect(Collectors.toList());

            columnDTO.setTasks(taskDTOs);
            return columnDTO;
        }).collect(Collectors.toList());
    }
}
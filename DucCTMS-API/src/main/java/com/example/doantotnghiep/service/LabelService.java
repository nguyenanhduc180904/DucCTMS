package com.example.doantotnghiep.service;

import com.example.doantotnghiep.dto.request.LabelRequest;
import com.example.doantotnghiep.dto.response.LabelResponse;
import com.example.doantotnghiep.entity.Label;
import com.example.doantotnghiep.entity.Project;
import com.example.doantotnghiep.entity.ProjectMemberId;
import com.example.doantotnghiep.entity.User;
import com.example.doantotnghiep.repository.LabelRepository;
import com.example.doantotnghiep.repository.ProjectMemberRepository;
import com.example.doantotnghiep.repository.ProjectRepository;
import com.example.doantotnghiep.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LabelService {

    private final LabelRepository labelRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;

    // Hàm phụ trợ: Kiểm tra User có phải thành viên của Dự án không
    private void validateProjectMember(Long projectId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        ProjectMemberId memberId = new ProjectMemberId(projectId, currentUser.getId());
        if (!projectMemberRepository.existsById(memberId)) {
            throw new RuntimeException("Bạn không phải là thành viên của dự án này");
        }
    }

    public List<LabelResponse> getProjectLabels(Long projectId) {
        validateProjectMember(projectId);

        List<Label> labels = labelRepository.findByProject_IdAndDeletedAtIsNullOrderByIdDesc(projectId);

        return labels.stream().map(label -> new LabelResponse(
                label.getId(),
                label.getName(),
                label.getColor(),
                label.getCreatedAt()
        )).collect(Collectors.toList());
    }

    @Transactional
    public LabelResponse createLabel(Long projectId, LabelRequest request) {
        validateProjectMember(projectId);

        Project project = projectRepository.findById(projectId)
                .filter(p -> p.getDeletedAt() == null)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));

        Label label = new Label();
        label.setProject(project);
        label.setName(request.getName());
        label.setColor(request.getColor());
        label.setCreatedAt(OffsetDateTime.now());

        Label savedLabel = labelRepository.save(label);

        return new LabelResponse(
                savedLabel.getId(),
                savedLabel.getName(),
                savedLabel.getColor(),
                savedLabel.getCreatedAt()
        );
    }

    @Transactional
    public LabelResponse updateLabel(Long projectId, Long labelId, LabelRequest request) {
        validateProjectMember(projectId);

        Label label = labelRepository.findByIdAndProject_IdAndDeletedAtIsNull(labelId, projectId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhãn hợp lệ trong dự án này"));

        label.setName(request.getName());
        label.setColor(request.getColor());
        label.setUpdatedAt(OffsetDateTime.now());

        Label updatedLabel = labelRepository.save(label);

        return new LabelResponse(
                updatedLabel.getId(),
                updatedLabel.getName(),
                updatedLabel.getColor(),
                updatedLabel.getCreatedAt()
        );
    }

    @Transactional
    public void deleteLabel(Long projectId, Long labelId) {
        validateProjectMember(projectId);

        Label label = labelRepository.findByIdAndProject_IdAndDeletedAtIsNull(labelId, projectId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhãn hợp lệ trong dự án này"));

        // Soft delete (DBML của bạn có deleted_at)
        label.setDeletedAt(OffsetDateTime.now());
        labelRepository.save(label);
    }
}
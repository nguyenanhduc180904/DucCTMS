package com.example.doantotnghiep.service;

import com.example.doantotnghiep.dto.request.InviteMemberRequest;
import com.example.doantotnghiep.dto.response.WorkspaceMemberResponseDTO;
import com.example.doantotnghiep.entity.User;
import com.example.doantotnghiep.entity.Workspace;
import com.example.doantotnghiep.entity.WorkspaceMember;
import com.example.doantotnghiep.entity.WorkspaceMemberId;
import com.example.doantotnghiep.repository.UserRepository;
import com.example.doantotnghiep.repository.WorkspaceMemberRepository;
import com.example.doantotnghiep.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkspaceMemberService {
    private final WorkspaceMemberRepository memberRepository;
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;

    public List<WorkspaceMemberResponseDTO> getMembers(Long workspaceId) {
        List<WorkspaceMember> entities = memberRepository.findAllByWorkspaceId(workspaceId);

        return entities.stream()
                .map(entity -> new WorkspaceMemberResponseDTO(
                        entity.getUser().getId(),
                        entity.getUser().getFullName(),
                        entity.getUser().getEmail(),
                        entity.getUser().getAvatarUrl(),
                        entity.getRole() != null ? entity.getRole().name() : null,
                        entity.getJoinedAt()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public void addMember(Long workspaceId, InviteMemberRequest request) {
        Workspace workspace = workspaceRepository.findByIdAndDeletedAtIsNull(workspaceId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Workspace"));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email này chưa đăng ký tài khoản hệ thống"));

        WorkspaceMemberId memberId = new WorkspaceMemberId(workspaceId, user.getId());

        if (memberRepository.existsById(memberId)) {
            throw new RuntimeException("Người dùng đã tham gia không gian làm việc này rồi");
        }

        WorkspaceMember newMember = WorkspaceMember.builder()
                .id(memberId)
                .workspace(workspace)
                .user(user)
                .role(request.getRole())
                .joinedAt(OffsetDateTime.now())
                .build();

        memberRepository.save(newMember);
    }

    @Transactional
    public void removeMember(Long workspaceId, Long userId) {
        WorkspaceMemberId memberId = new WorkspaceMemberId(workspaceId, userId);

        WorkspaceMember member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Thành viên không tồn tại trong Workspace này"));

        if (member.getRole() == WorkspaceMember.Role.OWNER) {
            throw new RuntimeException("Không thể gỡ Chủ sở hữu (OWNER) khỏi không gian làm việc");
        }

        memberRepository.deleteById(memberId);
    }

    @Transactional
    public void updateRole(Long workspaceId, Long userId, WorkspaceMember.Role newRole) {
        WorkspaceMemberId memberId = new WorkspaceMemberId(workspaceId, userId);
        WorkspaceMember member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thành viên trong hệ thống"));

        if (member.getRole() == WorkspaceMember.Role.OWNER) {
            throw new RuntimeException("Không thể thay đổi vai trò của Chủ sở hữu");
        }

        member.setRole(newRole);
        memberRepository.save(member);
    }

}

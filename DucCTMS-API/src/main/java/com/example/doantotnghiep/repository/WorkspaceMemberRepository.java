package com.example.doantotnghiep.repository;

import com.example.doantotnghiep.dto.response.WorkspaceMemberResponseDTO;
import com.example.doantotnghiep.entity.WorkspaceMember;
import com.example.doantotnghiep.entity.WorkspaceMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, WorkspaceMemberId> {
    @Query("SELECT m FROM WorkspaceMember m JOIN FETCH m.user WHERE m.workspace.id = :workspaceId")
    List<WorkspaceMember> findAllByWorkspaceId(Long workspaceId);

    boolean existsById(WorkspaceMemberId id);
}



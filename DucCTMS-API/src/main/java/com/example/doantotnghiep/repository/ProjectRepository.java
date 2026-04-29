package com.example.doantotnghiep.repository;

import com.example.doantotnghiep.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    @Query("SELECT DISTINCT p FROM Project p " +
            "LEFT JOIN ProjectMember pm ON p.id = pm.id.projectId AND pm.id.userId = :userId " +
            "WHERE p.workspace.id = :workspaceId " +
            "AND p.deletedAt IS NULL " +
            "AND (" +
            "  pm.id.userId IS NOT NULL " + // Trường hợp 1: Là thành viên project
            "  OR EXISTS (" +               // Trường hợp 2: Là Admin/Owner của Workspace
            "    SELECT 1 FROM WorkspaceMember wm " +
            "    WHERE wm.id.workspaceId = :workspaceId " +
            "    AND wm.id.userId = :userId " +
            "    AND (wm.role = 'OWNER' OR wm.role = 'ADMIN')" +
            "  )" +
            ")")
    List<Project> findMyProjects(
            @Param("workspaceId") Long workspaceId,
            @Param("userId") Long userId
    );

    Optional<Project> findByIdAndWorkspaceIdAndDeletedAtIsNull(Long id, Long workspaceId);
}
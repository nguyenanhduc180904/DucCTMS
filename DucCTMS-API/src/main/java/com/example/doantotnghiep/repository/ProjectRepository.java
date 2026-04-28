package com.example.doantotnghiep.repository;

import com.example.doantotnghiep.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    @Query("SELECT p FROM Project p " +
            "JOIN ProjectMember pm ON p.id = pm.id.projectId " +
            "WHERE p.workspace.id = :workspaceId " +
            "AND pm.id.userId = :userId " +
            "AND p.deletedAt IS NULL")
    List<Project> findMyProjects(
            @Param("workspaceId") Long workspaceId,
            @Param("userId") Long userId
    );
}
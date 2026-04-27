package com.example.doantotnghiep.repository;

import com.example.doantotnghiep.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {

    @Query("SELECT w FROM Workspace w JOIN w.members m " +
            "WHERE m.user.id = :userId " +
            "AND w.deletedAt IS NULL")
    List<Workspace> findAllByUserId(@Param("userId") Long userId);

    Optional<Workspace> findByIdAndDeletedAtIsNull(Long id);

}

package com.example.doantotnghiep.repository;

import com.example.doantotnghiep.entity.ProjectMember;
import com.example.doantotnghiep.entity.ProjectMemberId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, ProjectMemberId> {
}
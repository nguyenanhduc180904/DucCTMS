package com.example.doantotnghiep.repository;

import com.example.doantotnghiep.entity.WorkspaceMember;
import com.example.doantotnghiep.entity.WorkspaceMemberId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, WorkspaceMemberId> {}
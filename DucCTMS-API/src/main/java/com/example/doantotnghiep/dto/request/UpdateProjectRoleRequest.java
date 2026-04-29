package com.example.doantotnghiep.dto.request;

import com.example.doantotnghiep.entity.ProjectMember;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateProjectRoleRequest {
    @NotNull(message = "Vai trò không được để trống")
    private ProjectMember.Role role;
}
package com.example.doantotnghiep.dto.request;

import com.example.doantotnghiep.entity.WorkspaceMember.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChangeRoleRequest {
    @NotNull(message = "Vai trò không được để trống")
    private Role role;
}
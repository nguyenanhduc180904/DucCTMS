package com.example.doantotnghiep.dto.request;

import com.example.doantotnghiep.entity.WorkspaceMember.Role;
import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Data
public class InviteMemberRequest {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    private Role role = Role.MEMBER;
}
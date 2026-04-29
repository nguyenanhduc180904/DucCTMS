package com.example.doantotnghiep.dto.request;

import com.example.doantotnghiep.entity.ProjectMember;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddProjectMemberRequest {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    private ProjectMember.Role role = ProjectMember.Role.MEMBER;
}
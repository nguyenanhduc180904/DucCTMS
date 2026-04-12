package com.example.doantotnghiep.dto.request;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {
    @NotBlank(message = "Tên đăng nhập không được để trống")
    public String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    public String password;
}

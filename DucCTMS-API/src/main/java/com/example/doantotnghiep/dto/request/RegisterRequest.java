package com.example.doantotnghiep.dto.request;

import jakarta.validation.constraints.*;

public class RegisterRequest {
    @Email(message = "Email không đúng định dạng")
    @NotBlank(message = "Email không được để trống")
    public String email;

    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Size(min = 3, max = 20, message = "Tên đăng nhập phải từ 3-20 ký tự")
    public String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    public String password;

    @NotBlank(message = "Tên không được để trống")
    @Size(min = 3, max = 50, message = "Tên phải từ 3-50 ký tự")
    public String fullName;
}

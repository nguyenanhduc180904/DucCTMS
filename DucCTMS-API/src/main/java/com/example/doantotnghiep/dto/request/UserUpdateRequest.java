package com.example.doantotnghiep.dto.request;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {
    private String fullName;
    Boolean isActive;
    private String password; // Nếu user muốn đổi pass
}
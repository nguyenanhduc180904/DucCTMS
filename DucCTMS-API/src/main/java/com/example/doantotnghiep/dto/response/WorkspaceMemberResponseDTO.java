package com.example.doantotnghiep.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@AllArgsConstructor
public class WorkspaceMemberResponseDTO {
    private Long userId;
    private String fullName;
    private String email;
    private String avatarUrl;
    private String role;
    private OffsetDateTime joinedAt;
}
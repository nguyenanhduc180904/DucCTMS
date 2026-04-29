package com.example.doantotnghiep.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProjectMemberResponseDTO {
    private Long userId;
    private String fullName;
    private String email;
    private String avatarUrl;
    private String role; // MANAGER, MEMBER
    private OffsetDateTime joinedAt;
}
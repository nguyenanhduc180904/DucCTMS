package com.example.doantotnghiep.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDTO {
    private Long id;
    private Long userId;
    private Long actorId;
    private String actorName;
    private String actorAvatar;
    private String type;
    private Long entityId;
    private String entityType;
    private String content;
    private Boolean isRead;
    private OffsetDateTime createdAt;
}

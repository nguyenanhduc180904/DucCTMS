package com.example.doantotnghiep.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLogResponseDTO {
    private Long id;

    @JsonProperty("actor_name")
    private String actorName; // Tên người thực hiện hành động

    private String action;

    private Map<String, Object> details; // Dữ liệu JSON chi tiết hành động

    @JsonProperty("created_at")
    private String createdAt;
}
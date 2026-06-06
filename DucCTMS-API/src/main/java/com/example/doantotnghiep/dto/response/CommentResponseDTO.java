package com.example.doantotnghiep.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CommentResponseDTO {
    private Long id;
    private String user; // Tên người bình luận
    private String content;

    @JsonProperty("created_at")
    private String createdAt;
}
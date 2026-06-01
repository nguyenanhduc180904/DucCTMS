package com.example.doantotnghiep.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AssigneeDTO {
    private Long id;
    @JsonProperty("full_name")
    private String fullName;
    @JsonProperty("avatar_url")
    private String avatarUrl;
}
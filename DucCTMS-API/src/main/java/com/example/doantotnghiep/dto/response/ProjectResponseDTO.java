package com.example.doantotnghiep.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProjectResponseDTO {
    private Long id;
    private String name;
    private String description;
    private String color;
    private long taskCount;
}
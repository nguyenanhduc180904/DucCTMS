package com.example.doantotnghiep.dto.request;

import lombok.Data;

@Data
public class UpdateProjectRequest {
    private String name;
    private String description;
    private String color;
}
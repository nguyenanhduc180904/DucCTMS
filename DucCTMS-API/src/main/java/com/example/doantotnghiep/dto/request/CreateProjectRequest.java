package com.example.doantotnghiep.dto.request;

import lombok.Data;

@Data
public class CreateProjectRequest {
    private String name;
    private String description;
    private String color;
}
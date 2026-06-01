package com.example.doantotnghiep.dto.request;

import lombok.Data;

@Data
public class TaskRequestDTO {
    private Long columnId;
    private String title;
    private String description;
    private String priority; // Nhận "LOW", "MEDIUM", "HIGH"
    private String dueDate;  // Nhận chuỗi ISO 8601 từ React DatePicker
}
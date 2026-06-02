package com.example.doantotnghiep.dto.request;

import lombok.Data;

@Data
public class TaskReorderRequest {
    private Long id;
    private Long columnId; // Cột chứa task hiện tại
    private Integer position; // Vị trí mới
}
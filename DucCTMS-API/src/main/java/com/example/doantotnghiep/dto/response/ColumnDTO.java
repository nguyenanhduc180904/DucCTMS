package com.example.doantotnghiep.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ColumnDTO {
    private Long id;
    private String name;
    private List<TaskDTO> tasks = new ArrayList<>();
}
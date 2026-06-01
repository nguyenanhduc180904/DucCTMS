package com.example.doantotnghiep.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TaskDTO {
    private Long id;
    @JsonProperty("column_id")
    private Long columnId;
    private String title;
    private String description;
    private String priority;
    @JsonProperty("due_date")
    private String dueDate; // Có thể dùng LocalDate và parse thành chuỗi
    private List<LabelDTO> labels = new ArrayList<>();
    private List<AssigneeDTO> assignees = new ArrayList<>();
    @JsonProperty("comment_count")
    private Integer commentCount;
}
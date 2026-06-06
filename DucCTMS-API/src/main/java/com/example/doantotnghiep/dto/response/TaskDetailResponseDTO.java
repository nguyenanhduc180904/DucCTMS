package com.example.doantotnghiep.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
public class TaskDetailResponseDTO {
    private Long id;
    private String title;
    private String description;
    private String priority;

    @JsonProperty("due_date")
    private String dueDate;

    @JsonProperty("column_name")
    private String columnName;

    private List<LabelDTO> labels;

    private List<AssigneeResponseDTO> assignees;

    private List<CommentResponseDTO> comments;
}
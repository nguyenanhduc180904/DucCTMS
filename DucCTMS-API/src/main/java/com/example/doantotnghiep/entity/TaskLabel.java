package com.example.doantotnghiep.entity;

import lombok.*;
import jakarta.persistence.*;

@Entity
@Table(name = "task_labels")
@Getter @Setter
public class TaskLabel {

    @EmbeddedId
    private TaskLabelId id;

    @ManyToOne
    @MapsId("taskId")
    private Task task;

    @ManyToOne
    @MapsId("labelId")
    private Label label;
}

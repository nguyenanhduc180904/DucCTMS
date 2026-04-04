package com.example.doantotnghiep.entity;

import lombok.*;
import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "task_assignees")
@Getter @Setter
public class TaskAssignee {

    @EmbeddedId
    private TaskAssigneeId id;

    @ManyToOne
    @MapsId("taskId")
    private Task task;

    @ManyToOne
    @MapsId("userId")
    private User user;

    private OffsetDateTime assignedAt = OffsetDateTime.now();
}
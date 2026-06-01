package com.example.doantotnghiep.entity;

import lombok.*;
import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tasks")
@Getter @Setter
public class Task extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "column_id")
    private ColumnEntity column;

    @Column(nullable = false)
    private String title;

    private String description;

    @Enumerated(EnumType.STRING)
    private Priority priority = Priority.MEDIUM;

    private Integer position;

    private OffsetDateTime dueDate;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    public enum Priority {
        LOW, MEDIUM, HIGH
    }

    // Thêm vào bên trong class Task
    @ManyToMany
    @JoinTable(
            name = "task_labels",
            joinColumns = @JoinColumn(name = "task_id"),
            inverseJoinColumns = @JoinColumn(name = "label_id")
    )
    private List<Label> labels = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "task_assignees",
            joinColumns = @JoinColumn(name = "task_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> assignees = new ArrayList<>();
}
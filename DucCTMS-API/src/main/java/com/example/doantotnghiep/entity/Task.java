package com.example.doantotnghiep.entity;

import lombok.*;
import jakarta.persistence.*;

import java.time.OffsetDateTime;

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
}
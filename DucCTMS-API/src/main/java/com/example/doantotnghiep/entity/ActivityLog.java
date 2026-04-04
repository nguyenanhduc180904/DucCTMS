package com.example.doantotnghiep.entity;

import lombok.*;
import jakarta.persistence.*;

@Entity
@Table(name = "activity_logs")
@Getter @Setter
public class ActivityLog extends BaseEntity {

    @ManyToOne
    private Project project;

    @ManyToOne
    private Task task;

    @ManyToOne
    private User user;

    private String action;

    @Column(columnDefinition = "jsonb")
    private String details;
}
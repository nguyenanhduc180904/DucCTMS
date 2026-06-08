package com.example.doantotnghiep.entity;

import lombok.*;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;

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

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> details;
}
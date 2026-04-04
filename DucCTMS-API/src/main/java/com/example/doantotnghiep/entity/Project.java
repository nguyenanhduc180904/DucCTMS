package com.example.doantotnghiep.entity;

import lombok.*;
import jakarta.persistence.*;

@Entity
@Table(name = "projects")
@Getter @Setter
public class Project extends BaseEntity {

    @ManyToOne
    private Workspace workspace;

    @Column(nullable = false)
    private String name;

    private String description;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;
}
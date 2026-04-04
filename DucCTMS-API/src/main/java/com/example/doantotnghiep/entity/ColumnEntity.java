package com.example.doantotnghiep.entity;

import lombok.*;
import jakarta.persistence.*;

@Entity
@Table(name = "columns")
@Getter @Setter
public class ColumnEntity extends BaseEntity {

    @ManyToOne
    private Project project;

    @Column(nullable = false)
    private String name;

    private Integer position;
}
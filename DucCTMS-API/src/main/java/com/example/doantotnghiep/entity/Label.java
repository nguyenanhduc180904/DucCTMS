package com.example.doantotnghiep.entity;

import lombok.*;
import jakarta.persistence.*;

@Entity
@Table(name = "labels")
@Getter @Setter
public class Label extends BaseEntity {

    @ManyToOne
    private Project project;

    private String name;

    private String color;
}
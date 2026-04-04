package com.example.doantotnghiep.entity;

import lombok.*;
import jakarta.persistence.*;

@Entity
@Table(name = "comments")
@Getter @Setter
public class Comment extends BaseEntity {

    @ManyToOne
    private Task task;

    @ManyToOne
    private User user;

    @Column(nullable = false)
    private String content;
}
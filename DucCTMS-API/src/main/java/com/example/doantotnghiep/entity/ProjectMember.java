package com.example.doantotnghiep.entity;

import lombok.*;
import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "project_members")
@Getter @Setter
public class ProjectMember {

    @EmbeddedId
    private ProjectMemberId id;

    @ManyToOne
    @MapsId("projectId")
    private Project project;

    @ManyToOne
    @MapsId("userId")
    private User user;

    @Enumerated(EnumType.STRING)
    private Role role;

    private OffsetDateTime joinedAt = OffsetDateTime.now();

    public enum Role {
        MANAGER, MEMBER
    }
}
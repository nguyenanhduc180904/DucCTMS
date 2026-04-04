package com.example.doantotnghiep.entity;

import lombok.*;
import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "workspace_members")
@Getter @Setter
public class WorkspaceMember {

    @EmbeddedId
    private WorkspaceMemberId id;

    @ManyToOne
    @MapsId("workspaceId")
    private Workspace workspace;

    @ManyToOne
    @MapsId("userId")
    private User user;

    @Enumerated(EnumType.STRING)
    private Role role;

    private OffsetDateTime joinedAt = OffsetDateTime.now();

    public enum Role {
        OWNER, ADMIN, MEMBER
    }
}
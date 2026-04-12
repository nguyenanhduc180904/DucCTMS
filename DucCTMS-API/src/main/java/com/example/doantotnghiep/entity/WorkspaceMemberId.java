package com.example.doantotnghiep.entity;

import lombok.*;
import jakarta.persistence.*;

import java.io.Serializable;

@Embeddable
@Data
@AllArgsConstructor
@NoArgsConstructor
public class WorkspaceMemberId implements Serializable {
    private Long workspaceId;
    private Long userId;
}
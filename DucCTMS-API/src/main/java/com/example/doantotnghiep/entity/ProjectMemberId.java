package com.example.doantotnghiep.entity;

import lombok.*;
import jakarta.persistence.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
public class ProjectMemberId implements Serializable {
    private Long projectId;
    private Long userId;
}
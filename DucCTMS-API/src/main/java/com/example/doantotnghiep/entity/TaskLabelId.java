package com.example.doantotnghiep.entity;

import lombok.*;
import jakarta.persistence.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
public class TaskLabelId implements Serializable {
    private Long taskId;
    private Long labelId;
}
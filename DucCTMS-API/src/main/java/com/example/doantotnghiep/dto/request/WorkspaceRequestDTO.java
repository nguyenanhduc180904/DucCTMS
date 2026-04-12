package com.example.doantotnghiep.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceRequestDTO {

    @NotBlank(message = "Tên workspace không được để trống")
    @Size(min = 3, max = 100, message = "Tên workspace phải từ 3 đến 100 ký tự")
    private String name;

    @Size(max = 255, message = "Mô tả không được vượt quá 255 ký tự")
    private String description;
}
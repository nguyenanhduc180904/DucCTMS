package com.example.doantotnghiep.controller;

import com.example.doantotnghiep.dto.request.WorkspaceRequestDTO;
import com.example.doantotnghiep.dto.response.WorkspaceResponseDTO;
import com.example.doantotnghiep.entity.Workspace;
import com.example.doantotnghiep.service.WorkspaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    @GetMapping("/mine")
    public ResponseEntity<List<WorkspaceResponseDTO>> getMyWorkspaces() {
        List<WorkspaceResponseDTO> workspaces = workspaceService.getMyWorkspaces();
        return ResponseEntity.ok(workspaces);
    }

    @PostMapping
    public ResponseEntity<Workspace> addWorkspace(@Valid @RequestBody WorkspaceRequestDTO dto) {
        Workspace newWorkspace = workspaceService.createWorkspace(dto);
        return new ResponseEntity<>(newWorkspace, HttpStatus.CREATED);
    }
}
package com.example.doantotnghiep.controller;
import com.example.doantotnghiep.dto.request.UserUpdateRequest;
import com.example.doantotnghiep.dto.response.UserResponse;
import com.example.doantotnghiep.entity.User;
import com.example.doantotnghiep.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getProfile() {
        return ResponseEntity.ok(userService.getMyProfile());
    }

    @PutMapping(value = "/profile/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updateProfile(
            @PathVariable Long id,
            @RequestPart("data") UserUpdateRequest request,
            @RequestPart(value = "avatar", required = false) MultipartFile avatar) {

        return ResponseEntity.ok(userService.updateProfile(id, request, avatar));
    }
}
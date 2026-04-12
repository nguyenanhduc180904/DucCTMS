package com.example.doantotnghiep.controller;

import com.example.doantotnghiep.dto.request.LoginRequest;
import com.example.doantotnghiep.dto.request.RegisterRequest;
import com.example.doantotnghiep.dto.response.JwtResponse;
import com.example.doantotnghiep.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok(Map.of("message", "Đăng ký thành công"));
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
            String jwt = authService.login(loginRequest.username, loginRequest.password);
            return ResponseEntity.ok(new JwtResponse(jwt));
    }
}
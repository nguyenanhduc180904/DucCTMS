package com.example.doantotnghiep.service;

import com.example.doantotnghiep.config.JwtUtils;
import com.example.doantotnghiep.dto.request.RegisterRequest;
import com.example.doantotnghiep.entity.User;
import com.example.doantotnghiep.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    @Autowired JwtUtils jwtUtils;
    @Autowired UserRepository userRepository;
    @Autowired PasswordEncoder passwordEncoder;

    public void register(RegisterRequest request) {

        // check email tồn tại
        if (userRepository.findByEmail(request.email).isPresent()) {
            throw new RuntimeException("Email đã tồn tại");
        }

        // check username tồn tại
        if (userRepository.findByUsername(request.username).isPresent()) {
            throw new RuntimeException("Username đã tồn tại");
        }

        // tạo user
        User user = new User();
        user.setEmail(request.email);
        user.setUsername(request.username);
        user.setFullName(request.fullName);
        user.setPasswordHash(passwordEncoder.encode(request.password));
        user.setIsActive(true);
        userRepository.save(user);
    }

    public String login(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại trên hệ thống!"));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu bạn nhập không đúng, vui lòng thử lại.");
        }

        return jwtUtils.generateJwtToken(username);
    }
}
package com.example.doantotnghiep.service;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    // Thư mục lưu trữ ảnh (có thể cấu hình trong application.properties)
    private final String uploadDir = "uploads/";

    public String saveFile(MultipartFile file) {
        try {
            // 1. Tạo thư mục nếu chưa tồn tại
            Path copyLocation = Paths.get(uploadDir);
            if (!Files.exists(copyLocation)) {
                Files.createDirectories(copyLocation);
            }

            // 2. Tạo tên file duy nhất để tránh trùng lặp (UUID + tên gốc)
            String fileName = UUID.randomUUID().toString() + "_" + StringUtils.cleanPath(file.getOriginalFilename());

            // 3. Lưu file vào thư mục
            Path filePath = copyLocation.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Trả về đường dẫn để lưu vào Database
            return "/images/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Could not store file. Error: " + e.getMessage());
        }
    }
}
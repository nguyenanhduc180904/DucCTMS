package com.example.doantotnghiep.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**") // Cho phép tất cả các đường dẫn bắt đầu bằng /api
                        .allowedOrigins("http://localhost:5173", "http://localhost:3000") // Port của React (Vite là 5173, CRA là 3000)
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Các phương thức cho phép
                        .allowedHeaders("*") // Cho phép tất cả các header (quan trọng để gửi Token)
                        .allowCredentials(true); // Cho phép gửi kèm Cookie/Auth header nếu cần
            }

            @Override
            public void addResourceHandlers(ResourceHandlerRegistry registry) {
                // Map URL /images/** vào thư mục vật lý uploads/
                registry.addResourceHandler("/images/**")
                        .addResourceLocations("file:uploads/");
            }
        };
    }
}
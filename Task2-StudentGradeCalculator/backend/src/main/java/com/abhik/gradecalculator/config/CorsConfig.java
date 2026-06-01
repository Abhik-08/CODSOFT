package com.abhik.gradecalculator.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(
                        "https://codsoft-nt15.vercel.app",
                        "https://codsoft-nt15-774mjfojt-abhik-mukherjees-projects.vercel.app",
                        "https://codsoft-nt15-git-main-abhik-mukherjees-projects.vercel.app",
                        "https://codsoft-nt15-*.vercel.app",
                        "http://localhost:5173",
                        "http://127.0.0.1:5173",
                        "http://localhost:5174",
                        "http://127.0.0.1:5174"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD")
                .allowedHeaders("Authorization", "Content-Type", "Accept", "X-Requested-With")
                .exposedHeaders("Authorization")
                .allowCredentials(true);
    }
}

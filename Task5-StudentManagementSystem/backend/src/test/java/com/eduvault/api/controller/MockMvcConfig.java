package com.eduvault.api.controller;

import org.springframework.boot.test.autoconfigure.web.servlet.MockMvcBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

@Configuration
public class MockMvcConfig {

    @Bean
    public MockMvcBuilderCustomizer mockMvcBuilderCustomizer() {
        return builder -> {
            MockHttpServletRequestBuilder defaultRequest = get("/api").contextPath("/api");
            builder.defaultRequest(defaultRequest);
        };
    }
}

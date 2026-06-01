package com.abhik.gradecalculator.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

        @Bean
        public OpenAPI customOpenAPI() {
                return new OpenAPI()
                                .info(new Info()
                                                .title("Student Grade Calculator API")
                                                .version("1.0.0")
                                                .description("Professional RESTful APIs for student performance evaluations, consistency calculations, and detailed academic insights.")
                                                .contact(new Contact()
                                                                .name("Abhik")
                                                                .email("abhik@example.com")));
        }
}

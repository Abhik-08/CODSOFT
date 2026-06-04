package com.abhik.currencyconverter.config;

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
                        .title("Currency Converter API")
                        .version("1.0.0")
                        .description("Professional RESTful APIs for real-time currency conversion, exchange rate querying, and historical conversion tracking.")
                        .contact(new Contact()
                                .name("Abhik")
                                .email("abhik@example.com")));
    }
}
